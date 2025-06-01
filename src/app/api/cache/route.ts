import { NextRequest, NextResponse } from 'next/server';
import { cleanExpiredCache, clearAllCache } from '@/lib/amadeusCache';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Get cache statistics
      const { data, error } = await supabase
        .from('amadeus_cache')
        .select('endpoint, created_at, expires_at')
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch cache stats' }, { status: 500 });
      }

      const now = new Date();
      const stats = {
        total: data?.length || 0,
        expired: data?.filter(item => new Date(item.expires_at) < now).length || 0,
        active: data?.filter(item => new Date(item.expires_at) >= now).length || 0,
        byEndpoint: data?.reduce((acc, item) => {
          acc[item.endpoint] = (acc[item.endpoint] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {}
      };

      return NextResponse.json(stats);
    }

    return NextResponse.json({ error: 'Invalid action. Use ?action=stats' }, { status: 400 });
  } catch (error) {
    console.error('Error in cache GET endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'clear') {
      await clearAllCache();
      return NextResponse.json({ 
        success: true,
        message: 'All cache cleared successfully',
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'cleanup') {
      const startTime = Date.now();
      
      // Get count before cleanup
      const { count: beforeCount } = await supabase
        .from('amadeus_cache')
        .select('*', { count: 'exact', head: true });

      // Get expired count
      const { count: expiredCount } = await supabase
        .from('amadeus_cache')
        .select('*', { count: 'exact', head: true })
        .lt('expires_at', new Date().toISOString());

      // Perform cleanup
      await cleanExpiredCache();
      
      // Get count after cleanup
      const { count: afterCount } = await supabase
        .from('amadeus_cache')
        .select('*', { count: 'exact', head: true });

      const duration = Date.now() - startTime;
      const deletedCount = (beforeCount || 0) - (afterCount || 0);

      // Log the cleanup operation
      try {
        await supabase
          .from('amadeus_cache_cleanup_logs')
          .insert({
            cleanup_date: new Date().toISOString(),
            deleted_entries: deletedCount,
            cleanup_duration_ms: duration
          });
      } catch (logError) {
        console.warn('Failed to log cleanup operation:', logError);
      }

      return NextResponse.json({ 
        success: true,
        message: 'Expired cache entries cleaned up successfully',
        statistics: {
          deletedEntries: deletedCount,
          remainingEntries: afterCount || 0,
          expiredFound: expiredCount || 0,
          cleanupDuration: `${duration}ms`,
          timestamp: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action. Use "clear" or "cleanup"' }, { status: 400 });
  } catch (error) {
    console.error('Error in cache POST endpoint:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error during cache operation',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Optional: Add a PUT endpoint for automatic cleanup based on time intervals
export async function PUT(request: NextRequest) {
  try {
    // Check if cleanup should run based on last cleanup time
    const { data: lastCleanup } = await supabase
      .from('amadeus_cache_cleanup_logs')
      .select('cleanup_date')
      .order('cleanup_date', { ascending: false })
      .limit(1)
      .single();

    const now = new Date();
    const lastCleanupDate = lastCleanup ? new Date(lastCleanup.cleanup_date) : new Date(0);
    const daysSinceLastCleanup = (now.getTime() - lastCleanupDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastCleanup >= 7) {
      // Perform cleanup
      const startTime = Date.now();
      await cleanExpiredCache();
      const duration = Date.now() - startTime;

      // Log the cleanup
      await supabase
        .from('amadeus_cache_cleanup_logs')
        .insert({
          cleanup_date: now.toISOString(),
          deleted_entries: 0, // Could enhance to track actual count
          cleanup_duration_ms: duration
        });

      return NextResponse.json({ 
        success: true,
        message: 'Automatic cleanup performed', 
        daysSinceLastCleanup: Math.round(daysSinceLastCleanup * 100) / 100,
        timestamp: now.toISOString()
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Cleanup not needed yet', 
      daysSinceLastCleanup: Math.round(daysSinceLastCleanup * 100) / 100,
      nextCleanupDue: `${Math.round((7 - daysSinceLastCleanup) * 100) / 100} days`,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Error in cache PUT endpoint:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to check or perform automatic cleanup',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 