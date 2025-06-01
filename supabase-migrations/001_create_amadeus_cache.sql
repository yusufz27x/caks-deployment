-- Create the amadeus_cache table
CREATE TABLE IF NOT EXISTS amadeus_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key VARCHAR(64) UNIQUE NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  params JSONB NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index on cache_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_amadeus_cache_key ON amadeus_cache(cache_key);

-- Create index on expires_at for cleanup operations
CREATE INDEX IF NOT EXISTS idx_amadeus_cache_expires_at ON amadeus_cache(expires_at);

-- Create index on endpoint for analytics/debugging
CREATE INDEX IF NOT EXISTS idx_amadeus_cache_endpoint ON amadeus_cache(endpoint);

-- Create a function to automatically clean up expired entries
CREATE OR REPLACE FUNCTION cleanup_expired_amadeus_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM amadeus_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Enable pg_cron extension (run this manually in SQL editor if not enabled)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Option 1: Using pg_cron (if available in your Supabase plan)
-- Schedule cleanup to run every Sunday at 2 AM UTC (weekly)
-- Run this AFTER enabling pg_cron extension:
-- SELECT cron.schedule('cleanup-amadeus-cache-weekly', '0 2 * * 0', 'SELECT cleanup_expired_amadeus_cache();');

-- Option 2: Create a more detailed cleanup function with logging
CREATE OR REPLACE FUNCTION cleanup_amadeus_cache_with_stats()
RETURNS TABLE(deleted_count integer, cleanup_time timestamp with time zone) AS $$
DECLARE
  deleted_rows integer;
BEGIN
  DELETE FROM amadeus_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_rows = ROW_COUNT;
  
  -- Log the cleanup (optional: you can create a cleanup_logs table)
  -- INSERT INTO cleanup_logs (cleanup_date, deleted_entries) VALUES (NOW(), deleted_rows);
  
  RETURN QUERY SELECT deleted_rows, NOW();
END;
$$ LANGUAGE plpgsql;

-- Alternative: Create a table to log cleanup operations (optional)
CREATE TABLE IF NOT EXISTS amadeus_cache_cleanup_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cleanup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_entries INTEGER NOT NULL,
  cleanup_duration_ms INTEGER
);

-- Enhanced cleanup function with logging
CREATE OR REPLACE FUNCTION cleanup_amadeus_cache_logged()
RETURNS void AS $$
DECLARE
  deleted_rows integer;
  start_time timestamp with time zone;
  end_time timestamp with time zone;
  duration_ms integer;
BEGIN
  start_time := clock_timestamp();
  
  DELETE FROM amadeus_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_rows = ROW_COUNT;
  
  end_time := clock_timestamp();
  duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  
  -- Log the cleanup operation
  INSERT INTO amadeus_cache_cleanup_logs (cleanup_date, deleted_entries, cleanup_duration_ms) 
  VALUES (NOW(), deleted_rows, duration_ms);
  
  RAISE NOTICE 'Cleaned up % expired cache entries in % ms', deleted_rows, duration_ms;
END;
$$ LANGUAGE plpgsql;

-- Weekly cron job (run this after enabling pg_cron extension)
-- Runs every Sunday at 2:00 AM UTC
-- SELECT cron.schedule('weekly-amadeus-cache-cleanup', '0 2 * * 0', 'SELECT cleanup_amadeus_cache_logged();');

-- To check existing cron jobs (after setup):
-- SELECT * FROM cron.job;

-- To remove a cron job (if needed):
-- SELECT cron.unschedule('weekly-amadeus-cache-cleanup'); 