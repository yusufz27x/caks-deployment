"use client"

import { useState } from 'react';
import { useAmadeus } from '@/lib/hooks/useAmadeus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CacheTest() {
  const { searchHotels, searchLocations, searchPointsOfInterest, loading, error, data } = useAmadeus();
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [requestTimes, setRequestTimes] = useState<number[]>([]);

  const testHotelCaching = async () => {
    const startTime = Date.now();
    
    try {
      await searchHotels({
        cityCode: 'PAR',
        checkInDate: '2024-03-15',
        checkOutDate: '2024-03-17',
        adults: '2'
      });
      
      const duration = Date.now() - startTime;
      setRequestTimes(prev => [...prev, duration]);
      
      // Get updated cache stats
      await fetchCacheStats();
    } catch (error) {
      console.error('Hotel search failed:', error);
    }
  };

  const testLocationCaching = async () => {
    const startTime = Date.now();
    
    try {
      await searchLocations({
        keyword: 'paris',
        subType: 'CITY'
      });
      
      const duration = Date.now() - startTime;
      setRequestTimes(prev => [...prev, duration]);
      
      // Get updated cache stats
      await fetchCacheStats();
    } catch (error) {
      console.error('Location search failed:', error);
    }
  };

  const testPOICaching = async () => {
    const startTime = Date.now();
    
    try {
      await searchPointsOfInterest({
        latitude: '48.8566',
        longitude: '2.3522',
        radius: '10'
      });
      
      const duration = Date.now() - startTime;
      setRequestTimes(prev => [...prev, duration]);
      
      // Get updated cache stats
      await fetchCacheStats();
    } catch (error) {
      console.error('POI search failed:', error);
    }
  };

  const fetchCacheStats = async () => {
    try {
      const response = await fetch('/api/cache?action=stats');
      const stats = await response.json();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
    }
  };

  const clearCache = async () => {
    try {
      const response = await fetch('/api/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
      });
      
      if (response.ok) {
        setCacheStats(null);
        setRequestTimes([]);
        await fetchCacheStats();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Amadeus Cache Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={testHotelCaching} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Searching...' : 'Test Hotel Search (Paris)'}
            </Button>
            
            <Button 
              onClick={testLocationCaching} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Searching...' : 'Test Location Search (Paris)'}
            </Button>
            
            <Button 
              onClick={testPOICaching} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Searching...' : 'Test POI Search (Paris)'}
            </Button>
          </div>

          <div className="flex gap-4">
            <Button onClick={fetchCacheStats} variant="secondary">
              Refresh Cache Stats
            </Button>
            <Button onClick={clearCache} variant="destructive">
              Clear Cache
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600">Error: {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {requestTimes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>⏱️ Request Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requestTimes.map((time, index) => (
                <div key={index} className="flex justify-between">
                  <span>Request #{index + 1}</span>
                  <span className={time < 200 ? 'text-green-600 font-semibold' : 'text-blue-600'}>
                    {time}ms {time < 200 && '(cached!)'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              💡 Tip: Run the same test twice to see caching in action. 
              First request will be slow (~1000ms), second will be fast (~50ms).
            </p>
          </CardContent>
        </Card>
      )}

      {cacheStats && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Cache Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{cacheStats.total}</div>
                <div className="text-sm text-gray-600">Total Entries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{cacheStats.active}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{cacheStats.expired}</div>
                <div className="text-sm text-gray-600">Expired</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(cacheStats.byEndpoint).length}
                </div>
                <div className="text-sm text-gray-600">Endpoints</div>
              </div>
            </div>

            {Object.keys(cacheStats.byEndpoint).length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Entries by Endpoint:</h4>
                {Object.entries(cacheStats.byEndpoint).map(([endpoint, count]) => (
                  <div key={endpoint} className="flex justify-between">
                    <span>{endpoint}</span>
                    <span className="font-semibold">{count as number}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {data && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Last Response Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto max-h-60">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 