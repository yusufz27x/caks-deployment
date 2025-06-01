import { supabase } from './supabaseClient';
import crypto from 'crypto';

export interface CacheEntry {
  id?: string;
  cache_key: string;
  endpoint: string;
  params: Record<string, any>;
  response_data: any;
  created_at?: string;
  expires_at: string;
}

// Cache duration in hours (default: 24 hours)
const CACHE_DURATION_HOURS = 168; // 7 days

/**
 * Generate a unique cache key based on endpoint and parameters
 */
function generateCacheKey(endpoint: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as Record<string, any>);
  
  const dataString = `${endpoint}:${JSON.stringify(sortedParams)}`;
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

/**
 * Get cached response from Supabase
 */
export async function getCachedResponse(
  endpoint: string, 
  params: Record<string, any>
): Promise<any | null> {
  try {
    const cacheKey = generateCacheKey(endpoint, params);
    
    const { data, error } = await supabase
      .from('amadeus_cache')
      .select('response_data, expires_at')
      .eq('cache_key', cacheKey)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found, which is expected for cache misses
        return null;
      }
      console.error('Error fetching from cache:', error);
      return null;
    }

    // Check if cache entry has expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    
    if (now > expiresAt) {
      // Cache expired, delete the entry
      await supabase
        .from('amadeus_cache')
        .delete()
        .eq('cache_key', cacheKey);
      
      return null;
    }

    return data.response_data;
  } catch (error) {
    console.error('Error in getCachedResponse:', error);
    return null;
  }
}

/**
 * Store response in cache
 */
export async function setCachedResponse(
  endpoint: string,
  params: Record<string, any>,
  responseData: any
): Promise<void> {
  try {
    const cacheKey = generateCacheKey(endpoint, params);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (CACHE_DURATION_HOURS * 60 * 60 * 1000));

    const cacheEntry: CacheEntry = {
      cache_key: cacheKey,
      endpoint,
      params,
      response_data: responseData,
      expires_at: expiresAt.toISOString(),
    };

    // Use upsert to handle both insert and update cases
    const { error } = await supabase
      .from('amadeus_cache')
      .upsert(cacheEntry, {
        onConflict: 'cache_key'
      });

    if (error) {
      console.error('Error storing cache entry:', error);
    }
  } catch (error) {
    console.error('Error in setCachedResponse:', error);
  }
}

/**
 * Clean up expired cache entries
 */
export async function cleanExpiredCache(): Promise<void> {
  try {
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from('amadeus_cache')
      .delete()
      .lt('expires_at', now);

    if (error) {
      console.error('Error cleaning expired cache:', error);
    }
  } catch (error) {
    console.error('Error in cleanExpiredCache:', error);
  }
}

/**
 * Clear all cache entries (useful for debugging or manual cache invalidation)
 */
export async function clearAllCache(): Promise<void> {
  try {
    const { error } = await supabase
      .from('amadeus_cache')
      .delete()
      .neq('id', 0); // Delete all rows

    if (error) {
      console.error('Error clearing all cache:', error);
    }
  } catch (error) {
    console.error('Error in clearAllCache:', error);
  }
} 