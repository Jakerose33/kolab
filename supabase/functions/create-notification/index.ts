import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateNotificationRequest {
  user_id: string;
  actor_id: string;
  title: string;
  message: string;
  type: string;
  related_id?: string;
  action_type?: string;
  target_type?: string;
  metadata?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      user_id,
      actor_id,
      title,
      message,
      type,
      related_id,
      action_type = 'notification',
      target_type = 'general',
      metadata = {}
    }: CreateNotificationRequest = await req.json();

    // Validate required fields
    if (!user_id || !actor_id || !title || !message || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Creating notification:", { user_id, actor_id, title, type, action_type });

    // Check user notification preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // If user has preferences, check if this type is enabled
    let shouldNotify = true;
    if (preferences) {
      switch (type) {
        case 'booking':
          shouldNotify = preferences.booking_confirmations;
          break;
        case 'event':
          shouldNotify = preferences.event_updates;
          break;
        case 'message':
          shouldNotify = preferences.new_messages;
          break;
        case 'reminder':
          shouldNotify = preferences.event_reminders;
          break;
        case 'moderation':
          shouldNotify = preferences.moderation_updates;
          break;
        default:
          shouldNotify = preferences.push_enabled;
      }
    }

    if (!shouldNotify) {
      console.log("Notification disabled by user preferences");
      return new Response(
        JSON.stringify({ message: "Notification disabled by user preferences" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Use the database function to create notification with activity
    const { data, error } = await supabase.rpc('create_notification_with_activity', {
      p_user_id: user_id,
      p_actor_id: actor_id,
      p_title: title,
      p_message: message,
      p_type: type,
      p_related_id: related_id,
      p_action_type: action_type,
      p_target_type: target_type
    });

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log("Notification created successfully:", data);

    // If email is enabled and this is an important notification, trigger email
    if (preferences?.email_enabled && ['booking', 'event', 'moderation'].includes(type)) {
      try {
        // Trigger email notification
        await supabase.functions.invoke('send-notification-email', {
          body: {
            user_id,
            title,
            message,
            type,
            related_id
          }
        });
        console.log("Email notification triggered");
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification_id: data,
        message: "Notification created successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in create-notification function:", error);
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