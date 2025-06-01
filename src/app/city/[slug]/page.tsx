import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DynamicCityContent } from "./dynamic-city-content"
import type { Coordinates } from "@/lib/hooks/useCityData" // Import Coordinates type

// Define the structure for individual items (attractions, kitchens, stays)
interface PlaceItem {
  name: string;
  description: string;
  website?: string; // Optional as it might be "N/A"
  googleMapsLink?: string; // Optional
}

// Updated CityPageData to match Gemini API response
interface CityPageData {
  slug: string; // Will be derived from params
  cityName: string;
  country: string;
  cityDescription: string;
  coordinates: Coordinates | null;
  image: string; // Image will always be a string after processing
  attractions: PlaceItem[];
  kitchens: PlaceItem[];
  stays: PlaceItem[];
  // Add any other fields that might come from Gemini or are needed by DynamicCityContent
  // For example, if DynamicCityContent expects 'name', ensure it's mapped from 'cityName'
  name: string; // For compatibility with DynamicCityContent if it expects 'name'
  description: string; // For compatibility, mapped from cityDescription
}

async function fetchCityDataFromGemini(slug: string): Promise<Omit<CityPageData, 'image'> & { image?: string } | null> {
  try {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000";
    const apiURL = new URL("/api/gemini", baseURL).toString();

    const apiResponse = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locationQuery: slug }),
    });

    if (!apiResponse.ok) {
      console.error(`Error fetching city data from Gemini for ${slug}: ${apiResponse.status} ${apiResponse.statusText}`);
      const errorBody = await apiResponse.text();
      console.error(`Error body: ${errorBody}`);
      return null;
    }

    const data = await apiResponse.json();

    if (data.error) {
      console.error(`Gemini API returned an error for ${slug}: ${data.error}`);
      if (data.geminiRawResponse) {
        console.error(`Gemini raw response: ${data.geminiRawResponse}`);
      }
      return null;
    }
    
    // Validate if essential data like coordinates is present
    if (!data.coordinates || typeof data.coordinates.latitude === 'undefined' || typeof data.coordinates.longitude === 'undefined') {
        console.warn(`Coordinates missing or invalid for slug: ${slug} from Gemini response.`);
        // Decide if you want to return null or proceed with partial data
        // For now, returning null if coordinates are critical
        return null;
    }


    // Construct CityPageData from the Gemini response
    const cityPageData: Omit<CityPageData, 'image'> & { image?: string } = {
      slug: slug,
      cityName: data.cityName || slug,
      name: data.cityName || slug, // Mapping for existing components
      country: data.country || "Unknown",
      cityDescription: data.cityDescription || `Explore ${data.cityName || slug}.`,
      description: data.cityDescription || `Explore ${data.cityName || slug}.`, // Mapping
      coordinates: { // Ensure coordinates are strings as per original Coordinates type
          latitude: String(data.coordinates.latitude),
          longitude: String(data.coordinates.longitude),
      },
      // Image can be handled similarly to before, or if Gemini provides one
      // For now, let's assume image will be fetched by getCityImage or a default is used
      // image: data.imageUrl || `/images/${slug}.jpg`, // Example if Gemini could provide an image URL
      attractions: data.attractions || [],
      kitchens: data.kitchens || [],
      stays: data.stays || [],
    };
    return cityPageData;
  } catch (error) {
    console.error(`Failed to fetch or process city data for ${slug} from /api/gemini:`, error);
    return null;
  }
}


// Keep getCityImage if you still want to use Unsplash as a primary or fallback image source
async function getCityImage(cityName: string): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
    // console.warn("Unsplash API key not found. Skipping dynamic image fetch."); // Less verbose
    return null;
  }
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(cityName)}&per_page=1&orientation=landscape&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
    );
    if (!response.ok) {
      // console.error(`Unsplash API error for ${cityName}: ${response.status}`); // Less verbose
      return null;
    }
    const data = await response.json();
    if (data.results && data.results.length > 0 && data.results[0].urls) {
      return data.results[0].urls.regular;
    }
    return null;
  } catch (error) {
    // console.error(`Failed to fetch image from Unsplash for ${cityName}:`, error); // Less verbose
    return null;
  }
}


export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // Await params before destructuring (Next.js 15)
  // Fetch all city data, including attractions, kitchens, stays, from Gemini
  const cityDataFromGemini = await fetchCityDataFromGemini(slug);

  if (!cityDataFromGemini || !cityDataFromGemini.coordinates) {
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

  // Fetch dynamic image from Unsplash, using the cityName from Gemini's response
  const dynamicImageUrl = await getCityImage(cityDataFromGemini.cityName);
  
  const finalCityPageData: CityPageData = {
    ...cityDataFromGemini,
    // Ensure image is always a string. Prioritize Unsplash, then Gemini (if any), then a default.
    image: dynamicImageUrl || cityDataFromGemini.image || `/images/default-city.jpg`, 
  };

  // Pass the comprehensive data to DynamicCityContent
  // DynamicCityContent will need to be updated to use this new structure,
  // especially for displaying attractions, kitchens, and stays.
  return <DynamicCityContent cityPageData={finalCityPageData} />;
}

