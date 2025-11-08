import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ErrorReportNotification {
  reportId: string;
  title: string;
  severity: string;
  userEmail?: string;
  description?: string;
  url: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { reportId, title, severity, userEmail, description, url }: ErrorReportNotification = await req.json();

    // For now, we'll just log the error report
    // In production, you'd want to integrate with your email service (Resend, etc.)
    console.log("Error Report Received:", {
      reportId,
      title,
      severity,
      userEmail,
      description: description?.substring(0, 100),
      url,
      timestamp: new Date().toISOString(),
    });

    // You could also store this in a notifications table or send to external services
    // Example: Send to Slack, Discord, or email service

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Error report notification processed" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error("Error processing error report notification:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to process error report notification",
        details: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);