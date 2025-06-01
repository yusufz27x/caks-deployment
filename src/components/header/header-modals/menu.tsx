"use client"

import { Menu as MenuIcon, X } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface MenuProps {
  onAboutClick: () => void
  onSettingsClick: () => void
  onLicenseClick: () => void
}

export function Menu({ onAboutClick, onSettingsClick, onLicenseClick }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscKey)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/90 dark:hover:bg-gray-800/90"
      >
        {isOpen ? (
          <X className="h-5 w-5 text-gray-700 dark:text-gray-300 transition-all duration-200" />
        ) : (
          <MenuIcon className="h-5 w-5 text-gray-700 dark:text-gray-300 transition-all duration-200" />
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 min-w-[180px] rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-2 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <button 
            onClick={() => {
              onAboutClick()
              setIsOpen(false)
            }}
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50 hover:text-blue-700 dark:hover:text-blue-300"
          >
            About Us
          </button>
          <div className="my-1 h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
          <button 
            onClick={() => {
              onSettingsClick()
              setIsOpen(false)
            }}
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/50 dark:hover:to-emerald-950/50 hover:text-green-700 dark:hover:text-green-300"
          >
            Settings
          </button>
          <div className="my-1 h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
          <button 
            onClick={() => {
              onLicenseClick()
              setIsOpen(false)
            }}
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/50 dark:hover:to-pink-950/50 hover:text-purple-700 dark:hover:text-purple-300"
          >
            License
          </button>
        </div>
      )}
    </div>
  )
} 