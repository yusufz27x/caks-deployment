import { useState, useEffect } from 'react';

interface Coordinates {
  latitude: string;
  longitude: string;
}

interface PointOfInterest {
  id: string;
  name: string;
  category: string;
  rank: number;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  tags: string[];
  pictures?: string[];
  description?: {
    text: string;
  };
}

interface CityDataState {
  loading: boolean;
  error: string | null;
  coordinates: Coordinates | null;
  attractions: PointOfInterest[];
  restaurants: PointOfInterest[];
  hotels: PointOfInterest[];
  activities: PointOfInterest[];
}

// Predefined coordinates for popular cities
const CITY_COORDINATES: Record<string, Coordinates> = {
  paris: { latitude: '48.8566', longitude: '2.3522' },
  london: { latitude: '51.5074', longitude: '-0.1278' },
  'new-york': { latitude: '40.7128', longitude: '-74.0060' },
  tokyo: { latitude: '35.6762', longitude: '139.6503' },
  rome: { latitude: '41.9028', longitude: '12.4964' },
  // Add more cities as needed
};

// Fallback data if API fails
const FALLBACK_DATA: Record<string, { attractions: any[], restaurants: any[], hotels: any[], activities: any[] }> = {
  paris: {
    attractions: [
      {
        id: 'fallback-eiffel',
        name: 'Eiffel Tower',
        category: 'SIGHTS',
        rank: 98,
        description: { text: 'Iconic symbol of Paris and one of the most famous landmarks in the world.' },
        tags: ['landmark', 'sightseeing', 'architecture']
      },
      {
        id: 'fallback-louvre',
        name: 'Louvre Museum',
        category: 'SIGHTS',
        rank: 95,
        description: { text: 'World-famous art museum housing the Mona Lisa and thousands of other masterpieces.' },
        tags: ['museum', 'art', 'culture']
      }
    ],
    restaurants: [
      {
        id: 'fallback-resto-1',
        name: 'Le Jules Verne',
        category: 'RESTAURANT',
        rank: 90,
        description: { text: 'Fine dining restaurant located on the second floor of the Eiffel Tower.' },
        tags: ['french cuisine', 'fine dining', 'michelin star']
      }
    ],
    hotels: [
      {
        id: 'fallback-hotel-1',
        name: 'Hôtel Plaza Athénée',
        category: 'HOTEL',
        rank: 93,
        description: { text: 'Luxury hotel on avenue Montaigne with views of the Eiffel Tower.' },
        tags: ['luxury', '5-star', 'spa']
      }
    ],
    activities: [
      {
        id: 'fallback-activity-1',
        name: 'Seine River Cruise',
        category: 'ENTERTAINMENT',
        rank: 85,
        description: { text: 'Scenic boat tour along the Seine River passing by major landmarks.' },
        tags: ['cruise', 'sightseeing', 'family-friendly']
      }
    ]
  },
  // Add fallback data for other cities as needed
};

export function useCityData(citySlug: string) {
  const [state, setState] = useState<CityDataState>({
    loading: true,
    error: null,
    coordinates: null,
    attractions: [],
    restaurants: [],
    hotels: [],
    activities: []
  });
  const [retries, setRetries] = useState(0);
  const MAX_RETRIES = 2;

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Get coordinates for the city
        let coordinates = CITY_COORDINATES[citySlug];
        
        if (!coordinates) {
          // If not in predefined list, return error and use fallback data if available
          setState(prev => ({
            ...prev,
            loading: false,
            error: `City coordinates not found for ${citySlug}`,
            attractions: FALLBACK_DATA[citySlug]?.attractions || [],
            restaurants: FALLBACK_DATA[citySlug]?.restaurants || [],
            hotels: FALLBACK_DATA[citySlug]?.hotels || [],
            activities: FALLBACK_DATA[citySlug]?.activities || []
          }));
          return;
        }

        // Use Promise.allSettled to ensure all requests are attempted regardless of individual failures
        const [attractionsResult, restaurantsResult, hotelsResult, activitiesResult] = await Promise.allSettled([
          fetch(`/api/amadeus/poi?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&categoryFilter=SIGHTS`),
          fetch(`/api/amadeus/poi?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&categoryFilter=RESTAURANT`),
          fetch(`/api/amadeus/poi?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&categoryFilter=HOTEL`),
          fetch(`/api/amadeus/poi?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&categoryFilter=ENTERTAINMENT,SHOPPING,SPORTS`)
        ]);

        // Process results
        const attractionsData = await processResult(attractionsResult, 'attractions', citySlug);
        const restaurantsData = await processResult(restaurantsResult, 'restaurants', citySlug);
        const hotelsData = await processResult(hotelsResult, 'hotels', citySlug);
        const activitiesData = await processResult(activitiesResult, 'activities', citySlug);

        // Check if all API calls failed
        const allFailed = [attractionsData, restaurantsData, hotelsData, activitiesData].every(data => !data);
        
        if (allFailed && retries < MAX_RETRIES) {
          // Retry the operation
          setRetries(prev => prev + 1);
          return;
        }

        setState({
          loading: false,
          error: allFailed ? "Failed to fetch data from Amadeus API. Using fallback data." : null,
          coordinates,
          attractions: attractionsData || FALLBACK_DATA[citySlug]?.attractions || [],
          restaurants: restaurantsData || FALLBACK_DATA[citySlug]?.restaurants || [],
          hotels: hotelsData || FALLBACK_DATA[citySlug]?.hotels || [],
          activities: activitiesData || FALLBACK_DATA[citySlug]?.activities || []
        });
      } catch (error: any) {
        console.error('Error fetching city data:', error);
        
        // Use fallback data if available
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to fetch city data',
          attractions: FALLBACK_DATA[citySlug]?.attractions || [],
          restaurants: FALLBACK_DATA[citySlug]?.restaurants || [],
          hotels: FALLBACK_DATA[citySlug]?.hotels || [],
          activities: FALLBACK_DATA[citySlug]?.activities || []
        }));
      }
    };

    // Helper function to process API results
    async function processResult(result: PromiseSettledResult<Response>, type: string, citySlug: string) {
      if (result.status === 'fulfilled' && result.value.ok) {
        const data = await result.value.json();
        return data?.data || FALLBACK_DATA[citySlug]?.[type as keyof typeof FALLBACK_DATA[typeof citySlug]] || [];
      }
      return null;
    }
    
    fetchCityData();
  }, [citySlug, retries]);
  
  return state;
} 