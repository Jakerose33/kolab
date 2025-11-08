import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const { url, path, ua, context, timestamp } = await req.json();

    // Create admin Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insert into error_reports table
    const { error } = await supabase
      .from('error_reports')
      .insert({
        error_type: 'image_fallback',
        error_message: `Image failed to load: ${url}`,
        stack_trace: `Path: ${path}, Context: ${context || 'unknown'}`,
        user_agent: ua,
        page_url: path,
        severity: 'low',
        additional_data: {
          failed_url: url,
          page_path: path,
          context: context,
          timestamp: timestamp
        }
      });

    if (error) {
      console.error('Failed to log image fallback:', error);
      return new Response('Failed to log', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    return new Response('Logged', { 
      status: 200, 
      headers: corsHeaders 
    });
  } catch (error) {
    console.error('Error in log-img-fallback:', error);
    return new Response('Server error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});