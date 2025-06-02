import { useState } from 'react';

interface CityHookState {
  loading: boolean;
  error: string | null;
  data: any | null;
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

interface POISearchParams {
  latitude: string;
  longitude: string;
  radius?: string;
  categoryFilter?: string;
}

export function useCity() {
  const [state, setState] = useState<CityHookState>({
    loading: false,
    error: null,
    data: null
  });
  
  const searchHotels = async (params: HotelSearchParams) => {
    setState({ loading: true, error: null, data: null });
    
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/city/hotels?${queryParams.toString()}`);
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
      
      const response = await fetch(`/api/city/locations?${queryParams.toString()}`);
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

  const searchPointsOfInterest = async (params: POISearchParams) => {
    setState({ loading: true, error: null, data: null });
    
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/city/poi?${queryParams.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch points of interest');
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
    searchHotels,
    searchLocations,
    searchPointsOfInterest
  };
} 