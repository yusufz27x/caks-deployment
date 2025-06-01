import { NextRequest, NextResponse } from 'next/server';
import amadeus from '@/lib/amadeusClient';
import { getCachedResponse, setCachedResponse } from '@/lib/amadeusCache';

export async function GET(request: NextRequest) {
  try {
    const urlSearchParams = request.nextUrl.searchParams;
    
    const keyword = urlSearchParams.get('keyword');
    const subType = urlSearchParams.get('subType') || 'CITY,AIRPORT';
    
    // Validate required parameters
    if (!keyword) {
      return NextResponse.json(
        { error: 'Missing required parameter: keyword' },
        { status: 400 }
      );
    }
    
    // Build search parameters
    const locationSearchParams = {
      keyword,
      subType,
      'page[limit]': 10
    };
    
    const endpoint = 'locations';

    // Check cache first
    try {
      const cachedResponse = await getCachedResponse(endpoint, locationSearchParams);
      if (cachedResponse) {
        console.log('Returning cached location data');
        return NextResponse.json(cachedResponse);
      }
    } catch (cacheError) {
      console.warn('Cache lookup failed, proceeding with API call:', cacheError);
    }

    // If not in cache, make API call
    const response = await amadeus.referenceData.locations.get(locationSearchParams);
    
    // Cache the successful response
    try {
      await setCachedResponse(endpoint, locationSearchParams, response.result);
      console.log('Cached new location data');
    } catch (cacheError) {
      console.warn('Failed to cache response:', cacheError);
    }
    
    return NextResponse.json(response.result);
  } catch (error: any) {
    console.error('Error fetching locations:', error.response?.result || error);
    
    return NextResponse.json(
      { error: error.response?.result?.errors || 'Failed to fetch locations' },
      { status: error.response?.statusCode || 500 }
    );
  }
} 