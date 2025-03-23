"use client"

import { Menu, X } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"

interface HeaderProps {
  onAboutClick: () => void
  onSettingsClick: () => void
  onLicenseClick: () => void
}

export function Header({ onAboutClick, onSettingsClick, onLicenseClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  return (
    <div className="absolute top-2 flex w-full justify-between px-4">
      <div className="flex items-center gap-4">
        <ModeToggle />
      </div>
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
            <button 
              onClick={() => {
                onAboutClick()
                setIsMenuOpen(false)
              }}
              className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-gray-700/90 dark:text-gray-200/90 transition-colors hover:bg-gray-100/90 dark:hover:bg-gray-700/90"
            >
              About Us
            </button>
            <div className="my-1 h-[1px] bg-gray-200/90 dark:bg-gray-700/90" />
            <button 
              onClick={() => {
                onSettingsClick()
                setIsMenuOpen(false)
              }}
              className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-gray-700/90 dark:text-gray-200/90 transition-colors hover:bg-gray-100/90 dark:hover:bg-gray-700/90"
            >
              Settings
            </button>
            <div className="my-1 h-[1px] bg-gray-200/90 dark:bg-gray-700/90" />
            <button 
              onClick={() => {
                onLicenseClick()
                setIsMenuOpen(false)
              }}
              className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-gray-700/90 dark:text-gray-200/90 transition-colors hover:bg-gray-100/90 dark:hover:bg-gray-700/90"
            >
              License
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
