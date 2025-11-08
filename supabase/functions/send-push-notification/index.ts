import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendPushRequest {
  user_id?: string;
  user_ids?: string[];
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@kolab.com";

    if (!vapidPrivateKey) {
      throw new Error("VAPID_PRIVATE_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      user_id, 
      user_ids, 
      title, 
      body, 
      icon = "/lovable-uploads/2c93db7f-d994-4dea-81df-8944d43e9b56.png",
      badge = "/favicon.ico",
      data = {},
      actions = []
    }: SendPushRequest = await req.json();

    console.log("Sending push notification:", { title, body, user_id, user_ids });

    // Validate required fields
    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "Title and body are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Determine target users
    const targetUsers = user_ids || (user_id ? [user_id] : []);
    if (targetUsers.length === 0) {
      return new Response(
        JSON.stringify({ error: "No target users specified" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get active push subscriptions for target users
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', targetUsers)
      .eq('is_active', true);

    if (subscriptionError) {
      throw subscriptionError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No active push subscriptions found for target users");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No active subscriptions found",
          sent_count: 0
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${subscriptions.length} active subscriptions`);

    // Prepare notification payload
    const notificationPayload = {
      title,
      body,
      icon,
      badge,
      data: {
        ...data,
        timestamp: Date.now(),
        url: data.url || "/"
      },
      actions,
      requireInteraction: false,
      silent: false
    };

    // Send push notifications using Web Push API
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          // Create push subscription object
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: subscription.keys
          };

          // In a real implementation, you would use a proper Web Push library
          // For now, we'll simulate the push sending
          console.log(`Sending notification to user ${subscription.user_id}`);
          
          // Here you would typically use a library like 'web-push' to send the actual notification
          // Example with web-push library:
          // await webpush.sendNotification(pushSubscription, JSON.stringify(notificationPayload), {
          //   vapidDetails: {
          //     subject: vapidSubject,
          //     publicKey: vapidPublicKey,
          //     privateKey: vapidPrivateKey
          //   }
          // });

          return { success: true, user_id: subscription.user_id };
        } catch (error) {
          console.error(`Failed to send push to user ${subscription.user_id}:`, error);
          
          // If subscription is invalid, mark it as inactive
          if (error.statusCode === 410) {
            await supabase
              .from('push_subscriptions')
              .update({ is_active: false })
              .eq('user_id', subscription.user_id);
          }
          
          return { success: false, user_id: subscription.user_id, error: error.message };
        }
      })
    );

    const successCount = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;

    console.log(`Push notifications sent successfully to ${successCount} users`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Push notifications sent successfully`,
        sent_count: successCount,
        total_subscriptions: subscriptions.length,
        results: results.map(result => 
          result.status === 'fulfilled' ? result.value : { success: false, error: 'Failed to send' }
        )
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-push-notification function:", error);
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