import { NextRequest, NextResponse } from 'next/server';
import amadeus from '@/lib/amadeusClient';

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
    
    const response = await amadeus.shopping.hotelOffers.get(hotelSearchParams);
    
    return NextResponse.json(response.result);
  } catch (error: any) {
    console.error('Error fetching hotel offers:', error.response?.result || error);
    
    return NextResponse.json(
      { error: error.response?.result?.errors || 'Failed to fetch hotel offers' },
      { status: error.response?.statusCode || 500 }
    );
  }
} 