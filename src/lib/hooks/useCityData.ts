import { useState, useEffect } from 'react';

interface Coordinates {
  latitude: string;
  longitude: string;
}

interface PointOfInterest {
  id: string;
  name: string;
  category: string; // This will now also include Geoapify categories
  rank?: number; // Optional as Geoapify doesn't provide rank
  geoCode: {
    latitude: number;
    longitude: number;
  };
  tags?: string[]; // Optional as Geoapify provides 'categories'
  pictures?: string[];
  description?: {
    text: string; // For Amadeus
  };
  // Geoapify specific fields we might want to use directly or map
  address_line1?: string;
  address_line2?: string;
  datasource?: any;
  formattedAddress?: string; // Geoapify formatted address
  // Add a source field to distinguish between Amadeus and Geoapify data
  source?: 'amadeus' | 'geoapify';
}

interface CityDataState {
  loading: boolean;
  error: string | null;
  coordinates: Coordinates | null;
  attractions: PointOfInterest[];
  restaurants: PointOfInterest[];
  hotels: PointOfInterest[];
  activities: PointOfInterest[]; // Keeping activities separate as Geoapify categories might not map well
  // recommendations: any[]; // Removed: Geoapify data will be merged
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
    activities: [],
    // recommendations: [], // Removed
  });
  const [retries, setRetries] = useState(0);
  const MAX_RETRIES = 2;

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        let coordinates = CITY_COORDINATES[citySlug];
        
        if (!coordinates) {
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

        const [attractionsResult, restaurantsResult, hotelsResult, activitiesResult, geoapifyPlacesResult] = await Promise.allSettled([
          fetch(`/api/amadeus/poi?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&categoryFilter=SIGHTS`),
          fetch(`/api/amadeus/poi?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&categoryFilter=RESTAURANT`),
          fetch(`/api/amadeus/poi?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&categoryFilter=HOTEL`),
          fetch(`/api/amadeus/poi?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&categoryFilter=ENTERTAINMENT,SHOPPING,SPORTS`),
          fetch(`https://api.geoapify.com/v2/places?categories=tourism,catering.restaurant,accommodation.hotel&filter=circle:${coordinates.longitude},${coordinates.latitude},5000&limit=30&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`)
        ]);

        // Process Amadeus results
        const amadeusAttractions = await processAmadeusResult(attractionsResult, 'attractions', citySlug);
        const amadeusRestaurants = await processAmadeusResult(restaurantsResult, 'restaurants', citySlug);
        const amadeusHotels = await processAmadeusResult(hotelsResult, 'hotels', citySlug);
        const amadeusActivities = await processAmadeusResult(activitiesResult, 'activities', citySlug);

        // Process and categorize Geoapify results
        const { geoapifyAttractions, geoapifyRestaurants, geoapifyHotels } = await processGeoapifyResult(geoapifyPlacesResult as PromiseSettledResult<Response>);

        const amadeusApisFailed = [amadeusAttractions, amadeusRestaurants, amadeusHotels, amadeusActivities].every(data => !data);
        
        if (amadeusApisFailed && retries < MAX_RETRIES && !geoapifyPlacesResult.status.startsWith('fulf')) { // Only retry if Geoapify also failed or wasn't attempted
          setRetries(prev => prev + 1);
          return;
        }
        
        // Merge data - ensure no duplicates if an ID system is robust
        // For simplicity, we'll just concatenate. Add de-duplication if needed.
        const combinedAttractions = [
          ...(amadeusAttractions || FALLBACK_DATA[citySlug]?.attractions || []),
          ...geoapifyAttractions
        ];
        const combinedRestaurants = [
          ...(amadeusRestaurants || FALLBACK_DATA[citySlug]?.restaurants || []),
          ...geoapifyRestaurants
        ];
        const combinedHotels = [
          ...(amadeusHotels || FALLBACK_DATA[citySlug]?.hotels || []),
          ...geoapifyHotels
        ];

        setState({
          loading: false,
          error: amadeusApisFailed && geoapifyPlacesResult.status !== 'fulfilled' ? "Failed to fetch data from all sources. Using fallback data." : null,
          coordinates,
          attractions: combinedAttractions,
          restaurants: combinedRestaurants,
          hotels: combinedHotels,
          activities: amadeusActivities || FALLBACK_DATA[citySlug]?.activities || [],
        });

      } catch (error: any) {
        console.error('Error fetching city data:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to fetch city data',
          attractions: FALLBACK_DATA[citySlug]?.attractions || [],
          restaurants: FALLBACK_DATA[citySlug]?.restaurants || [],
          hotels: FALLBACK_DATA[citySlug]?.hotels || [],
          activities: FALLBACK_DATA[citySlug]?.activities || [],
        }));
      }
    };

    async function processAmadeusResult(result: PromiseSettledResult<Response>, type: string, citySlug: string): Promise<PointOfInterest[] | null> {
      if (result.status === 'fulfilled' && result.value.ok) {
        const data = await result.value.json();
        const pois = data?.data || FALLBACK_DATA[citySlug]?.[type as keyof typeof FALLBACK_DATA[typeof citySlug]] || [];
        return pois.map((poi: any) => ({ ...poi, source: 'amadeus' })) as PointOfInterest[];
      }
      return null;
    }

    async function processGeoapifyResult(result: PromiseSettledResult<Response>): Promise<{ geoapifyAttractions: PointOfInterest[], geoapifyRestaurants: PointOfInterest[], geoapifyHotels: PointOfInterest[] }> {
      const categorizedResults = {
        geoapifyAttractions: [] as PointOfInterest[],
        geoapifyRestaurants: [] as PointOfInterest[],
        geoapifyHotels: [] as PointOfInterest[],
      };

      if (result.status === 'fulfilled' && result.value.ok) {
        const data = await result.value.json();
        const features = data?.features || [];

        features.forEach((feature: any) => {
          const props = feature.properties;
          const poi: PointOfInterest = {
            id: props.osm_id || props.wikidata || `${props.lat}_${props.lon}_${Date.now()}`, // Ensure unique ID
            name: props.name || props.street || 'Unnamed Place',
            category: props.categories?.join(', ') || 'Unknown', // Geoapify categories
            geoCode: { latitude: props.lat, longitude: props.lon },
            tags: props.categories,
            address_line1: props.address_line1,
            address_line2: props.address_line2,
            formattedAddress: props.formatted,
            datasource: props.datasource,
            source: 'geoapify',
            // Amadeus specific fields like rank, pictures, description will be undefined
          };

          // Categorize based on Geoapify categories
          if (props.categories?.includes('tourism') || props.categories?.includes('leisure') || props.categories?.includes('entertainment')) {
            categorizedResults.geoapifyAttractions.push(poi);
          } else if (props.categories?.includes('catering') || props.categories?.includes('catering.restaurant')) {
            categorizedResults.geoapifyRestaurants.push(poi);
          } else if (props.categories?.includes('accommodation') || props.categories?.includes('accommodation.hotel')) {
            categorizedResults.geoapifyHotels.push(poi);
          }
          // You might want to add more sophisticated categorization logic here
        });
      } else if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.ok) ) {
        console.error('Geoapify API request failed:', result.status === 'rejected' ? result.reason : (result.value ? result.value.status : 'Unknown error'));
      }
      return categorizedResults;
    }
    
    fetchCityData();
  }, [citySlug, retries]);
  
  return state;
} 