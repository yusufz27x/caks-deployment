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
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50"
      >
        {isOpen ? <X className="size-5" /> : <MenuIcon className="size-5" />}
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 min-w-[160px] rounded-md border bg-white/90 dark:bg-gray-800/90 p-1 shadow-lg">
          <button 
            onClick={() => {
              onAboutClick()
              setIsOpen(false)
            }}
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-gray-700/90 dark:text-gray-200/90 transition-colors hover:bg-gray-100/90 dark:hover:bg-gray-700/90"
          >
            About Us
          </button>
          <div className="my-1 h-[1px] bg-gray-200/90 dark:bg-gray-700/90" />
          <button 
            onClick={() => {
              onSettingsClick()
              setIsOpen(false)
            }}
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-gray-700/90 dark:text-gray-200/90 transition-colors hover:bg-gray-100/90 dark:hover:bg-gray-700/90"
          >
            Settings
          </button>
          <div className="my-1 h-[1px] bg-gray-200/90 dark:bg-gray-700/90" />
          <button 
            onClick={() => {
              onLicenseClick()
              setIsOpen(false)
            }}
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-gray-700/90 dark:text-gray-200/90 transition-colors hover:bg-gray-100/90 dark:hover:bg-gray-700/90"
          >
            License
          </button>
        </div>
      )}
    </div>
  )
} 