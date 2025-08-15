import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, title, message, type, related_id }: NotificationEmailRequest = await req.json();

    console.log("Sending notification email:", { user_id, title, type });

    // Get user email from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user_id)
      .single();

    if (profileError) {
      throw new Error(`Failed to get user profile: ${profileError.message}`);
    }

    // Get user email from auth.users (we need service role for this)
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !user?.email) {
      throw new Error(`Failed to get user email: ${userError?.message || 'No email found'}`);
    }

    // Determine email template based on notification type
    const getEmailContent = (type: string, title: string, message: string) => {
      const baseUrl = "https://vjdcstouchofifbdanjx.supabase.co"; // You can customize this
      
      switch (type) {
        case 'booking':
          return {
            subject: `Booking Update: ${title}`,
            html: `
              <h1>Booking Update</h1>
              <p>Hello ${profile?.full_name || 'there'},</p>
              <p>${message}</p>
              <div style="margin: 20px 0;">
                <a href="${baseUrl}/my-bookings" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View My Bookings</a>
              </div>
              <p>Best regards,<br>The Kolab Team</p>
            `
          };
        case 'event':
          return {
            subject: `Event Update: ${title}`,
            html: `
              <h1>Event Update</h1>
              <p>Hello ${profile?.full_name || 'there'},</p>
              <p>${message}</p>
              <div style="margin: 20px 0;">
                <a href="${baseUrl}/" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Events</a>
              </div>
              <p>Best regards,<br>The Kolab Team</p>
            `
          };
        case 'message':
          return {
            subject: `New Message: ${title}`,
            html: `
              <h1>New Message</h1>
              <p>Hello ${profile?.full_name || 'there'},</p>
              <p>${message}</p>
              <div style="margin: 20px 0;">
                <a href="${baseUrl}/messages" style="background-color: #6f42c1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Messages</a>
              </div>
              <p>Best regards,<br>The Kolab Team</p>
            `
          };
        case 'moderation':
          return {
            subject: `Moderation Update: ${title}`,
            html: `
              <h1>Moderation Update</h1>
              <p>Hello ${profile?.full_name || 'there'},</p>
              <p>${message}</p>
              <div style="margin: 20px 0;">
                <a href="${baseUrl}/settings" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Settings</a>
              </div>
              <p>Best regards,<br>The Kolab Team</p>
            `
          };
        default:
          return {
            subject: title,
            html: `
              <h1>${title}</h1>
              <p>Hello ${profile?.full_name || 'there'},</p>
              <p>${message}</p>
              <div style="margin: 20px 0;">
                <a href="${baseUrl}/" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit Kolab</a>
              </div>
              <p>Best regards,<br>The Kolab Team</p>
            `
          };
      }
    };

    const emailContent = getEmailContent(type, title, message);

    const emailResponse = await resend.emails.send({
      from: "Kolab <notifications@resend.dev>",
      to: [user.email],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailResponse.data?.id,
        message: "Notification email sent successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);