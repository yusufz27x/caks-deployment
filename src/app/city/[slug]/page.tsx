import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DynamicCityContent } from "./dynamic-city-content"
import type { Coordinates } from "@/lib/hooks/useCityData" // Import Coordinates type

// Removed hardcoded cityData object
// Removed generateStaticParams function

interface CityPageData {
  slug: string;
  name: string;
  country: string;
  description: string;
  image: string;
  coordinates: Coordinates | null;
}

async function getCityImage(cityName: string): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
    console.warn("Unsplash API key not found. Skipping dynamic image fetch.");
    return null;
  }
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(cityName)}&per_page=1&orientation=landscape&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
    );
    if (!response.ok) {
      console.error(`Unsplash API error for ${cityName}: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      // console.error(`Error body: ${errorBody}`); // Potentially too verbose for general logging
      return null;
    }
    const data = await response.json();
    if (data.results && data.results.length > 0 && data.results[0].urls) {
      return data.results[0].urls.regular;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch image from Unsplash for ${cityName}:`, error);
    return null;
  }
}

async function fetchCityBaseData(slug: string): Promise<CityPageData | null> {
  if (!process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY) {
    console.error("Geoapify API key not found. Cannot fetch city base data.");
    return null;
  }
  try {
    const geoResponse = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(slug)}&limit=1&format=json&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
    );
    if (!geoResponse.ok) {
      console.error(`Geoapify Geocoding API error for ${slug}: ${geoResponse.status} ${geoResponse.statusText}`);
      return null;
    }
    const geoData = await geoResponse.json();

    if (geoData.results && geoData.results.length > 0) {
      const result = geoData.results[0];
      const name = result.city || result.name || slug;
      // Attempt to create a simple description if not directly available
      let description = `Explore ${name}, ${result.country || 'a vibrant location'}. Discover its top attractions, culinary delights, and comfortable stays.`;
      if (result.formatted) { // Use formatted address as part of description if available
        description = `${result.formatted}. ` + description;
      }
      
      const cityPageData: CityPageData = {
        slug: slug,
        name: name,
        country: result.country || "Unknown",
        description: description, // Replace with a more sophisticated description if available from API or a different source
        image: `/images/${slug}.jpg`, // Default fallback image, will be overridden by Unsplash
        coordinates: {
          latitude: result.lat.toString(),
          longitude: result.lon.toString(),
        },
      };
      return cityPageData;
    }
    console.warn(`No geocoding results found for slug: ${slug}`);
    return null;
  } catch (error) {
    console.error(`Failed to fetch base data for ${slug} from Geoapify:`, error);
    return null;
  }
}

export default async function CityPage({ params }: { params: { slug: string } }) {
  const cityBaseData = await fetchCityBaseData(params.slug);

  if (!cityBaseData || !cityBaseData.coordinates) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">City Not Found</h1>
        <p className="mb-8">We couldn't find information for "{params.slug}". Please check the city name or try another search.</p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  const dynamicImageUrl = await getCityImage(cityBaseData.name);
  
  const finalCityPageData: CityPageData = {
    ...cityBaseData,
    image: dynamicImageUrl || cityBaseData.image, // Use fetched Unsplash image or the default fallback
  };

  // Pass coordinates directly to DynamicCityContent, which then passes to useCityData
  return <DynamicCityContent cityPageData={finalCityPageData} />;
}

