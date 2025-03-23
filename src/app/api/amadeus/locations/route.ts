import { NextRequest, NextResponse } from 'next/server';
import amadeus from '@/lib/amadeusClient';

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
    
    const response = await amadeus.referenceData.locations.get(locationSearchParams);
    
    return NextResponse.json(response.result);
  } catch (error: any) {
    console.error('Error fetching locations:', error.response?.result || error);
    
    return NextResponse.json(
      { error: error.response?.result?.errors || 'Failed to fetch locations' },
      { status: error.response?.statusCode || 500 }
    );
  }
} 