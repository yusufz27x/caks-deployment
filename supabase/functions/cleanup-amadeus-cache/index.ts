import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting City cache cleanup...')
    const startTime = Date.now()

    // Delete expired cache entries
    const { data, error } = await supabaseClient
      .from('city_cache')
      .delete()
      .lt('expires_at', new Date().toISOString())

    if (error) {
      console.error('Error during cache cleanup:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    // Get count of remaining active entries
    const { count: activeCount } = await supabaseClient
      .from('city_cache')
      .select('*', { count: 'exact', head: true })
      .gte('expires_at', new Date().toISOString())

    // Log the cleanup operation (optional)
    await supabaseClient
      .from('city_cache_cleanup_logs')
      .insert({
        cleanup_date: new Date().toISOString(),
        deleted_entries: data?.length || 0,
        cleanup_duration_ms: duration
      })

    const result = {
      success: true,
      message: 'Cache cleanup completed successfully',
      statistics: {
        deletedEntries: data?.length || 0,
        activeEntries: activeCount || 0,
        cleanupDuration: `${duration}ms`,
        cleanupTime: new Date().toISOString()
      }
    }

    console.log('Cache cleanup completed:', result.statistics)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error during cache cleanup:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error during cache cleanup' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 