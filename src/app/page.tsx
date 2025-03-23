"use client"
import { ModeToggle } from "@/components/mode-toggle"
import { CitySearch } from "@/components/city-search"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { AboutModal } from "@/components/modals/about-modal"
import { SettingsModal } from "@/components/modals/settings-modal"
import { LicenseModal } from "@/components/modals/license-modal"
import { Header } from "@/components/header"

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLicenseOpen, setIsLicenseOpen] = useState(false)
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
        <Header 
          onAboutClick={() => setIsAboutOpen(true)}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onLicenseClick={() => setIsLicenseOpen(true)}
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

      {/* Modals */}
      <AboutModal open={isAboutOpen} onOpenChange={setIsAboutOpen} />
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <LicenseModal open={isLicenseOpen} onOpenChange={setIsLicenseOpen} />
    </main>
  )
}

