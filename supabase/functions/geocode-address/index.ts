import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { address } = await req.json();

    if (!address) {
      return new Response(
        JSON.stringify({ error: 'Address is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Geocoding address:', address);

    // Use OpenStreetMap Nominatim API for geocoding (free and reliable)
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`;
    
    const response = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'Kolab-Events-Platform/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      console.log('No geocoding results found for address:', address);
      return new Response(
        JSON.stringify({ 
          latitude: null, 
          longitude: null, 
          geocoded: false,
          message: 'Address not found' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = results[0];
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);

    console.log('Geocoding successful:', { latitude, longitude, address });

    // Extract address components for better storage
    const addressComponents = {
      latitude,
      longitude,
      geocoded: true,
      city: result.address?.city || result.address?.town || result.address?.village,
      region: result.address?.state || result.address?.county,
      country: result.address?.country,
      formatted_address: result.display_name
    };

    return new Response(
      JSON.stringify(addressComponents),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Geocoding error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Geocoding failed', 
        message: error.message,
        latitude: null,
        longitude: null,
        geocoded: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});