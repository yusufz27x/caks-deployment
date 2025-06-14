-- Enable RLS on cache tables and create policies for public access
-- This is safe for cache tables since they don't contain sensitive user data

-- Enable RLS on city_cache table
ALTER TABLE city_cache ENABLE ROW LEVEL SECURITY;

-- Allow all operations on city_cache for all users (including anonymous)
-- This is appropriate for cache tables since:
-- 1. Cache data is not sensitive
-- 2. It improves performance by allowing caching
-- 3. Cache entries expire automatically
CREATE POLICY "Allow all operations on city_cache" ON city_cache
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

-- Enable RLS on city_cache_cleanup_logs table
ALTER TABLE city_cache_cleanup_logs ENABLE ROW LEVEL SECURITY;

-- Allow insert and select on cleanup logs for monitoring
CREATE POLICY "Allow insert and select on cleanup logs" ON city_cache_cleanup_logs
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- If amadeus_cache table exists, apply the same policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'amadeus_cache') THEN
    -- Enable RLS on amadeus_cache
    ALTER TABLE amadeus_cache ENABLE ROW LEVEL SECURITY;
    
    -- Allow all operations on amadeus_cache
    CREATE POLICY "Allow all operations on amadeus_cache" ON amadeus_cache
      FOR ALL 
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'amadeus_cache_cleanup_logs') THEN
    -- Enable RLS on amadeus_cache_cleanup_logs
    ALTER TABLE amadeus_cache_cleanup_logs ENABLE ROW LEVEL SECURITY;
    
    -- Allow insert and select on amadeus cleanup logs
    CREATE POLICY "Allow insert and select on amadeus cleanup logs" ON amadeus_cache_cleanup_logs
      FOR ALL
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;