import { NextRequest, NextResponse } from 'next/server';
import amadeus from '@/lib/amadeusClient';

export async function GET(request: NextRequest) {
  try {
    const urlSearchParams = request.nextUrl.searchParams;
    
    const originLocationCode = urlSearchParams.get('originLocationCode');
    const destinationLocationCode = urlSearchParams.get('destinationLocationCode');
    const departureDate = urlSearchParams.get('departureDate');
    const returnDate = urlSearchParams.get('returnDate');
    const adults = urlSearchParams.get('adults') || '1';
    const travelClass = urlSearchParams.get('travelClass') || 'ECONOMY';
    
    // Validate required parameters
    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Build search parameters
    const flightSearchParams = {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults,
      ...(returnDate && { returnDate }),
      travelClass,
      currencyCode: 'USD',
      max: 20
    };
    
    const response = await amadeus.shopping.flightOffersSearch.get(flightSearchParams);
    
    return NextResponse.json(response.result);
  } catch (error: any) {
    console.error('Error fetching flight offers:', error.response?.result || error);
    
    return NextResponse.json(
      { error: error.response?.result?.errors || 'Failed to fetch flight offers' },
      { status: error.response?.statusCode || 500 }
    );
  }
} 