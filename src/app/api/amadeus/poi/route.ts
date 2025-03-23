import { NextRequest, NextResponse } from 'next/server';
import amadeus from '@/lib/amadeusClient';

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
    
    try {
      const response = await amadeus.referenceData.locations.pointsOfInterest.get(searchParams);
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