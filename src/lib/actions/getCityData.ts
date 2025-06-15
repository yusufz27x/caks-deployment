'use server'

import type { PointOfInterest } from '../hooks/useCityData';

export interface CityDataResponse {
  loading: boolean;
  error: string | null;
  cityName?: string;
  country?: string;
  region?: string;
  state?: string;
  cityDescription?: string;
  attractions: PointOfInterest[];
  kitchens: PointOfInterest[];
  stays: PointOfInterest[];
}

export async function getCityData(locationName: string): Promise<CityDataResponse> {
  try {
    // Construct the base URL properly
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    
    const response = await fetch(`${baseUrl}/api/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locationQuery: locationName }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      loading: false,
      error: null,
      cityName: data.cityName,
      country: data.country,
      region: data.region,
      state: data.state,
      cityDescription: data.cityDescription,
      attractions: data.attractions || [],
      kitchens: data.kitchens || [],
      stays: data.stays || [],
    };
  } catch (error: any) {
    console.error('Error fetching city data:', error);
    return {
      loading: false,
      error: error.message || 'Failed to fetch POI data',
      attractions: [],
      kitchens: [],
      stays: [],
    };
  }
} 