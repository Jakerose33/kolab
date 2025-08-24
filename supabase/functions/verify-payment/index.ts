import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

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
    if (!user) throw new Error("User not authenticated");

    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id is required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    logStep("Session retrieved", { sessionId: session.id, paymentStatus: session.payment_status });

    // Find the order
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("stripe_session_id", session_id)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    let updateData: any = {};
    let bookingUpdateData: any = {};

    if (session.payment_status === "paid") {
      updateData = {
        status: "paid",
        payment_intent_id: session.payment_intent
      };
      bookingUpdateData = {
        payment_status: "paid",
        status: "confirmed" // Automatically confirm booking when paid
      };
      logStep("Payment successful", { orderId: order.id });
    } else if (session.payment_status === "unpaid") {
      updateData = { status: "failed" };
      bookingUpdateData = { payment_status: "failed" };
      logStep("Payment failed", { orderId: order.id });
    }

    // Update order status
    const { error: updateError } = await supabaseClient
      .from("orders")
      .update(updateData)
      .eq("id", order.id);

    if (updateError) {
      throw new Error("Failed to update order status");
    }

    // Update booking status
    const { error: bookingUpdateError } = await supabaseClient
      .from("venue_bookings")
      .update(bookingUpdateData)
      .eq("id", order.venue_booking_id);

    if (bookingUpdateError) {
      throw new Error("Failed to update booking status");
    }

    // If payment was successful, create payout record for venue owner
    if (session.payment_status === "paid" && order.venue_owner_amount > 0) {
      const { data: booking } = await supabaseClient
        .from("venue_bookings")
        .select("venue:venues(id, owner_id)")
        .eq("id", order.venue_booking_id)
        .single();

      if (booking?.venue) {
        await supabaseClient
          .from("venue_payouts")
          .insert({
            venue_id: booking.venue.id,
            owner_id: booking.venue.owner_id,
            order_id: order.id,
            amount: order.venue_owner_amount,
            status: "pending"
          });
        
        logStep("Payout record created", { venueId: booking.venue.id, amount: order.venue_owner_amount });
      }
    }

    return new Response(JSON.stringify({ 
      payment_status: session.payment_status,
      order_status: updateData.status || order.status
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});