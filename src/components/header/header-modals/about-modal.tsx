import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface AboutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">About Us</DialogTitle>
          <DialogDescription>
            CAKS is your comprehensive guide to discovering the best places to stay, eat, and explore in cities around the world.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Our mission is to help travelers make informed decisions about their destinations by providing detailed information about accommodations, restaurants, and attractions.
          </p>
          <p className="text-sm text-muted-foreground">
            We curate and verify all our recommendations to ensure you get the most accurate and up-to-date information for your travel planning.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 