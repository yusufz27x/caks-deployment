"use client"
import { ModeToggle } from "@/components/shared/mode-toggle"
import { CitySearch } from "@/components/shared/city-search"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Header } from "@/components/header/header"

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
    <main className="relative h-screen overflow-hidden">
      {/* Background Image with Dark Mode Overlay */}
      <div>
        <Image src="/background.png" alt="Header" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/0 dark:bg-black/40 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Top Navigation */}
        <Header 
          onAboutClick={() => {}}
          onSettingsClick={() => {}}
          onLicenseClick={() => {}}
        />

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

