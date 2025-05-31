"use client"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Utensils, Hotel, Star, ExternalLink, Loader2, Activity } from "lucide-react"
import { Header } from "@/components/header/header"
import { useState } from "react"
import { AboutModal } from "@/components/header/header-modals/about-modal"
import { SettingsModal } from "@/components/header/header-modals/settings-modal"
import { LicenseModal } from "@/components/header/header-modals/license-modal"
import { useCityData, type Coordinates } from "@/lib/hooks/useCityData"
import { CitySearch } from "@/components/shared/city-search"

interface CityPageData {
  slug: string;
  name: string;
  country: string;
  description: string;
  image: string;
  coordinates: Coordinates | null;
}

interface DynamicCityContentProps {
  cityPageData: CityPageData;
}

export function DynamicCityContent({ cityPageData }: DynamicCityContentProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLicenseOpen, setIsLicenseOpen] = useState(false)
  const { loading, error, attractions, restaurants, hotels, activities } = useCityData(cityPageData.coordinates)

  const { name: cityName, country, description, image } = cityPageData

  if (loading && !cityPageData.coordinates) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-4 text-xl text-black/90 dark:text-white/90">Loading city information...</span>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/10 backdrop-blur-sm border-b border-transparent dark:border-transparent">
        <Header 
          onAboutClick={() => setIsAboutOpen(true)}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onLicenseClick={() => setIsLicenseOpen(true)}
        />
      </div>

      {/* Hero Section */}
      <section className="relative h-[50vh] pt-[64px] -mt-[1px]">
        <div className="absolute inset-0 top-0">
          <Image
            src={image || "/placeholder.svg"}
            alt={cityName}
            fill
            className="object-cover brightness-75"
            priority
          />
          <div className="absolute inset-0 bg-black/0 dark:bg-black/40 transition-colors duration-300" />
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">{cityName}</h1>
          <p className="text-xl text-white">{country}</p>
        </div>
      </section>

      {/* City Description */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-lg text-center max-w-3xl mx-auto text-black/90 dark:text-white/90">{description}</p>
        </div>
      </section>

      {/* City Search */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center text-black dark:text-white">Explore Another City</h2>
            <CitySearch />
          </div>
        </div>
      </section>

      {error && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
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
            <TabsList className="grid w-full grid-cols-4 gap-4 p-4">
              <TabsTrigger value="attractions" className="flex items-center justify-center border-gray-200 dark:border-gray-800 rounded-md h-12 text-base">
                <MapPin className="h-5 w-5 mr-2" />
                <span>Attractions</span>
              </TabsTrigger>
              <TabsTrigger value="food" className="flex items-center justify-center border-gray-200 dark:border-gray-800 rounded-md h-12 text-base">
                <Utensils className="h-5 w-5 mr-2" />
                <span>Kitchen</span>
              </TabsTrigger>
              <TabsTrigger value="accommodations" className="flex items-center justify-center border-gray-200 dark:border-gray-800 rounded-md h-12 text-base">
                <Hotel className="h-5 w-5 mr-2" />
                <span>Stay</span>
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center justify-center border-gray-200 dark:border-gray-800 rounded-md h-12 text-base">
                <Activity className="h-5 w-5 mr-2" />
                <span>Activities</span>
              </TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-black/90 dark:text-white/90">Loading points of interest...</span>
              </div>
            ) : (
              <>
                {/* Attractions Tab */}
                <TabsContent value="attractions" className="mt-6 border border-gray-100 dark:border-gray-800 rounded-md p-4">
                  <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Top Attractions in {cityName}</h2>
                  {attractions.length === 0 ? (
                    <p className="text-black/90 dark:text-white/90">No attraction data available.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {attractions.map((item) => (
                        <Card key={item.id} className="overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/90">
                          <div className="relative h-48 w-full bg-muted flex items-center justify-center">
                            <MapPin className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">{item.name}</h3>
                            {item.formattedAddress && (
                              <p className="text-sm text-black/70 dark:text-white/70 mb-2">{item.formattedAddress}</p>
                            )}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2 mb-2">
                                {item.tags.slice(0, 3).map((tag: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs capitalize text-black/70 dark:text-white/70 border-gray-300 dark:border-gray-600">
                                    {tag.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {(item.geoCode?.latitude && item.geoCode?.longitude) && (
                                <Button variant="outline" size="sm" asChild className="mt-2 mr-2">
                                  <Link href={`https://www.google.com/maps/search/?api=1&query=${item.geoCode.latitude},${item.geoCode.longitude}`} target="_blank" rel="noopener noreferrer">
                                    <MapPin className="h-4 w-4 mr-1" /> View Map
                                  </Link>
                                </Button>
                            )}
                            {item.website && (
                                <Button variant="outline" size="sm" asChild className="mt-2">
                                  <Link href={item.website.startsWith('http') ? item.website : `http://${item.website}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-1" /> Website
                                  </Link>
                                </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Food Tab */}
                <TabsContent value="food" className="mt-6 border border-gray-100 dark:border-gray-800 rounded-md p-4">
                  <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Where to Eat in {cityName}</h2>
                  {restaurants.length === 0 ? (
                    <p className="text-black/90 dark:text-white/90">No restaurant data available.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {restaurants.map((item) => (
                        <Card key={item.id} className="overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/90">
                           <div className="relative h-48 w-full bg-muted flex items-center justify-center">
                            <Utensils className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">{item.name}</h3>
                            {item.formattedAddress && (
                              <p className="text-sm text-black/70 dark:text-white/70 mb-2">{item.formattedAddress}</p>
                            )}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2 mb-2">
                                {item.tags.slice(0, 3).map((tag: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs capitalize text-black/70 dark:text-white/70 border-gray-300 dark:border-gray-600">
                                    {tag.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            )}
                             {(item.geoCode?.latitude && item.geoCode?.longitude) && (
                                <Button variant="outline" size="sm" asChild className="mt-2 mr-2">
                                  <Link href={`https://www.google.com/maps/search/?api=1&query=${item.geoCode.latitude},${item.geoCode.longitude}`} target="_blank" rel="noopener noreferrer">
                                    <MapPin className="h-4 w-4 mr-1" /> View Map
                                  </Link>
                                </Button>
                            )}
                            {item.website && (
                                <Button variant="outline" size="sm" asChild className="mt-2">
                                  <Link href={item.website.startsWith('http') ? item.website : `http://${item.website}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-1" /> Website
                                  </Link>
                                </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Accommodations Tab */}
                <TabsContent value="accommodations" className="mt-6 border border-gray-100 dark:border-gray-800 rounded-md p-4">
                  <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Places to Stay in {cityName}</h2>
                  {hotels.length === 0 ? (
                    <p className="text-black/90 dark:text-white/90">No accommodation data available.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {hotels.map((item) => (
                        <Card key={item.id} className="overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/90">
                          <div className="relative h-48 w-full bg-muted flex items-center justify-center">
                            <Hotel className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">{item.name}</h3>
                            {item.formattedAddress && (
                              <p className="text-sm text-black/70 dark:text-white/70 mb-2">{item.formattedAddress}</p>
                            )}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2 mb-2">
                                {item.tags.slice(0, 3).map((tag: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs capitalize text-black/70 dark:text-white/70 border-gray-300 dark:border-gray-600">
                                    {tag.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {(item.geoCode?.latitude && item.geoCode?.longitude) && (
                                <Button variant="outline" size="sm" asChild className="mt-2 mr-2">
                                  <Link href={`https://www.google.com/maps/search/?api=1&query=${item.geoCode.latitude},${item.geoCode.longitude}`} target="_blank" rel="noopener noreferrer">
                                    <MapPin className="h-4 w-4 mr-1" /> View Map
                                  </Link>
                                </Button>
                            )}
                            {item.website && (
                                <Button variant="outline" size="sm" asChild className="mt-2">
                                  <Link href={item.website.startsWith('http') ? item.website : `http://${item.website}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-1" /> Website
                                  </Link>
                                </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Activities Tab - now populated by Geoapify */}
                <TabsContent value="activities" className="mt-6 border border-gray-100 dark:border-gray-800 rounded-md p-4">
                  <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Things to Do in {cityName}</h2>
                  {activities.length === 0 ? (
                    <p className="text-black/90 dark:text-white/90">No activity data available.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activities.map((item) => (
                        <Card key={item.id} className="overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/90">
                          <div className="relative h-48 w-full bg-muted flex items-center justify-center">
                            <Activity className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">{item.name}</h3>
                            {item.formattedAddress && (
                              <p className="text-sm text-black/70 dark:text-white/70 mb-2">{item.formattedAddress}</p>
                            )}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2 mb-2">
                                {item.tags.slice(0, 3).map((tag: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs capitalize text-black/70 dark:text-white/70 border-gray-300 dark:border-gray-600">
                                    {tag.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {(item.geoCode?.latitude && item.geoCode?.longitude) && (
                                <Button variant="outline" size="sm" asChild className="mt-2 mr-2">
                                  <Link href={`https://www.google.com/maps/search/?api=1&query=${item.geoCode.latitude},${item.geoCode.longitude}`} target="_blank" rel="noopener noreferrer">
                                    <MapPin className="h-4 w-4 mr-1" /> View Map
                                  </Link>
                                </Button>
                            )}
                            {item.website && (
                                <Button variant="outline" size="sm" asChild className="mt-2">
                                  <Link href={item.website.startsWith('http') ? item.website : `http://${item.website}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-1" /> Website
                                  </Link>
                                </Button>
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
          <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Need Personalized Recommendations?</h2>
          <p className="mb-6 max-w-2xl mx-auto text-black/90 dark:text-white/90">
            Our AI assistant can help you plan the perfect trip to {cityName} based on your preferences.
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