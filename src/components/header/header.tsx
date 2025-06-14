"use client"

import { useState } from "react"
import { ModeToggle } from "../shared/mode-toggle"
import { AboutModal } from "@/components/header/header-modals/about-modal"
import { SettingsModal } from "@/components/header/header-modals/settings-modal"
import { LicenseModal } from "@/components/header/header-modals/license-modal"
import { Menu } from "@/components/header/header-modals/menu"

interface HeaderProps {
  onAboutClick: () => void
  onSettingsClick: () => void
  onLicenseClick: () => void
}

export function Header({ onAboutClick, onSettingsClick, onLicenseClick }: HeaderProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLicenseOpen, setIsLicenseOpen] = useState(false)

  // Handle modal state changes
  const handleAboutOpenChange = (open: boolean) => {
    setIsAboutOpen(open)
    if (open) onAboutClick()
  }

  const handleSettingsOpenChange = (open: boolean) => {
    setIsSettingsOpen(open)
    if (open) onSettingsClick()
  }

  const handleLicenseOpenChange = (open: boolean) => {
    setIsLicenseOpen(open)
    if (open) onLicenseClick()
  }

  return (
    <>
      <div className="absolute top-2 flex w-full justify-between px-4">
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
        <Menu 
          onAboutClick={() => setIsAboutOpen(true)}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onLicenseClick={() => setIsLicenseOpen(true)}
        />
      </div>

      {/* Modals */}
      <AboutModal open={isAboutOpen} onOpenChange={handleAboutOpenChange} />
      <SettingsModal open={isSettingsOpen} onOpenChange={handleSettingsOpenChange} />
      <LicenseModal open={isLicenseOpen} onOpenChange={handleLicenseOpenChange} />
    </>
  )
}
