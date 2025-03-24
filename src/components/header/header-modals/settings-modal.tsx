import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ModeToggle } from "@/components/shared/mode-toggle"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">Settings</DialogTitle>
          <DialogDescription>
            Customize your CAKS experience
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Dark Mode</label>
            <ModeToggle />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Language</label>
            <select className="rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground">
              <option>English</option>
            </select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 