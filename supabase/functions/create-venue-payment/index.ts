import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-VENUE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Use service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { venue_booking_id } = await req.json();
    if (!venue_booking_id) throw new Error("venue_booking_id is required");

    // Get venue booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from("venue_bookings")
      .select(`
        *,
        venue:venues (
          id, name, hourly_rate, owner_id
        )
      `)
      .eq("id", venue_booking_id)
      .eq("user_id", user.id)
      .single();

    if (bookingError || !booking) {
      throw new Error("Venue booking not found or access denied");
    }

    logStep("Booking found", { bookingId: booking.id, venueId: booking.venue.id });

    // Calculate payment amount
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);
    const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
    const venueAmount = Math.round(hours * (booking.venue.hourly_rate || 0) * 100); // Convert to cents
    const platformFee = Math.round(venueAmount * 0.1); // 10% platform fee
    const totalAmount = venueAmount + platformFee;

    logStep("Payment calculation", { hours, venueAmount, platformFee, totalAmount });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Venue Booking: ${booking.venue.name}`,
              description: `${hours} hours booking from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
              metadata: {
                venue_booking_id: venue_booking_id,
                venue_id: booking.venue.id,
                hours: hours.toString()
              }
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/bookings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/bookings`,
      metadata: {
        venue_booking_id: venue_booking_id,
        user_id: user.id,
        venue_id: booking.venue.id,
        venue_owner_id: booking.venue.owner_id
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Create order record
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        user_id: user.id,
        venue_booking_id: venue_booking_id,
        stripe_session_id: session.id,
        stripe_customer_id: customerId,
        amount: totalAmount,
        booking_fee: platformFee,
        venue_owner_amount: venueAmount,
        status: "pending"
      })
      .select()
      .single();

    if (orderError) {
      logStep("Error creating order", { error: orderError });
      throw new Error("Failed to create order record");
    }

    // Update booking with payment info
    await supabaseClient
      .from("venue_bookings")
      .update({
        payment_status: "pending",
        stripe_session_id: session.id
      })
      .eq("id", venue_booking_id);

    logStep("Order created and booking updated", { orderId: order.id });

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id,
      order_id: order.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-venue-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});