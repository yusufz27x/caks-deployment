import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DynamicCityContent } from "./dynamic-city-content"
import type { Coordinates } from "@/lib/hooks/useCityData"
import { getCachedResponse, setCachedResponse } from '@/lib/cityCache'
import { getCityData } from "@/lib/actions/getCityData"

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
  cityDescription: string;
  coordinates: Coordinates | null;
  image: string;
  attractions: PlaceItem[];
  kitchens: PlaceItem[];
  stays: PlaceItem[];
  name: string;
  description: string;
}

// Keep getCityImage for Unsplash image fetching
async function getCityImage(cityName: string): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
    // console.warn("Unsplash API key not found. Skipping dynamic image fetch."); // Less verbose
    return null;
  }

  const endpoint = 'unsplash';
  const cacheParams = { cityName };

  // Check cache first
  try {
    const cachedResponse = await getCachedResponse(endpoint, cacheParams);
    if (cachedResponse) {
      console.log('Returning cached Unsplash image for:', cityName);
      return cachedResponse.imageUrl;
    }
  } catch (cacheError) {
    console.warn('Cache lookup failed for Unsplash, proceeding with API call:', cacheError);
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(cityName)}&per_page=1&orientation=landscape&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
    );
    if (!response.ok) {
      console.error(`Unsplash API error for ${cityName}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    
    let imageUrl = null;
    if (data.results && data.results.length > 0 && data.results[0].urls) {
      imageUrl = data.results[0].urls.regular;
      
      // Cache the successful response
      try {
        const cacheData = { imageUrl };
        await setCachedResponse(endpoint, cacheParams, cacheData);
        console.log('Cached new Unsplash image for:', cityName);
      } catch (cacheError) {
        console.warn('Failed to cache Unsplash response:', cacheError);
      }
    }
    
    return imageUrl;
  } catch (error) {
    console.error(`Failed to fetch image from Unsplash for ${cityName}:`, error);
    return null;
  }
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Use the server action to fetch city data
  const cityData = await getCityData(slug);

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

  // Fetch dynamic image from Unsplash
  const dynamicImageUrl = await getCityImage(cityData.cityName);
  
  const finalCityPageData: CityPageData = {
    slug,
    cityName: cityData.cityName,
    name: cityData.cityName,
    country: cityData.country || "Unknown",
    cityDescription: cityData.cityDescription || `Explore ${cityData.cityName}`,
    description: cityData.cityDescription || `Explore ${cityData.cityName}`,
    coordinates: null, // We'll need to add coordinates to the response if needed
    image: dynamicImageUrl || `/images/default-city.jpg`,
    attractions: cityData.attractions,
    kitchens: cityData.kitchens,
    stays: cityData.stays,
  };

  return <DynamicCityContent cityPageData={finalCityPageData} />;
}

