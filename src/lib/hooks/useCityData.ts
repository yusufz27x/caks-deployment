import { useState, useEffect } from 'react';

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

interface CityDataState {
  loading: boolean;
  error: string | null;
  cityName?: string;
  country?: string;
  cityDescription?: string;
  attractions: PointOfInterest[];
  kitchens: PointOfInterest[];
  stays: PointOfInterest[];
}

export function useCityData(passedCoordinates: Coordinates | null, locationName?: string) {
  const [state, setState] = useState<CityDataState>({
    loading: true,
    error: null,
    attractions: [],
    kitchens: [],
    stays: [],
  });

  useEffect(() => {
    const fetchCityData = async () => {
      if (!passedCoordinates && !locationName) {
        setState({
          loading: false,
          error: 'Coordinates or location name not provided to useCityData hook.',
          attractions: [],
          kitchens: [],
          stays: [],
        });
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const query = locationName || `${passedCoordinates?.latitude},${passedCoordinates?.longitude}`;

        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ locationQuery: query }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `API error: ${response.status}` }));
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();

        const transformPoi = (poi: any, index: number, category: string): PointOfInterest => ({
          id: `${category}-${index}-${poi.name.replace(/\s+/g, '-')}`,
          name: poi.name || 'Unnamed Place',
          description: poi.description,
          website: poi.website,
          googleMapsLink: poi.googleMapsLink,
        });
        
        setState({
          loading: false,
          error: null,
          cityName: data.cityName,
          country: data.country,
          cityDescription: data.cityDescription,
          attractions: (data.attractions || []).map((poi: any, index: number) => transformPoi(poi, index, 'attraction')),
          kitchens: (data.kitchens || []).map((poi: any, index: number) => transformPoi(poi, index, 'kitchen')),
          stays: (data.stays || []).map((poi: any, index: number) => transformPoi(poi, index, 'stay')),
        });

      } catch (error: any) {
        console.error('Error fetching city data in useCityData:', error);
        setState({
          loading: false,
          error: error.message || 'Failed to fetch POI data from Gemini API',
          attractions: [],
          kitchens: [],
          stays: [],
        });
      }
    };
    
    fetchCityData();
  }, [passedCoordinates, locationName]);

  return state;
} 