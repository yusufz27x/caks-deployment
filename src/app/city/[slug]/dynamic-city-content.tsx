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
import { motion, AnimatePresence } from "framer-motion"

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
  region?: string;
  state?: string;
  description: string;
  image: string;
  imageAttribution?: string; // For Google Places photo attribution
  coordinates: Coordinates | null;
}

interface DynamicCityContentProps {
  cityPageData: CityPageData;
}

const tabContentVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 10 : -10
  }),
  center: {
    opacity: 1,
    x: 0
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -10 : 10
  })
}

export function DynamicCityContent({ cityPageData }: DynamicCityContentProps) {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const { loading, error, attractions, kitchens, stays, cityName: hookCityName, country: hookCountry, cityDescription: hookCityDescription } = useCityData(cityPageData.coordinates, cityPageData.name)

  // NEW: State for animated tabs
  const [currentTabValue, setCurrentTabValue] = useState(tabsConfig[0].value)
  const [previousTabValue, setPreviousTabValue] = useState(tabsConfig[0].value)
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([])
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0)
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  // Function to get tab index
  const getTabIndex = (value: string) => tabsConfig.findIndex(tab => tab.value === value)

  // Handle tab change with direction
  const handleTabChange = (value: string) => {
    setPreviousTabValue(currentTabValue)
    setCurrentTabValue(value)
  }

  // Calculate animation direction
  const direction = getTabIndex(currentTabValue) - getTabIndex(previousTabValue)

  const displayName = hookCityName || cityPageData.name
  const displayCountry = hookCountry || cityPageData.country
  const displayDescription = hookCityDescription || cityPageData.description
  const { image } = cityPageData

  // NEW: useLayoutEffect for calculating underline position
  useLayoutEffect(() => {
    const updateTabUnderline = () => {
      const activeIndex = tabsConfig.findIndex(tab => tab.value === currentTabValue);
      console.log('Updating tab underline for:', currentTabValue, 'activeIndex:', activeIndex);
      
      if (activeIndex !== -1 && tabsRef.current[activeIndex]) {
        const currentTabElement = tabsRef.current[activeIndex] as HTMLElement;
        const newLeft = currentTabElement.offsetLeft;
        const newWidth = currentTabElement.clientWidth;
        
        console.log('Tab element found:', {
          left: newLeft,
          width: newWidth,
          element: currentTabElement
        });
        
        setTabUnderlineLeft(newLeft);
        setTabUnderlineWidth(newWidth);
        setIsInitialized(true);
      } else {
        console.log('Tab element not found, trying first tab as fallback');
        // Fallback to first tab if active tab not found
        if (tabsRef.current[0]) {
          const firstTabElement = tabsRef.current[0] as HTMLElement;
          setTabUnderlineLeft(firstTabElement.offsetLeft);
          setTabUnderlineWidth(firstTabElement.clientWidth);
          setIsInitialized(true);
        } else {
          console.log('No tabs available');
          setTabUnderlineWidth(0); // Hide if no tabs available
        }
      }
    };

    updateTabUnderline();
  }, [currentTabValue]); // Rerun when currentTabValue changes

  // Additional effect to handle initial render and ensure underline appears
  useLayoutEffect(() => {
    const initializeUnderline = () => {
      console.log('Initializing underline on mount');
      const activeIndex = tabsConfig.findIndex(tab => tab.value === currentTabValue);
      if (activeIndex !== -1 && tabsRef.current[activeIndex]) {
        const currentTabElement = tabsRef.current[activeIndex] as HTMLElement;
        setTabUnderlineLeft(currentTabElement.offsetLeft);
        setTabUnderlineWidth(currentTabElement.clientWidth);
        setIsInitialized(true);
        console.log('Initial underline set:', {
          left: currentTabElement.offsetLeft,
          width: currentTabElement.clientWidth
        });
      } else {
        // Try again after a delay
        setTimeout(() => {
          const retryActiveIndex = tabsConfig.findIndex(tab => tab.value === currentTabValue);
          if (retryActiveIndex !== -1 && tabsRef.current[retryActiveIndex]) {
            const currentTabElement = tabsRef.current[retryActiveIndex] as HTMLElement;
            setTabUnderlineLeft(currentTabElement.offsetLeft);
            setTabUnderlineWidth(currentTabElement.clientWidth);
            setIsInitialized(true);
            console.log('Delayed underline set:', {
              left: currentTabElement.offsetLeft,
              width: currentTabElement.clientWidth
            });
          }
        }, 100);
      }
    };

    initializeUnderline();
  }, []); // Run only once on mount

  // Handle window resize to recalculate tab positions
  useLayoutEffect(() => {
    const handleResize = () => {
      const activeIndex = tabsConfig.findIndex(tab => tab.value === currentTabValue);
      if (activeIndex !== -1 && tabsRef.current[activeIndex]) {
        const currentTabElement = tabsRef.current[activeIndex] as HTMLElement;
        setTabUnderlineLeft(currentTabElement.offsetLeft);
        setTabUnderlineWidth(currentTabElement.clientWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentTabValue]);

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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 custom-scrollbar">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header 
          onAboutClick={() => {}}
          onSettingsClick={() => {}}
          onLicenseClick={() => {}}
        />
      </div>

      {/* Hero Section */}
      <section className="relative h-[80vh] pt-[64px] -mt-[1px]">
        <div className="absolute inset-0 top-0">
          <Image
            src={image || "/placeholder.svg"}
            alt={displayName}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
          {/* Photo Attribution */}
          {cityPageData.imageAttribution && (
            <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
              Photo: {cityPageData.imageAttribution}
            </div>
          )}
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center -mt-24 px-4 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl drop-shadow-lg">{displayName}</h1>
            <div className="text-2xl text-white/90 font-medium">
              {cityPageData.state && <span>{cityPageData.state}</span>}
              {cityPageData.region && cityPageData.state && <span>, </span>}
              {cityPageData.region && <span>{cityPageData.region}</span>}
              {(cityPageData.state || cityPageData.region) && <span>, </span>}
              <span>{displayCountry}</span>
            </div>
          </div>
        </div>
      </section>

      {/* City Description */}
      <section className="relative -mt-48 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
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
            onValueChange={handleTabChange} 
            className="w-full"
          >
            <TabsList className="relative flex w-full h-14 items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl mb-8 px-1">
              {/* Animated Underline/Background */}
              {activeTabConfig && isInitialized && tabUnderlineWidth > 0 && (
                <span
                  className="absolute z-0 flex overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out"
                  style={{
                    left: tabUnderlineLeft,
                    width: tabUnderlineWidth,
                    top: '0.25rem',
                    height: '3rem',
                    opacity: isInitialized ? 1 : 0,
                  }}
                >
                  <span 
                    className={`h-full w-full rounded-xl bg-gradient-to-r ${activeTabConfig.activeClasses}`} 
                  />
                </span>
              )}
              
              {/* Fallback underline if main one doesn't appear */}
              {(!isInitialized || tabUnderlineWidth === 0) && (
                <span className="absolute z-0 left-1 top-1 h-12 w-1/3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-in-out opacity-100" />
              )}

              {tabsConfig.map((tab, index) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={`tab-${tab.value}`}
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
              <AnimatePresence mode="wait">
                {/* Attractions Tab */}
                <TabsContent 
                  key="attractions-tab"
                  value="attractions" 
                  className="relative"
                >
                  <motion.div
                    key={`attractions-content-${currentTabValue}`}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    custom={direction}
                    variants={tabContentVariants}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-xl"
                  >
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
                          <Card 
                            key={`attraction-${item.id || item.name.replace(/\s+/g, '-')}`} 
                            className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50/80 via-white to-purple-50/80 dark:from-blue-950/20 dark:via-gray-900 dark:to-purple-950/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
                          >
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
                  </motion.div>
                </TabsContent>

                {/* Food Tab */}
                <TabsContent 
                  key="food-tab"
                  value="food" 
                  className="relative"
                >
                  <motion.div
                    key={`food-content-${currentTabValue}`}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    custom={direction}
                    variants={tabContentVariants}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-xl"
                  >
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
                          <Card 
                            key={`kitchen-${item.id || item.name.replace(/\s+/g, '-')}`}
                            className="group relative overflow-hidden border-0 bg-gradient-to-br from-orange-50/80 via-white to-red-50/80 dark:from-orange-950/20 dark:via-gray-900 dark:to-red-950/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
                          >
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
                  </motion.div>
                </TabsContent>

                {/* Accommodations Tab */}
                <TabsContent 
                  key="accommodations-tab"
                  value="accommodations" 
                  className="relative"
                >
                  <motion.div
                    key={`accommodations-content-${currentTabValue}`}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    custom={direction}
                    variants={tabContentVariants}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-xl"
                  >
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
                          <Card 
                            key={`stay-${item.id || item.name.replace(/\s+/g, '-')}`}
                            className="group relative overflow-hidden border-0 bg-gradient-to-br from-green-50/80 via-white to-emerald-50/80 dark:from-green-950/20 dark:via-gray-900 dark:to-emerald-950/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
                          >
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
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            )}
          </Tabs>
        </div>
      </section>

      {/* Modals */}
      <AIAssistantModal open={isAIAssistantOpen} onOpenChange={setIsAIAssistantOpen} cityName={displayName} />

      {/* Floating AI Assistant Button */}
      <Button
        onClick={() => setIsAIAssistantOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-36 h-16 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl hover:from-purple-700 hover:to-blue-700 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800 transition-all duration-300 ease-in-out flex items-center justify-center gap-6"
        aria-label="Open AI Assistant"
      >
        <span className="text-sm font-medium">
          CAKS AI
        </span>
        <Bot className="h-8 w-8" />
      </Button>
    </main>
  )
} 