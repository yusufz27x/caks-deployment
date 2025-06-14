import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DynamicCityContent } from "./dynamic-city-content"
import type { Coordinates } from "@/lib/hooks/useCityData"
import { getCachedResponse, setCachedResponse } from '@/lib/cityCache'
import { getCityData } from "@/lib/actions/getCityData"
import { getCityPhotoWithFallback } from '@/lib/services/googlePlaces'

// Define the structure for individual items (attractions, kitchens, stays)
interface PlaceItem {
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

// Updated CityPageData to match useCityData hook response
interface CityPageData {
  slug: string;
  cityName: string;
  country: string;
  region?: string;
  state?: string;
  cityDescription: string;
  coordinates: Coordinates | null;
  image: string;
  imageAttribution?: string;
  attractions: PlaceItem[];
  kitchens: PlaceItem[];
  stays: PlaceItem[];
  name: string;
  description: string;
}

    // Updated to use Google Places API instead of Unsplash
  async function getCityImage(cityName: string, country?: string): Promise<{ photoUrl: string | null; attribution?: string }> {
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      console.warn("Google Places API key not found. Skipping dynamic image fetch.");
      return { photoUrl: null };
    }

    const endpoint = 'google-places';
    const cacheParams = { cityName, country: country || '' };

    // Check cache first
    try {
      const cachedResponse = await getCachedResponse(endpoint, cacheParams);
      if (cachedResponse) {
        console.log('Returning cached Google Places image for:', cityName);
        return { 
          photoUrl: cachedResponse.photoUrl,
          attribution: cachedResponse.attribution 
        };
      }
    } catch (cacheError) {
      console.warn('Cache lookup failed for Google Places, proceeding with API call:', cacheError);
    }

    try {
      // Use the new Google Places photo service
      const result = await getCityPhotoWithFallback(cityName, country);
      
      if (result.photoUrl) {
        // Try to cache the successful response
        try {
          const cacheData = { 
            photoUrl: result.photoUrl,
            attribution: result.attribution 
          };
          await setCachedResponse(endpoint, cacheParams, cacheData);
          console.log('Cached new Google Places image for:', cityName);
        } catch (cacheError) {
          console.warn('Failed to cache Google Places response, but continuing without cache:', cacheError);
        }
        
        return { 
          photoUrl: result.photoUrl,
          attribution: result.attribution 
        };
      } else {
        console.log(`No Google Places image found for ${cityName}:`, result.error);
        return { photoUrl: null };
      }
    } catch (error) {
      console.error(`Failed to fetch image from Google Places for ${cityName}:`, error);
      return { photoUrl: null };
    }
  }

export default async function CityPage({ params, searchParams }: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { slug } = await params;
  const { name: originalName } = await searchParams;
  
  // Use the original name for API calls if available, otherwise fall back to slug
  const locationQuery = originalName || slug;
  
  // Use the server action to fetch city data
  const cityData = await getCityData(locationQuery);

  if (cityData.error || !cityData.cityName) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">City Not Found</h1>
        <p className="mb-8">We couldn't find comprehensive information for "{slug}". This could be due to an issue fetching data or the location not being recognized. Please check the city name or try another search.</p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  // Fetch dynamic image from Google Places
  const imageResult = await getCityImage(cityData.cityName, cityData.country);
  
  const finalCityPageData: CityPageData = {
    slug,
    cityName: cityData.cityName,
    name: cityData.cityName,
    country: cityData.country || "Unknown",
    region: cityData.region,
    state: cityData.state,
    cityDescription: cityData.cityDescription || `Explore ${cityData.cityName}`,
    description: cityData.cityDescription || `Explore ${cityData.cityName}`,
    coordinates: null, // We'll need to add coordinates to the response if needed
    image: imageResult.photoUrl || `/images/default-city.jpg`,
    imageAttribution: imageResult.attribution,
    attractions: cityData.attractions,
    kitchens: cityData.kitchens,
    stays: cityData.stays,
  };

  return <DynamicCityContent cityPageData={finalCityPageData} />;
}

