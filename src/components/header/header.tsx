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

  return (
    <>
      <div className="absolute top-2 flex w-full justify-between px-4">
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
        <Menu 
          onAboutClick={onAboutClick}
          onSettingsClick={onSettingsClick}
          onLicenseClick={onLicenseClick}
        />
      </div>

      {/* Modals */}
      <AboutModal open={isAboutOpen} onOpenChange={setIsAboutOpen} />
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <LicenseModal open={isLicenseOpen} onOpenChange={setIsLicenseOpen} />
    </>
  )
}
