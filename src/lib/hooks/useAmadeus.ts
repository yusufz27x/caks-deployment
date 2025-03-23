import { useState } from 'react';

interface AmadeusHookState {
  loading: boolean;
  error: string | null;
  data: any | null;
}

interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults?: string;
  travelClass?: string;
}

interface HotelSearchParams {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: string;
  radius?: string;
  radiusUnit?: string;
}

interface LocationSearchParams {
  keyword: string;
  subType?: string;
}

export function useAmadeus() {
  const [state, setState] = useState<AmadeusHookState>({
    loading: false,
    error: null,
    data: null
  });

  const searchFlights = async (params: FlightSearchParams) => {
    setState({ loading: true, error: null, data: null });
    
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/amadeus/flights?${queryParams.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch flight offers');
      }
      
      setState({ loading: false, error: null, data });
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      setState({ loading: false, error: errorMessage, data: null });
      throw error;
    }
  };
  
  const searchHotels = async (params: HotelSearchParams) => {
    setState({ loading: true, error: null, data: null });
    
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/amadeus/hotels?${queryParams.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch hotel offers');
      }
      
      setState({ loading: false, error: null, data });
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      setState({ loading: false, error: errorMessage, data: null });
      throw error;
    }
  };
  
  const searchLocations = async (params: LocationSearchParams) => {
    setState({ loading: true, error: null, data: null });
    
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/amadeus/locations?${queryParams.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch locations');
      }
      
      setState({ loading: false, error: null, data });
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      setState({ loading: false, error: errorMessage, data: null });
      throw error;
    }
  };
  
  return {
    ...state,
    searchFlights,
    searchHotels,
    searchLocations
  };
} 