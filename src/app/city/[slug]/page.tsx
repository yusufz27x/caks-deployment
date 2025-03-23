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
    image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/city-backgrounds/paris.jpg`,
  },
  london: {
    name: "London",
    country: "United Kingdom",
    description: 'London is the capital and largest city of England and the United Kingdom, known for its history, architecture, and cultural diversity.',
    image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/city-backgrounds/london.jpg`,
  },
  rome: {
    name: "Rome",
    country: "Italy",
    description: 'The Eternal City is known for its ancient ruins, art, architecture, and delicious cuisine.',
    image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/city-backgrounds/rome.jpg`,
  },
  'new-york': {
    name: "New York City",
    country: "United States",
    description: 'Known as the Big Apple, New York is famous for its skyline, Broadway shows, and cultural diversity.',
    image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/city-backgrounds/new-york.jpg`,
  },
  tokyo: {
    name: "Tokyo",
    country: "Japan",
    description: 'The capital of Japan blends ultra-modern and traditional, with neon-lit skyscrapers and historic temples.',
    image: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/city-backgrounds/tokyo.jpg`,
  }
  // Add more cities as needed
}

export async function generateStaticParams() {
  return Object.keys(cityData).map((slug) => ({
    slug,
  }));
}

export default async function CityPage({ params }: { params: { slug: string } }) {
  const city = cityData[params.slug as keyof typeof cityData];

  if (!city) {
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

  return <DynamicCityContent citySlug={params.slug} cityBasicData={city} />;
}

