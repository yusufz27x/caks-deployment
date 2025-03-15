"use client"
import { ModeToggle } from "@/components/mode-toggle"
import { CitySearch } from "@/components/city-search"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <main className="relative min-h-screen">
      {/* Background Image with Dark Mode Overlay */}
      <div>
        <Image src="/background.png" alt="Header" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/0 dark:bg-black/40 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Top Navigation */}
        <div className="absolute top-4 flex w-full justify-between px-4">
          <ModeToggle />
          <div className="relative" ref={menuRef}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative z-50"
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
            
            {isMenuOpen && (
              <div className="absolute right-0 top-12 z-50 min-w-[160px] rounded-md border bg-white/90 dark:bg-gray-800/90 p-1 shadow-lg">
                <button className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-gray-700/90 dark:text-gray-200/90 transition-colors hover:bg-gray-100/90 dark:hover:bg-gray-700/90">
                  About Us
                </button>
                <div className="my-1 h-[1px] bg-gray-200/90 dark:bg-gray-700/90" />
                <button className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-gray-700/90 dark:text-gray-200/90 transition-colors hover:bg-gray-100/90 dark:hover:bg-gray-700/90">
                  Settings
                </button>
                <div className="my-1 h-[1px] bg-gray-200/90 dark:bg-gray-700/90" />
                <button className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-gray-700/90 dark:text-gray-200/90 transition-colors hover:bg-gray-100/90 dark:hover:bg-gray-700/90">
                  License
                </button>
              </div>
            )}
            
          </div>
        </div>

        {/* Main Content */}
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
              CAKS
            </h1>
            <p className="text-lg text-black/90 dark:text-white/90">
              Where to stay, eat, and explore.
            </p>
          </div>

          {/* Search Bar with Autocomplete */}
          <div className="w-full max-w-2xl">
            <CitySearch />
          </div>
        </div>
      </div>
    </main>
  )
}

