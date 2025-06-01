import { NextRequest, NextResponse } from 'next/server';
import amadeus from '@/lib/amadeusClient';
import { getCachedResponse, setCachedResponse } from '@/lib/amadeusCache';

export async function GET(request: NextRequest) {
  try {
    const urlSearchParams = request.nextUrl.searchParams;
    
    const cityCode = urlSearchParams.get('cityCode');
    const checkInDate = urlSearchParams.get('checkInDate');
    const checkOutDate = urlSearchParams.get('checkOutDate');
    const adults = urlSearchParams.get('adults') || '1';
    const radius = urlSearchParams.get('radius') || '5';
    const radiusUnit = urlSearchParams.get('radiusUnit') || 'KM';
    
    // Validate required parameters
    if (!cityCode || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Build search parameters
    const hotelSearchParams = {
      cityCode,
      checkInDate,
      checkOutDate,
      adults,
      radius,
      radiusUnit,
      currency: 'USD'
    };
    
    const endpoint = 'hotels';

    // Check cache first
    try {
      const cachedResponse = await getCachedResponse(endpoint, hotelSearchParams);
      if (cachedResponse) {
        console.log('Returning cached hotel data');
        return NextResponse.json(cachedResponse);
      }
    } catch (cacheError) {
      console.warn('Cache lookup failed, proceeding with API call:', cacheError);
    }

    // If not in cache, make API call
    const response = await amadeus.shopping.hotelOffers.get(hotelSearchParams);
    
    // Cache the successful response
    try {
      await setCachedResponse(endpoint, hotelSearchParams, response.result);
      console.log('Cached new hotel data');
    } catch (cacheError) {
      console.warn('Failed to cache response:', cacheError);
    }
    
    return NextResponse.json(response.result);
  } catch (error: any) {
    console.error('Error fetching hotel offers:', error.response?.result || error);
    
    return NextResponse.json(
      { error: error.response?.result?.errors || 'Failed to fetch hotel offers' },
      { status: error.response?.statusCode || 500 }
    );
  }
} 