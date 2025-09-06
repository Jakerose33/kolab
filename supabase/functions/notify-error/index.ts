import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Received error report:", payload);

    // Import Resend dynamically
    const { Resend } = await import("npm:resend@2.0.0");
    
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const errorEmailTo = Deno.env.get("ERROR_EMAIL_TO") || "jakerose800@gmail.com";

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not found");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const resend = new Resend(resendApiKey);
    
    const subject = `Kolab error: ${String(payload?.message ?? 'Unknown').slice(0, 120)}`;
    const emailBody = `Error Report from Kolab App

Timestamp: ${payload.ts}
URL: ${payload.url}
Source: ${payload.source}
Severity: ${payload.severity}

Error Message:
${payload.message}

Stack Trace:
${payload.stack || 'Not available'}

Browser Info:
- User Agent: ${payload.userAgent}
- Viewport: ${payload.viewport?.w}x${payload.viewport?.h}
- Screen: ${payload.screen?.w}x${payload.screen?.h}
- Session ID: ${payload.sessionId}
- Fingerprint: ${payload.fingerprint}

Full Payload:
${JSON.stringify(payload, null, 2)}`;

    const emailResponse = await resend.emails.send({
      from: "Kolab Errors <onboarding@resend.dev>",
      to: [errorEmailTo],
      subject: subject,
      text: emailBody,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ ok: true, emailId: emailResponse.data?.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error("Error in notify-error function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to process error report",
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