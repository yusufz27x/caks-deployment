import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { AnimatedDialogContent } from "@/components/shared/animated-dialog-content"

interface LicenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LicenseModal({ open, onOpenChange }: LicenseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatedDialogContent open={open}>
        <DialogHeader>
          <DialogTitle className="text-foreground">License</DialogTitle>
          <DialogDescription>
            Terms and conditions for using CAKS
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            © 2024 CAKS. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            This application is licensed under the MIT License. See the LICENSE file for details.
          </p>
          <p className="text-sm text-muted-foreground">
            All content and data provided through this application are subject to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </AnimatedDialogContent>
    </Dialog>
  )
} 