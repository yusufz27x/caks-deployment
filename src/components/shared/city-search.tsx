"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
// import { supabase } from "@/lib/supabaseClient"

interface CitySuggestion {
  value: string; // This will be the slug for navigation e.g. "paris-fr"
  label: string; // This will be for display e.g. "Paris, France"
  // Add original API data if needed for more complex selection logic later
  originalData?: any; 
}

// Removed mockCities

export function CitySearch() {
  const [inputValue, setInputValue] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<CitySuggestion[]>([]) // Renamed from filteredCities
  const [isLoading, setIsLoading] = React.useState(false); // To show loading state
  
  const inputRef = React.useRef<HTMLInputElement>(null)
  const commandRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Removed the useEffect that was setting cities from mockCities

  // Fetch suggestions from Geoapify Autocomplete API based on input
  React.useEffect(() => {
    if (inputValue.length < 3) {
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      if (inputValue.length < 3) { // Double check, in case input changed rapidly
        setIsLoading(false);
        setShowSuggestions(false);
        setSuggestions([]);
        return;
      }
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
        if (!apiKey) {
          console.error("Geoapify API key not found for city search.");
          setIsLoading(false);
          setSuggestions([]); // Potentially show an error message to user
          return;
        }
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(inputValue)}&type=city&format=json&limit=5&apiKey=${apiKey}`
        );
        if (!response.ok) {
          console.error("Geoapify Autocomplete API error:", response.status, response.statusText);
          setIsLoading(false);
          setSuggestions([]);
          return;
        }
        const data = await response.json();
        const formattedSuggestions: CitySuggestion[] = (data.results || []).map((item: any) => {
          const props = item.properties;
          
          // Robust name part for slug generation
          let nameForSlug = props.name || props.city || props.street || 'location';
          nameForSlug = nameForSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

          const countryPart = props.country_code ? props.country_code.toLowerCase() : '';
          let slug = nameForSlug;
          if (countryPart && nameForSlug !== 'location') { // Avoid slugs like 'location-us' if name is unknown
            slug = `${nameForSlug}-${countryPart}`;
          } else if (nameForSlug === 'location' && countryPart) {
            slug = `${countryPart}-city`; // Fallback slug if only country is known
          } else if (nameForSlug === 'location') {
            slug = `unknown-location-${Math.random().toString(36).substring(2, 7)}`; // Highly generic fallback
          }

          // Robust label generation
          let displayLabel = props.formatted;
          if (!displayLabel) {
            const namePartDisplay = props.name || props.street;
            const cityPartDisplay = props.city;
            const statePartDisplay = props.state;
            const countryPartDisplay = props.country;
            let parts = [namePartDisplay, cityPartDisplay, statePartDisplay, countryPartDisplay].filter(Boolean);
            displayLabel = parts.join(', ');
            if (!displayLabel) displayLabel = 'Unknown Location';
          }
          
          return {
            value: slug, 
            label: displayLabel,
            originalData: props, 
          };
        });
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching city suggestions:", error);
        setSuggestions([]);
      }
      setIsLoading(false);
    }, 500); // Debounce API calls

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Handle click outside to close suggestions
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

  const handleSelect = (selectedValue: string, selectedLabel: string) => {
    setInputValue(selectedLabel); // Update input to show full selected label
    setShowSuggestions(false);
    // Navigate to the city page using the generated slug (selectedValue)
    router.push(`/city/${selectedValue}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      // If suggestions are available, navigate to the first one
      handleSelect(suggestions[0].value, suggestions[0].label);
    } else if (inputValue.length >= 3) {
      // Fallback: if no suggestions but input is valid, try to navigate using the input directly as a slug
      // This relies on the page.tsx to correctly geocode this raw slug
      router.push(`/city/${inputValue.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`); 
    }
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
            className="h-14 rounded-full border-2 bg-white/90 pl-12 pr-6 text-lg shadow-lg backdrop-blur-sm transition-all focus:bg-white dark:bg-gray-800/90 dark:text-white dark:placeholder-gray-400"
          />
          <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
          <button type="submit" className="sr-only">
            Search
          </button>
        </div>
      </form>

      {showSuggestions && (
        <div ref={commandRef} className="absolute mt-1 w-full text-black rounded-md border bg-white shadow-lg dark:bg-gray-800 dark:text-white z-50">
          <Command>
            <CommandList>
              {isLoading && <CommandItem className="text-sm text-muted-foreground">Loading...</CommandItem>}
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
    </div>
  );
}

