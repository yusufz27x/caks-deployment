import { NextRequest, NextResponse } from 'next/server';
import amadeus from '@/lib/amadeusClient';
import { getCachedResponse, setCachedResponse } from '@/lib/amadeusCache';

export async function GET(request: NextRequest) {
  try {
    const urlSearchParams = request.nextUrl.searchParams;
    
    const latitude = urlSearchParams.get('latitude');
    const longitude = urlSearchParams.get('longitude');
    const radius = urlSearchParams.get('radius') || '20';
    const categoryFilter = urlSearchParams.get('categoryFilter');
    
    // Validate required parameters
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required parameters: latitude and longitude' },
        { status: 400 }
      );
    }
    
    // Verify Amadeus credentials
    if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
      console.error('Amadeus API credentials missing');
      return NextResponse.json(
        { error: 'API configuration error: Missing credentials' },
        { status: 500 }
      );
    }
    
    // Build search parameters
    const searchParams: Record<string, any> = {
      latitude,
      longitude,
      radius,
    };
    
    if (categoryFilter) {
      searchParams.categoryFilter = categoryFilter;
    }

    const endpoint = 'poi';

    // Check cache first
    try {
      const cachedResponse = await getCachedResponse(endpoint, searchParams);
      if (cachedResponse) {
        console.log('Returning cached POI data');
        return NextResponse.json(cachedResponse);
      }
    } catch (cacheError) {
      console.warn('Cache lookup failed, proceeding with API call:', cacheError);
    }
    
    try {
      // If not in cache, make API call
      const response = await amadeus.referenceData.locations.pointsOfInterest.get(searchParams);
      
      // Cache the successful response
      try {
        await setCachedResponse(endpoint, searchParams, response.result);
        console.log('Cached new POI data');
      } catch (cacheError) {
        console.warn('Failed to cache response:', cacheError);
      }
      
      return NextResponse.json(response.result);
    } catch (apiError: any) {
      // Handle specific API errors
      console.error('Amadeus API Error:', apiError);
      
      let status = 500;
      let errorMessage = 'Failed to fetch points of interest';
      
      // Extract more detailed error information if available
      if (apiError.code === 'NetworkError') {
        errorMessage = 'Network error connecting to Amadeus API. Check your network connection and API credentials.';
      } else if (apiError.response?.statusCode) {
        status = apiError.response.statusCode;
        errorMessage = apiError.response.result?.errors?.[0]?.detail || errorMessage;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in POI endpoint:', error);
    
    return NextResponse.json(
      { error: 'Internal server error processing your request' },
      { status: 500 }
    );
  }
} 