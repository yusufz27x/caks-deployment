"use client"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Utensils, Hotel, Compass, Star, ExternalLink } from "lucide-react"
import { Header } from "@/components/header"
import { useState } from "react"
import { AboutModal } from "@/components/modals/about-modal"
import { SettingsModal } from "@/components/modals/settings-modal"
import { LicenseModal } from "@/components/modals/license-modal"

interface CityData {
  name: string
  country: string
  description: string
  image: string
  attractions: Array<{
    name: string
    description: string
    image: string
    rating: number
  }>
  food: Array<{
    name: string
    description: string
    image: string
    rating: number
    priceRange: string
  }>
  accommodations: Array<{
    name: string
    description: string
    image: string
    rating: number
    priceRange: string
  }>
  tours: Array<{
    name: string
    description: string
    image: string
    duration: string
    price: string
  }>
}

interface CityContentProps {
  city: CityData
}

export function CityContent({ city }: CityContentProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLicenseOpen, setIsLicenseOpen] = useState(false)

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/10 backdrop-blur-sm border-b">
        <Header 
          onAboutClick={() => setIsAboutOpen(true)}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onLicenseClick={() => setIsLicenseOpen(true)}
        />
      </div>

      {/* Hero Section */}
      <section className="relative h-[50vh] pt-[64px]">
        <div className="absolute inset-0">
          <Image
            src={city.image || "/placeholder.svg"}
            alt={city.name}
            fill
            className="object-cover brightness-75"
            priority
          />
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">{city.name}</h1>
          <p className="text-xl text-white">{city.country}</p>
        </div>
      </section>

      {/* City Description */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-lg text-center max-w-3xl mx-auto">{city.description}</p>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="attractions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="attractions" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Attractions</span>
              </TabsTrigger>
              <TabsTrigger value="food" className="flex items-center">
                <Utensils className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cuisine</span>
              </TabsTrigger>
              <TabsTrigger value="accommodations" className="flex items-center">
                <Hotel className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Accommodations</span>
              </TabsTrigger>
              <TabsTrigger value="tours" className="flex items-center">
                <Compass className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Tours</span>
              </TabsTrigger>
            </TabsList>

            {/* Attractions Tab */}
            <TabsContent value="attractions" className="mt-6">
              <h2 className="text-2xl font-bold mb-6">Top Attractions in {city.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {city.attractions.map((attraction, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative h-48 w-full">
                      <Image
                        src={attraction.image || "/placeholder.svg"}
                        alt={attraction.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="flex items-center bg-white/80 backdrop-blur-sm">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          {attraction.rating}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{attraction.name}</h3>
                      <p className="text-muted-foreground">{attraction.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Food Tab */}
            <TabsContent value="food" className="mt-6">
              <h2 className="text-2xl font-bold mb-6">Where to Eat in {city.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {city.food.map((restaurant, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative h-48 w-full">
                      <Image
                        src={restaurant.image || "/placeholder.svg"}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="flex items-center bg-white/80 backdrop-blur-sm">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          {restaurant.rating}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold">{restaurant.name}</h3>
                        <Badge variant="outline">{restaurant.priceRange}</Badge>
                      </div>
                      <p className="text-muted-foreground">{restaurant.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Accommodations Tab */}
            <TabsContent value="accommodations" className="mt-6">
              <h2 className="text-2xl font-bold mb-6">Where to Stay in {city.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {city.accommodations.map((accommodation, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative h-48 w-full">
                      <Image
                        src={accommodation.image || "/placeholder.svg"}
                        alt={accommodation.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="flex items-center bg-white/80 backdrop-blur-sm">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          {accommodation.rating}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold">{accommodation.name}</h3>
                        <Badge variant="outline">{accommodation.priceRange}</Badge>
                      </div>
                      <p className="text-muted-foreground">{accommodation.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tours Tab */}
            <TabsContent value="tours" className="mt-6">
              <h2 className="text-2xl font-bold mb-6">Guided Tours in {city.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {city.tours.map((tour, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative h-48 w-full">
                      <Image src={tour.image || "/placeholder.svg"} alt={tour.name} fill className="object-cover" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{tour.name}</h3>
                      <p className="text-muted-foreground mb-4">{tour.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Duration: {tour.duration}</span>
                        <Badge>{tour.price}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* AI Assistant Prompt */}
      <section className="py-12 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Personalized Recommendations?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Our AI assistant can help you plan the perfect trip to {city.name} based on your preferences.
          </p>
          <Button asChild size="lg">
            <Link href="/ai-assistant">
              Ask AI Assistant
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Modals */}
      <AboutModal open={isAboutOpen} onOpenChange={setIsAboutOpen} />
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <LicenseModal open={isLicenseOpen} onOpenChange={setIsLicenseOpen} />
    </main>
  )
} 