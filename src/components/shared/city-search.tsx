"use client"

import * as React from "react"
import { Search, Loader2, Clock } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"

// import { supabase } from "@/lib/supabaseClient"

interface CitySuggestion {
  value: string; // This will be the slug for URL routing
  label: string; // This will be the display label
  originalName?: string; // This will store the original city name for API calls
  originalData?: any;
}

// Function to manage latest searches in localStorage
const LATEST_SEARCHES_KEY = 'latestCitySearches';

const getLatestSearches = (): CitySuggestion[] => {
  if (typeof window === 'undefined') return [];
  const searches = localStorage.getItem(LATEST_SEARCHES_KEY);
  return searches ? JSON.parse(searches) : [];
};

const addToLatestSearches = (city: CitySuggestion) => {
  const searches = getLatestSearches();
  const newSearches = [city, ...searches.filter(s => s.value !== city.value)].slice(0, 5);
  localStorage.setItem(LATEST_SEARCHES_KEY, JSON.stringify(newSearches));
  return newSearches;
};

// Turkish character transliteration function
function transliterateTurkish(text: string): string {
  const turkishMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'I': 'I',
    'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };
  
  return text.replace(/[çğıöşüÇĞIİÖŞÜ]/g, (match) => turkishMap[match] || match);
}

export function CitySearch() {
  const [inputValue, setInputValue] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<CitySuggestion[]>([])
  const [isLoading, setIsLoading] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false); // New state for navigation loading
  const [geoapifyError, setGeoapifyError] = React.useState<string | null>(null); // For Geoapify API errors
  const [latestSearches, setLatestSearches] = React.useState<CitySuggestion[]>([])

  const inputRef = React.useRef<HTMLInputElement>(null)
  const commandRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Reset navigation state when pathname changes
  React.useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Load latest searches on mount
  React.useEffect(() => {
    setLatestSearches(getLatestSearches());
  }, []);

  React.useEffect(() => {
    if (inputValue.length < 3) {
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      if (inputValue.length < 3) { 
        setIsLoading(false);
        setShowSuggestions(false);
        setSuggestions([]);
        return;
      }
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
        if (!apiKey) {
          const errorMsg = "Geoapify API key not found. Please configure it in your environment variables.";
          console.error(errorMsg + " (city search)");
          setGeoapifyError(errorMsg);
          setIsLoading(false);
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        } else {
          setGeoapifyError(null); // Clear previous error
        }
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(inputValue)}&format=json&limit=5&apiKey=${apiKey}`
        );
        if (!response.ok) {
          const errorMsg = `Geoapify API error: ${response.status} ${response.statusText}. Check console for details.`;
          console.error("Geoapify Autocomplete API error:", response.status, response.statusText);
          try {
            const errorBodyText = await response.text();
            console.error("Geoapify error response body:", errorBodyText);
          } catch (e) {
            console.error("Failed to read Geoapify error response body:", e);
          }
          setGeoapifyError(errorMsg);
          setIsLoading(false);
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }
        const data = await response.json();
        if (!data || !data.results || data.results.length === 0) {
          console.log(
            `Geoapify API returned no results for input: "${inputValue}". Received data:`,
            JSON.stringify(data, null, 2)
          );
        }
        const formattedSuggestions: CitySuggestion[] = (data.results || []).map((item: any) => {
          console.log("item", item);
          const originalName = item.name || item.city || item.street || 'location';
          let nameForSlug = originalName;
          // First transliterate Turkish characters, then convert to lowercase and create slug
          nameForSlug = transliterateTurkish(nameForSlug).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

          const countryPart = item.country_code ? item.country_code.toLowerCase() : '';
          const regionPart = item.region ? transliterateTurkish(item.region).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') : '';
          
          let slug = nameForSlug;
          if (countryPart && nameForSlug !== 'location') {
            if (regionPart) {
              // Format: city-region-country
              slug = `${nameForSlug}-${regionPart}-${countryPart}`;
            } else {
              // Fallback to city-country if no region
              slug = `${nameForSlug}-${countryPart}`;
            }
          } else if (nameForSlug === 'location' && countryPart) {
            slug = `${countryPart}-city`; 
          } else if (nameForSlug === 'location') {
            slug = `unknown-location-${Math.random().toString(36).substring(2, 7)}`;
          }

          let displayLabel = item.formatted;
          if (!displayLabel) {
            const namePartDisplay = item.name || item.street;
            const cityPartDisplay = item.city;
            const statePartDisplay = item.state;
            const regionPartDisplay = item.region;
            const countryPartDisplay = item.country;
            let parts = [namePartDisplay, cityPartDisplay, statePartDisplay, regionPartDisplay, countryPartDisplay].filter(Boolean);
            displayLabel = parts.join(', ');
            if (!displayLabel) displayLabel = 'Unknown Location';
          }
          
          return {
            value: slug, 
            label: displayLabel,
            originalName: originalName, // Store the original name for API calls
            originalData: item,
          };
        });
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } catch (error: any) {
        const errorMsg = `Error fetching city suggestions: ${error.message || "Unknown error"}. Check console.`;
        console.error("Error fetching city suggestions:", error);
        setGeoapifyError(errorMsg);
        setSuggestions([]);
        setShowSuggestions(false); // Hide suggestions on error
      }
      setIsLoading(false);
    }, 500); 

    return () => clearTimeout(timer);
  }, [inputValue]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = async (selectedValue: string, selectedLabel: string, originalData?: any) => {
    setInputValue(selectedLabel);
    setShowSuggestions(false);
    
    // Find the selected city to get the original name
    const selectedCity = suggestions.find(city => city.value === selectedValue) || 
                        latestSearches.find(city => city.value === selectedValue);
    
    console.log(selectedCity)

    // Save to latest searches
    const newCity: CitySuggestion = {
      value: selectedValue,
      label: selectedLabel,
      originalName: selectedCity?.label,
      originalData
    };
    const updatedSearches = addToLatestSearches(newCity);
    setLatestSearches(updatedSearches);
    
    try {
      // Navigate to the city page with original name as query parameter
      const originalName = selectedCity?.label || selectedLabel;
      const encodedOriginalName = encodeURIComponent(originalName);
      console.log(originalName)
      router.push(`/city/${selectedValue}?name=${encodedOriginalName}`);
      // Set navigating state after navigation starts
      setIsNavigating(true);
    } catch (error) {
      console.error("Navigation error:", error);
      setIsNavigating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (suggestions.length > 0) {
      await handleSelect(suggestions[0].value, suggestions[0].label, suggestions[0].originalData);
    }
    // If no suggestions, pressing enter does nothing beyond preventing default
  };
  
  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for a city... e.g., London"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              if (inputValue.length >= 3 && suggestions.length > 0) {
                setShowSuggestions(true);
              } else if (inputValue.length === 0) {
                // Show latest searches when input is empty
                setShowSuggestions(true);
              }
            }}
            disabled={isNavigating} // Disable input during navigation
            className="h-14 rounded-full border-2 border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg pl-12 pr-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 focus:bg-white/90 dark:focus:bg-gray-900/90 focus:border-blue-400 dark:focus:border-blue-500 dark:text-white dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:scale-[1.02]"
          />
          <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
          <button type="submit" disabled={isNavigating} className="sr-only">
            Search
          </button>
        </div>
      </form>

      {showSuggestions && !isNavigating && (
        <div ref={commandRef} className="absolute mt-2 w-full rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-2xl z-50 overflow-hidden">
          <Command>
            <CommandList className="max-h-[300px] overflow-y-auto">
              {isLoading && (
                <CommandItem className="flex items-center gap-3 p-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Searching cities...</span>
                </CommandItem>
              )}
              
              {!isLoading && inputValue.length === 0 && latestSearches.length > 0 && (
                <CommandGroup heading="Recent Searches">
                  {latestSearches.map((city) => (
                    <CommandItem
                      key={city.value}
                      value={city.label}
                      onSelect={() => handleSelect(city.value, city.label, city.originalData)}
                      className="cursor-pointer p-4 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 hover:text-blue-700 dark:hover:text-blue-300 border-b border-gray-200/30 dark:border-gray-700/30 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900/50 dark:to-blue-900/50">
                          <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="font-medium">{city.label}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {!isLoading && inputValue.length >= 3 && suggestions.length === 0 && (
                <CommandEmpty className="p-4 text-center text-gray-600 dark:text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <span>No cities found for "{inputValue}"</span>
                  </div>
                </CommandEmpty>
              )}
              {!isLoading && suggestions.map((city, index) => (
                <CommandItem
                  key={city.value + city.label} // Ensure unique key
                  value={city.label} // Value for CMDK filtering/selection
                  onSelect={() => handleSelect(city.value, city.label, city.originalData)}
                  className="cursor-pointer p-4 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 hover:text-blue-700 dark:hover:text-blue-300 border-b border-gray-200/30 dark:border-gray-700/30 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50">
                      <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">{city.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </div>
      )}

      {/* Loading overlay for navigation */}
      {isNavigating && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center z-40">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading city...</span>
          </div>
        </div>
      )}

      {/* Display Geoapify Error State */}
      {geoapifyError && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 backdrop-blur-sm">
          <p className="text-red-600 dark:text-red-400 text-center font-medium">{geoapifyError}</p>
        </div>
      )}
    </div>
  );
}

