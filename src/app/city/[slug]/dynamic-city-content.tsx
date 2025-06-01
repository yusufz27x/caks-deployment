"use client"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Utensils, Hotel, Star, ExternalLink, Loader2, Activity, Bot } from "lucide-react"
import { Header } from "@/components/header/header"
import { useState, useRef, useLayoutEffect } from "react"
import { AboutModal } from "@/components/header/header-modals/about-modal"
import { SettingsModal } from "@/components/header/header-modals/settings-modal"
import { LicenseModal } from "@/components/header/header-modals/license-modal"
import { AIAssistantModal } from "@/components/shared/ai-assistant-modal"
import { useCityData, type Coordinates } from "@/lib/hooks/useCityData"
import { CitySearch } from "@/components/shared/city-search"

// NEW: Tabs configuration
const tabsConfig = [
  {
    value: "attractions",
    label: "Attractions",
    icon: MapPin,
    activeClasses: "from-blue-500 to-purple-600",
    hoverClasses: "hover:bg-gray-500/10 dark:hover:bg-gray-400/10",
  },
  {
    value: "food",
    label: "Kitchen",
    icon: Utensils,
    activeClasses: "from-orange-500 to-red-600",
    hoverClasses: "hover:bg-gray-500/10 dark:hover:bg-gray-400/10",
  },
  {
    value: "accommodations",
    label: "Stay",
    icon: Hotel,
    activeClasses: "from-green-500 to-emerald-600",
    hoverClasses: "hover:bg-gray-500/10 dark:hover:bg-gray-400/10",
  },
];

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
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const { loading, error, attractions, kitchens, stays, cityName: hookCityName, country: hookCountry, cityDescription: hookCityDescription } = useCityData(cityPageData.coordinates, cityPageData.name)

  // NEW: State for animated tabs
  const [currentTabValue, setCurrentTabValue] = useState(tabsConfig[0].value);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);

  const displayName = hookCityName || cityPageData.name
  const displayCountry = hookCountry || cityPageData.country
  const displayDescription = hookCityDescription || cityPageData.description
  const { image } = cityPageData

  // NEW: useLayoutEffect for calculating underline position
  useLayoutEffect(() => {
    const activeIndex = tabsConfig.findIndex(tab => tab.value === currentTabValue);
    if (activeIndex !== -1 && tabsRef.current[activeIndex]) {
      const currentTabElement = tabsRef.current[activeIndex] as HTMLElement;
      setTabUnderlineLeft(currentTabElement.offsetLeft);
      setTabUnderlineWidth(currentTabElement.clientWidth);
    } else {
      // Fallback if no active tab or ref not ready (e.g. hide underline)
      // Attempt to set to the first tab if possible or hide
      if (tabsRef.current[0]) {
        setTabUnderlineLeft(tabsRef.current[0].offsetLeft);
        setTabUnderlineWidth(tabsRef.current[0].clientWidth);
      } else {
        setTabUnderlineWidth(0); // Hide if first tab also not available
      }
    }
  }, [currentTabValue]); // Rerun when currentTabValue changes

  const activeTabConfig = tabsConfig.find(tab => tab.value === currentTabValue);

  if (loading && !cityPageData.coordinates) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-gray-900 dark:to-purple-950/20">
        <div className="text-center space-y-4">
          <div className="p-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto w-fit">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading city information...</span>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg">
        <Header 
          onAboutClick={() => setIsAboutOpen(true)}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onLicenseClick={() => setIsLicenseOpen(true)}
        />
      </div>

      {/* Hero Section */}
      <section className="relative h-[60vh] pt-[64px] -mt-[1px]">
        <div className="absolute inset-0 top-0">
          <Image
            src={image || "/placeholder.svg"}
            alt={displayName}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl drop-shadow-lg">{displayName}</h1>
            <p className="text-2xl text-white/90 font-medium">{displayCountry}</p>
          </div>
        </div>
      </section>

      {/* City Description */}
      <section className="py-12 bg-gradient-to-r from-blue-50/50 via-white to-purple-50/50 dark:from-blue-950/10 dark:via-gray-900 dark:to-purple-950/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{displayDescription}</p>
            </div>
          </div>
        </div>
      </section>

      {/* City Search */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">Explore Another City</h2>
              <p className="text-gray-600 dark:text-gray-400">Discover amazing places around the world</p>
            </div>
            <CitySearch />
          </div>
        </div>
      </section>

      {error && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl relative shadow-lg backdrop-blur-sm">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tabs Section */}
      <section className="py-12 ">
        <div className="container px-4 mx-auto py-8">
          <Tabs 
            value={currentTabValue} 
            onValueChange={setCurrentTabValue} 
            className="w-full"
          >
            <TabsList className="relative flex w-full h-14 items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl mb-8 px-1">
              {/* Animated Underline/Background */}
              {activeTabConfig && (
                <span
                  className="absolute z-0 flex overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out"
                  style={{
                    left: tabUnderlineLeft,
                    width: tabUnderlineWidth,
                    top: '0.25rem', // Based on TabsList h-14 (3.5rem) and px-1 (0.25rem) and trigger h-12 (3rem)
                    height: '3rem', // Explicitly h-12 (3rem)
                  }}
                >
                  <span 
                    className={`h-full w-full rounded-xl bg-gradient-to-r ${activeTabConfig.activeClasses}`} 
                  />
                </span>
              )}

              {tabsConfig.map((tab, index) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    ref={(el) => { tabsRef.current[index] = el; }}
                    value={tab.value}
                    className={`relative z-10 flex-1 flex items-center justify-center rounded-xl h-12 text-base font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:focus-visible:ring-purple-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 ${tab.hoverClasses} ${currentTabValue === tab.value ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    <IconComponent className="h-4 w-4 mr-2" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center space-y-4">
                  <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto w-fit">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading points of interest...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Attractions Tab */}
                <TabsContent value="attractions" className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-xl">
                  <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Top Attractions in {displayName}</h2>
                  {attractions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 mx-auto w-fit mb-4">
                        <MapPin className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">No attraction data available.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {attractions.map((item) => (
                        <Card key={item.id} className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50/80 via-white to-purple-50/80 dark:from-blue-950/20 dark:via-gray-900 dark:to-purple-950/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <CardHeader className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                              <Badge variant="secondary" className="bg-blue-100/80 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800 backdrop-blur-sm">
                                <MapPin className="h-3 w-3 mr-1" />
                                Attraction
                              </Badge>
                              <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <MapPin className="h-6 w-6" />
                              </div>
                            </div>
                            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                              {item.name}
                            </CardTitle>
                          </CardHeader>
                          
                          <CardContent className="space-y-4 relative z-10">
                            {item.description && (
                              <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {item.description}
                              </CardDescription>
                            )}
                            
                            <div className="flex flex-wrap gap-2">
                              {item.googleMapsLink && item.googleMapsLink !== "N/A" && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  asChild 
                                  className="relative z-20 flex-1 min-w-0 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-600 dark:hover:bg-blue-950/30 transition-all duration-200 font-medium backdrop-blur-sm"
                                >
                                  <Link href={item.googleMapsLink} target="_blank" rel="noopener noreferrer">
                                    <MapPin className="h-4 w-4 mr-1" /> View Map
                                  </Link>
                                </Button>
                              )}
                              {item.website && item.website !== "N/A" && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  asChild 
                                  className="relative z-20 flex-1 min-w-0 border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:border-purple-800 dark:hover:border-purple-600 dark:hover:bg-purple-950/30 transition-all duration-200 font-medium backdrop-blur-sm"
                                >
                                  <Link href={item.website.startsWith('http') ? item.website : `http://${item.website}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-1" /> Website
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Food Tab */}
                <TabsContent value="food" className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-xl">
                  <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Where to Eat in {displayName}</h2>
                  {kitchens.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-6 rounded-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950/50 dark:to-red-950/50 mx-auto w-fit mb-4">
                        <Utensils className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">No restaurant data available.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {kitchens.map((item) => (
                        <Card key={item.id} className="group relative overflow-hidden border-0 bg-gradient-to-br from-orange-50/80 via-white to-red-50/80 dark:from-orange-950/20 dark:via-gray-900 dark:to-red-950/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <CardHeader className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                              <Badge variant="secondary" className="bg-orange-100/80 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800 backdrop-blur-sm">
                                <Utensils className="h-3 w-3 mr-1" />
                                Restaurant
                              </Badge>
                              <div className="p-3 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <Utensils className="h-6 w-6" />
                              </div>
                            </div>
                            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                              {item.name}
                            </CardTitle>
                          </CardHeader>
                          
                          <CardContent className="space-y-4 relative z-10">
                            {item.description && (
                              <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {item.description}
                              </CardDescription>
                            )}
                            
                            <div className="flex flex-wrap gap-2">
                              {item.googleMapsLink && item.googleMapsLink !== "N/A" && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  asChild 
                                  className="relative z-20 flex-1 min-w-0 border-orange-200 hover:border-orange-400 hover:bg-orange-50 dark:border-orange-800 dark:hover:border-orange-600 dark:hover:bg-orange-950/30 transition-all duration-200 font-medium backdrop-blur-sm"
                                >
                                  <Link href={item.googleMapsLink} target="_blank" rel="noopener noreferrer">
                                    <MapPin className="h-4 w-4 mr-1" /> View Map
                                  </Link>
                                </Button>
                              )}
                              {item.website && item.website !== "N/A" && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  asChild 
                                  className="relative z-20 flex-1 min-w-0 border-red-200 hover:border-red-400 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-600 dark:hover:bg-red-950/30 transition-all duration-200 font-medium backdrop-blur-sm"
                                >
                                  <Link href={item.website.startsWith('http') ? item.website : `http://${item.website}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-1" /> Website
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Accommodations Tab */}
                <TabsContent value="accommodations" className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-xl">
                  <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Places to Stay in {displayName}</h2>
                  {stays.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 mx-auto w-fit mb-4">
                        <Hotel className="h-12 w-12 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">No accommodation data available.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stays.map((item) => (
                        <Card key={item.id} className="group relative overflow-hidden border-0 bg-gradient-to-br from-green-50/80 via-white to-emerald-50/80 dark:from-green-950/20 dark:via-gray-900 dark:to-emerald-950/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <CardHeader className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                              <Badge variant="secondary" className="bg-green-100/80 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800 backdrop-blur-sm">
                                <Hotel className="h-3 w-3 mr-1" />
                                Accommodation
                              </Badge>
                              <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <Hotel className="h-6 w-6" />
                              </div>
                            </div>
                            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                              {item.name}
                            </CardTitle>
                          </CardHeader>
                          
                          <CardContent className="space-y-4 relative z-10">
                            {item.description && (
                              <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {item.description}
                              </CardDescription>
                            )}
                            
                            <div className="flex flex-wrap gap-2">
                              {item.googleMapsLink && item.googleMapsLink !== "N/A" && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  asChild 
                                  className="relative z-20 flex-1 min-w-0 border-green-200 hover:border-green-400 hover:bg-green-50 dark:border-green-800 dark:hover:border-green-600 dark:hover:bg-green-950/30 transition-all duration-200 font-medium backdrop-blur-sm"
                                >
                                  <Link href={item.googleMapsLink} target="_blank" rel="noopener noreferrer">
                                    <MapPin className="h-4 w-4 mr-1" /> View Map
                                  </Link>
                                </Button>
                              )}
                              {item.website && item.website !== "N/A" && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  asChild 
                                  className="relative z-20 flex-1 min-w-0 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/30 transition-all duration-200 font-medium backdrop-blur-sm"
                                >
                                  <Link href={item.website.startsWith('http') ? item.website : `http://${item.website}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-1" /> Website
                                  </Link>
                                </Button>
                              )}
                            </div>
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

      {/* Modals */}
      <AboutModal open={isAboutOpen} onOpenChange={setIsAboutOpen} />
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <LicenseModal open={isLicenseOpen} onOpenChange={setIsLicenseOpen} />
      <AIAssistantModal open={isAIAssistantOpen} onOpenChange={setIsAIAssistantOpen} cityName={displayName} />

      {/* Floating AI Assistant Button */}
      <Button
        onClick={() => setIsAIAssistantOpen(true)}
        className="fixed bottom-8 right-8 z-50 h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-0 text-white shadow-xl hover:from-purple-700 hover:to-blue-700 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800 transition-all duration-300 ease-in-out transform hover:scale-110"
        aria-label="Open AI Assistant"
      >
        <Bot className="h-8 w-8" />
      </Button>
    </main>
  )
} 