-- Create the city_cache table
CREATE TABLE IF NOT EXISTS city_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key VARCHAR(64) UNIQUE NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  params JSONB NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index on cache_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_city_cache_key ON city_cache(cache_key);

-- Create index on expires_at for cleanup operations
CREATE INDEX IF NOT EXISTS idx_city_cache_expires_at ON city_cache(expires_at);

-- Create index on endpoint for analytics/debugging
CREATE INDEX IF NOT EXISTS idx_city_cache_endpoint ON city_cache(endpoint);

-- Create a function to automatically clean up expired entries
CREATE OR REPLACE FUNCTION cleanup_expired_city_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM city_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a table to log cleanup operations
CREATE TABLE IF NOT EXISTS city_cache_cleanup_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cleanup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_entries INTEGER NOT NULL,
  cleanup_duration_ms INTEGER
);

-- Enhanced cleanup function with logging
CREATE OR REPLACE FUNCTION cleanup_city_cache_logged()
RETURNS void AS $$
DECLARE
  deleted_rows integer;
  start_time timestamp with time zone;
  end_time timestamp with time zone;
  duration_ms integer;
BEGIN
  start_time := clock_timestamp();
  
  DELETE FROM city_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_rows = ROW_COUNT;
  
  end_time := clock_timestamp();
  duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  
  -- Log the cleanup operation
  INSERT INTO city_cache_cleanup_logs (cleanup_date, deleted_entries, cleanup_duration_ms) 
  VALUES (NOW(), deleted_rows, duration_ms);
  
  RAISE NOTICE 'Cleaned up % expired city cache entries in % ms', deleted_rows, duration_ms;
END;
$$ LANGUAGE plpgsql; 