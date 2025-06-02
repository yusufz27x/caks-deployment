'use client'

import { useState, useEffect } from 'react';
import { getCityData, type CityDataResponse } from '../actions/getCityData';

export interface Coordinates {
  latitude: string;
  longitude: string;
}

export interface PointOfInterest {
  id: string;
  name: string;
  description?: string;
  website?: string;
  googleMapsLink?: string;
  geoCode?: {
    latitude: number;
    longitude: number;
  };
}

export function useCityData(coordinates: Coordinates | null, locationName?: string) {
  const [state, setState] = useState<CityDataResponse>({
    loading: true,
    error: null,
    attractions: [],
    kitchens: [],
    stays: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!coordinates && !locationName) {
        setState({
          loading: false,
          error: 'Coordinates or location name not provided to useCityData hook.',
          attractions: [],
          kitchens: [],
          stays: [],
        });
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const query = locationName || `${coordinates?.latitude},${coordinates?.longitude}`;
      const result = await getCityData(query);
      setState(result);
    };
    
    fetchData();
  }, [coordinates, locationName]);

  return state;
} 