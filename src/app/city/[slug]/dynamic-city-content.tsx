"use client"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Utensils, Hotel, Compass, Star, ExternalLink, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { useState } from "react"
import { AboutModal } from "@/components/modals/about-modal"
import { SettingsModal } from "@/components/modals/settings-modal"
import { LicenseModal } from "@/components/modals/license-modal"
import { useCityData } from "@/lib/hooks/useCityData"

interface CityBasicData {
  name: string
  country: string
  description: string
  image: string
}

interface DynamicCityContentProps {
  citySlug: string
  cityBasicData: CityBasicData
}

export function DynamicCityContent({ citySlug, cityBasicData }: DynamicCityContentProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLicenseOpen, setIsLicenseOpen] = useState(false)
  const { loading, error, attractions, restaurants, hotels, activities } = useCityData(citySlug)

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
            src={cityBasicData.image || "/placeholder.svg"}
            alt={cityBasicData.name}
            fill
            className="object-cover brightness-75"
            priority
          />
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">{cityBasicData.name}</h1>
          <p className="text-xl text-white">{cityBasicData.country}</p>
        </div>
      </section>

      {/* City Description */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-lg text-center max-w-3xl mx-auto">{cityBasicData.description}</p>
        </div>
      </section>

      {error && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          </div>
        </section>
      )}

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
                <span className="hidden sm:inline">Activities</span>
              </TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading city data...</span>
              </div>
            ) : (
              <>
                {/* Attractions Tab */}
                <TabsContent value="attractions" className="mt-6">
                  <h2 className="text-2xl font-bold mb-6">Top Attractions in {cityBasicData.name}</h2>
                  {attractions.length === 0 ? (
                    <p>No attraction data available.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {attractions.map((attraction) => (
                        <Card key={attraction.id} className="overflow-hidden">
                          <div className="relative h-48 w-full bg-muted">
                            {attraction.pictures && attraction.pictures.length > 0 ? (
                              <Image
                                src={attraction.pictures[0]}
                                alt={attraction.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <MapPin className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="flex items-center bg-white/80 backdrop-blur-sm">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                {attraction.rank ? (attraction.rank / 20).toFixed(1) : "N/A"}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-xl font-semibold mb-2">{attraction.name}</h3>
                            <p className="text-muted-foreground">
                              {attraction.description?.text || "No description available."}
                            </p>
                            {attraction.tags && attraction.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {attraction.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Food Tab */}
                <TabsContent value="food" className="mt-6">
                  <h2 className="text-2xl font-bold mb-6">Where to Eat in {cityBasicData.name}</h2>
                  {restaurants.length === 0 ? (
                    <p>No restaurant data available.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {restaurants.map((restaurant) => (
                        <Card key={restaurant.id} className="overflow-hidden">
                          <div className="relative h-48 w-full bg-muted">
                            {restaurant.pictures && restaurant.pictures.length > 0 ? (
                              <Image
                                src={restaurant.pictures[0]}
                                alt={restaurant.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Utensils className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="flex items-center bg-white/80 backdrop-blur-sm">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                {restaurant.rank ? (restaurant.rank / 20).toFixed(1) : "N/A"}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
                            <p className="text-muted-foreground">
                              {restaurant.description?.text || "No description available."}
                            </p>
                            {restaurant.tags && restaurant.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {restaurant.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Accommodations Tab */}
                <TabsContent value="accommodations" className="mt-6">
                  <h2 className="text-2xl font-bold mb-6">Where to Stay in {cityBasicData.name}</h2>
                  {hotels.length === 0 ? (
                    <p>No hotel data available.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {hotels.map((hotel) => (
                        <Card key={hotel.id} className="overflow-hidden">
                          <div className="relative h-48 w-full bg-muted">
                            {hotel.pictures && hotel.pictures.length > 0 ? (
                              <Image
                                src={hotel.pictures[0]}
                                alt={hotel.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Hotel className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="flex items-center bg-white/80 backdrop-blur-sm">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                {hotel.rank ? (hotel.rank / 20).toFixed(1) : "N/A"}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
                            <p className="text-muted-foreground">
                              {hotel.description?.text || "No description available."}
                            </p>
                            {hotel.tags && hotel.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {hotel.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Activities Tab */}
                <TabsContent value="tours" className="mt-6">
                  <h2 className="text-2xl font-bold mb-6">Activities in {cityBasicData.name}</h2>
                  {activities.length === 0 ? (
                    <p>No activity data available.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activities.map((activity) => (
                        <Card key={activity.id} className="overflow-hidden">
                          <div className="relative h-48 w-full bg-muted">
                            {activity.pictures && activity.pictures.length > 0 ? (
                              <Image
                                src={activity.pictures[0]}
                                alt={activity.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Compass className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="flex items-center bg-white/80 backdrop-blur-sm">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                {activity.rank ? (activity.rank / 20).toFixed(1) : "N/A"}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-xl font-semibold mb-2">{activity.name}</h3>
                            <p className="text-muted-foreground">
                              {activity.description?.text || "No description available."}
                            </p>
                            {activity.tags && activity.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {activity.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </section>

      {/* AI Assistant Prompt */}
      <section className="py-12 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Personalized Recommendations?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Our AI assistant can help you plan the perfect trip to {cityBasicData.name} based on your preferences.
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