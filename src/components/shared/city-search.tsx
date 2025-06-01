"use client"

import * as React from "react"
import { Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"

// import { supabase } from "@/lib/supabaseClient"

interface CitySuggestion {
  value: string; 
  label: string; 
  originalData?: any;
}

export function CitySearch() {
  const [inputValue, setInputValue] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<CitySuggestion[]>([])
  const [isLoading, setIsLoading] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false); // New state for navigation loading
  const [geoapifyError, setGeoapifyError] = React.useState<string | null>(null); // For Geoapify API errors

  const inputRef = React.useRef<HTMLInputElement>(null)
  const commandRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()

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
          let nameForSlug = item.name || item.city || item.street || 'location';
          nameForSlug = nameForSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

          const countryPart = item.country_code ? item.country_code.toLowerCase() : '';
          let slug = nameForSlug;
          if (countryPart && nameForSlug !== 'location') { 
            slug = `${nameForSlug}-${countryPart}`;
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
            const countryPartDisplay = item.country;
            let parts = [namePartDisplay, cityPartDisplay, statePartDisplay, countryPartDisplay].filter(Boolean);
            displayLabel = parts.join(', ');
            if (!displayLabel) displayLabel = 'Unknown Location';
          }
          
          return {
            value: slug, 
            label: displayLabel,
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

  const handleSelect = async (selectedValue: string, selectedLabel: string) => {
    setInputValue(selectedLabel); 
    setShowSuggestions(false);
    setIsNavigating(true); // Start navigation loading
    
    try {
      await router.push(`/city/${selectedValue}`); 
    } catch (error) {
      console.error("Navigation error:", error);
      setIsNavigating(false); // Reset loading state on error
    }
    // Note: setIsNavigating(false) will be called when component unmounts or new page loads
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (suggestions.length > 0) {
      await handleSelect(suggestions[0].value, suggestions[0].label);
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
              // Show suggestions if input is already valid and has suggestions
              if (inputValue.length >= 3 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            disabled={isNavigating} // Disable input during navigation
            className="h-14 rounded-full border-2 bg-white/90 pl-12 pr-6 text-lg shadow-lg backdrop-blur-sm transition-all focus:bg-white dark:bg-gray-800/90 dark:text-white dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
          <button type="submit" disabled={isNavigating} className="sr-only">
            Search
          </button>
        </div>
      </form>

      {showSuggestions && !isNavigating && (
        <div ref={commandRef} className="absolute mt-1 w-full text-black rounded-md border bg-white shadow-lg dark:bg-gray-800 dark:text-white z-50">
          <Command>
            <CommandList>
              {isLoading && (
                <CommandItem className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching cities...
                </CommandItem>
              )}
              {!isLoading && suggestions.length === 0 && inputValue.length >=3 && <CommandEmpty>No cities found for "{inputValue}".</CommandEmpty>}
              {!isLoading && suggestions.map((city) => (
                <CommandItem
                  key={city.value + city.label} // Ensure unique key
                  value={city.label} // Value for CMDK filtering/selection
                  onSelect={() => handleSelect(city.value, city.label)}
                  className="cursor-pointer hover:bg-accent dark:hover:bg-gray-700"
                >
                  {city.label}
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
      {geoapifyError && <p className="text-red-500 text-center mt-4">{geoapifyError}</p>}
    </div>
  );
}

