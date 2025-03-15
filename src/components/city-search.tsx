"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"

// Sample cities data - in a real app, this would come from an API
const cities = [
  { value: "paris", label: "Paris, France" },
  { value: "barcelona", label: "Barcelona, Spain" },
  { value: "rome", label: "Rome, Italy" },
  { value: "tokyo", label: "Tokyo, Japan" },
  { value: "new-york", label: "New York, USA" },
  { value: "london", label: "London, UK" },
  { value: "istanbul", label: "Istanbul, Turkey" },
  { value: "dubai", label: "Dubai, UAE" },
  { value: "sydney", label: "Sydney, Australia" },
  { value: "rio-de-janeiro", label: "Rio de Janeiro, Brazil" },
  { value: "amsterdam", label: "Amsterdam, Netherlands" },
  { value: "bangkok", label: "Bangkok, Thailand" },
  { value: "cairo", label: "Cairo, Egypt" },
  { value: "singapore", label: "Singapore" },
  { value: "berlin", label: "Berlin, Germany" },
]

export function CitySearch() {
  const [inputValue, setInputValue] = React.useState("")
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [filteredCities, setFilteredCities] = React.useState<typeof cities>([])
  const inputRef = React.useRef<HTMLInputElement>(null)
  const commandRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Filter cities based on input
  React.useEffect(() => {
    // Only show suggestions if we have at least 3 characters
    if (inputValue.length >= 3) {
      // Simulate database search with a delay
      const timer = setTimeout(() => {
        const filtered = cities.filter((city) => city.label.toLowerCase().includes(inputValue.toLowerCase()))
        setFilteredCities(filtered)
        setShowSuggestions(true)
      }, 300) // 300ms delay to simulate API call

      return () => clearTimeout(timer)
    } else {
      setShowSuggestions(false)
    }
  }, [inputValue])

  // Handle click outside to close suggestions
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (currentValue: string, currentLabel: string) => {
    setInputValue(currentLabel)
    setShowSuggestions(false)
    router.push(`/city/${currentValue}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue) {
      // Try to find a matching city
      const matchedCity = cities.find((city) => city.label.toLowerCase() === inputValue.toLowerCase())

      if (matchedCity) {
        router.push(`/city/${matchedCity.value}`)
      } else {
        // Handle search with free text
        router.push(`/search?q=${encodeURIComponent(inputValue)}`)
      }
    }
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Barcelona, Spain"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              if (inputValue.length >= 3) {
                setShowSuggestions(true)
              }
            }}
            className="h-14 rounded-full border-2 bg-white/90 pl-12 pr-6 text-lg shadow-lg backdrop-blur-sm transition-all focus:bg-white"
          />
          <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 transform text-gray-400" />
          <button type="submit" className="sr-only">
            Search
          </button>
        </div>
      </form>

      {showSuggestions && (
        <div ref={commandRef} className="absolute mt-1 w-full text-black rounded-md border bg-white shadow-lg">
          <Command>
            <CommandList>
              <CommandEmpty>No cities found.</CommandEmpty>
              <CommandGroup>
                {filteredCities.map((city) => (
                  <CommandItem
                    key={city.value}
                    value={city.label}
                    onSelect={() => handleSelect(city.value, city.label)}
                    className="cursor-pointer"
                  >
                    {city.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}

