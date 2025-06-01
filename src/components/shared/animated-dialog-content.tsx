"use client"

import { motion, AnimatePresence } from "framer-motion"
import { DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -20 }
}

interface AnimatedDialogContentProps {
  open: boolean
  children: React.ReactNode
  className?: string
}

export function AnimatedDialogContent({ open, children, className }: AnimatedDialogContentProps) {
  return (
    <AnimatePresence>
      {open && (
        <DialogContent className="bg-transparent p-0 border-0 shadow-none">
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-lg",
              className
            )}
          >
            {children}
          </motion.div>
        </DialogContent>
      )}
    </AnimatePresence>
  )
} 