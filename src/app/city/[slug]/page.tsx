import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DynamicCityContent } from "./dynamic-city-content"

// This would typically come from an API or database
// But we'll keep basic city info here
const cityData = {
  paris: {
    name: "Paris",
    country: "France",
    description: 'Known as the "City of Light," Paris is famous for its art, fashion, gastronomy, and culture.',
    image: "/images/paris.jpg", // Fallback image
  },
  london: {
    name: "London",
    country: "United Kingdom",
    description: 'London is the capital and largest city of England and the United Kingdom, known for its history, architecture, and cultural diversity.',
    image: "/images/london.jpg", // Fallback image
  },
  rome: {
    name: "Rome",
    country: "Italy",
    description: 'The Eternal City is known for its ancient ruins, art, architecture, and delicious cuisine.',
    image: "/images/rome.jpg", // Fallback image
  },
  'new-york': {
    name: "New York City",
    country: "United States",
    description: 'Known as the Big Apple, New York is famous for its skyline, Broadway shows, and cultural diversity.',
    image: "/images/new-york.jpg", // Fallback image
  },
  tokyo: {
    name: "Tokyo",
    country: "Japan",
    description: 'The capital of Japan blends ultra-modern and traditional, with neon-lit skyscrapers and historic temples.',
    image: "/images/tokyo.jpg", // Fallback image
  }
  // Add more cities as needed
}

export async function generateStaticParams() {
  return Object.keys(cityData).map((slug) => ({
    slug,
  }));
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
      console.error(`Unsplash API error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error(`Error body: ${errorBody}`);
      return null;
    }
    const data = await response.json();
    if (data.results && data.results.length > 0 && data.results[0].urls) {
      return data.results[0].urls.regular; // Or urls.full for higher quality
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch image from Unsplash:", error);
    return null;
  }
}

export default async function CityPage({ params }: { params: { slug: string } }) {
  const cityInfo = cityData[params.slug as keyof typeof cityData];

  if (!cityInfo) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">City Not Found</h1>
        <p className="mb-8">We couldn't find information about this city.</p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    )
  }

  let dynamicImageUrl = await getCityImage(cityInfo.name);
  
  const finalCityData = {
    ...cityInfo,
    image: dynamicImageUrl || cityInfo.image, // Use fetched image or fallback to static one
  };

  return <DynamicCityContent citySlug={params.slug} cityBasicData={finalCityData} />;
}

