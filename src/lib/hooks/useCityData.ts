import { useState, useEffect } from 'react';

export interface Coordinates {
  latitude: string;
  longitude: string;
}

export interface PointOfInterest {
  id: string;
  name: string;
  category: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  tags?: string[];
  address_line1?: string;
  address_line2?: string;
  datasource?: any;
  formattedAddress?: string;
  website?: string;
  phone?: string;
  source?: 'geoapify';
}

interface CityDataState {
  loading: boolean;
  error: string | null;
  attractions: PointOfInterest[];
  restaurants: PointOfInterest[];
  hotels: PointOfInterest[];
  activities: PointOfInterest[];
}

// Removed CITY_COORDINATES
// Simplified FALLBACK_DATA - consider removing or making it more generic
const GENERIC_FALLBACK_POIS = {
    attractions: [{ id: 'fallback-attr', name: 'Fallback Attraction', category: 'tourism', geoCode: {latitude:0, longitude:0}, source: 'geoapify' as 'geoapify'}],
    restaurants: [{ id: 'fallback-resto', name: 'Fallback Restaurant', category: 'catering.restaurant', geoCode: {latitude:0, longitude:0}, source: 'geoapify' as 'geoapify'}],
    hotels: [{ id: 'fallback-hotel', name: 'Fallback Hotel', category: 'accommodation.hotel', geoCode: {latitude:0, longitude:0}, source: 'geoapify' as 'geoapify'}],
    activities: [{ id: 'fallback-activity', name: 'Fallback Activity', category: 'leisure', geoCode: {latitude:0, longitude:0}, source: 'geoapify'as 'geoapify'}],
};

export function useCityData(passedCoordinates: Coordinates | null) {
  const [state, setState] = useState<CityDataState>({
    loading: true,
    error: null,
    attractions: [],
    restaurants: [],
    hotels: [],
    activities: [],
  });
  const [retries, setRetries] = useState(0);
  const MAX_RETRIES = 2;

  useEffect(() => {
    const fetchCityData = async () => {
      if (!passedCoordinates) {
        setState({
          loading: false,
          error: 'Coordinates not provided to useCityData hook.',
          attractions: [],
          restaurants: [],
          hotels: [],
          activities: [],
        });
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const { latitude, longitude } = passedCoordinates;

        // Only fetch Geoapify data
        const geoapifyCategories = [
          "tourism",
          "entertainment", // For activities and attractions
          "leisure", // For activities and attractions
          "catering.restaurant",
          "catering.fast_food",
          "catering.cafe",
          "catering.bar",
          "catering.pub",
          "accommodation.hotel",
          "accommodation.motel",
          "accommodation.guest_house",
          "accommodation.hostel",
          "commercial.shopping_mall", // Could be an activity
          "sport" // Could be an activity
        ].join(",");

        const geoapifyPlacesResult = await fetch(`https://api.geoapify.com/v2/places?categories=${geoapifyCategories}&filter=circle:${longitude},${latitude},5000&limit=50&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`);
        
        const { geoapifyAttractions, geoapifyRestaurants, geoapifyHotels, geoapifyActivities } = await processGeoapifyResult(geoapifyPlacesResult.ok ? { status: 'fulfilled', value: geoapifyPlacesResult } : { status: 'rejected', reason: `Geoapify API error: ${geoapifyPlacesResult.status}` });
        
        const geoapifyFailed = !geoapifyPlacesResult.ok;

        if (geoapifyFailed && retries < MAX_RETRIES) { 
          setRetries(prev => prev + 1);
          return;
        }
        
        setState({
          loading: false,
          error: geoapifyFailed ? "Failed to fetch data from Geoapify. Using fallback data." : null,
          attractions: geoapifyAttractions.length > 0 ? geoapifyAttractions : GENERIC_FALLBACK_POIS.attractions,
          restaurants: geoapifyRestaurants.length > 0 ? geoapifyRestaurants : GENERIC_FALLBACK_POIS.restaurants,
          hotels: geoapifyHotels.length > 0 ? geoapifyHotels : GENERIC_FALLBACK_POIS.hotels,
          activities: geoapifyActivities.length > 0 ? geoapifyActivities : GENERIC_FALLBACK_POIS.activities,
        });

      } catch (error: any) {
        console.error('Error fetching city data in useCityData:', error);
        setState({
          loading: false,
          error: error.message || 'Failed to fetch POI data',
          attractions: GENERIC_FALLBACK_POIS.attractions,
          restaurants: GENERIC_FALLBACK_POIS.restaurants,
          hotels: GENERIC_FALLBACK_POIS.hotels,
          activities: GENERIC_FALLBACK_POIS.activities,
        });
      }
    };
    
    fetchCityData();
  }, [passedCoordinates, retries]);

  // Updated processGeoapifyResult to categorize into activities as well
  async function processGeoapifyResult(result: PromiseSettledResult<Response>): Promise<{ geoapifyAttractions: PointOfInterest[], geoapifyRestaurants: PointOfInterest[], geoapifyHotels: PointOfInterest[], geoapifyActivities: PointOfInterest[] }> {
    const categorizedResults = {
      geoapifyAttractions: [] as PointOfInterest[],
      geoapifyRestaurants: [] as PointOfInterest[],
      geoapifyHotels: [] as PointOfInterest[],
      geoapifyActivities: [] as PointOfInterest[],
    };

    if (result.status === 'fulfilled' && result.value.ok) {
      const data = await result.value.json();
      const features = data?.features || [];

      features.forEach((feature: any) => {
        const props = feature.properties;
        const poi: PointOfInterest = {
          id: props.osm_id || props.wikidata || `${props.lat}_${props.lon}_${props.name || 'place'}_${Math.random().toString(36).substr(2, 9)}`,
          name: props.name || props.street || 'Unnamed Place',
          category: props.categories?.join(', ') || 'Unknown',
          geoCode: { latitude: props.lat, longitude: props.lon },
          tags: props.categories,
          address_line1: props.address_line1,
          address_line2: props.address_line2,
          formattedAddress: props.formatted,
          website: props.website,
          phone: props.phone,
          datasource: props.datasource,
          source: 'geoapify',
        };

        let isAttraction = false;
        let isRestaurant = false;
        let isHotel = false;
        let isActivity = false;

        (props.categories || []).forEach((cat: string) => {
          if (cat.startsWith('tourism') || cat.startsWith('building.historic') || cat.startsWith('amenity.arts_centre') || cat.startsWith('amenity.museum')) {
            isAttraction = true;
          }
          if (cat.startsWith('catering')) {
            isRestaurant = true;
          }
          if (cat.startsWith('accommodation')) {
            isHotel = true;
          }
          if (cat.startsWith('leisure') || cat.startsWith('entertainment') || cat.startsWith('sport') || cat.startsWith('commercial.shopping_mall')) {
            isActivity = true;
          }
        });

        if (isAttraction) categorizedResults.geoapifyAttractions.push(poi);
        // Avoid duplication: if it's primarily an attraction, don't also list as a generic activity unless specific conditions met
        else if (isActivity) categorizedResults.geoapifyActivities.push(poi); 
        
        if (isRestaurant) categorizedResults.geoapifyRestaurants.push(poi);
        if (isHotel) categorizedResults.geoapifyHotels.push(poi);
        
      });
    } else if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.ok)) {
      console.error('Geoapify API request failed in useCityData:', result.status === 'rejected' ? result.reason : (result.value ? `${result.value.status} ${result.value.statusText}` : 'Unknown error'));
    }
    return categorizedResults;
  }
  
  return state;
} 