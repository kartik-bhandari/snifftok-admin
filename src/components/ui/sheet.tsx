/**
 * src/components/ui/sheet.tsx
 * Bottom sheet using vaul (Drawer) for mobile modals.
 *
 * KEY FIX: vaul intercepts touch events for drag-to-dismiss by default.
 * The scrollable body gets `data-vaul-no-drag` so vaul ignores touches
 * inside it and lets native scroll work. We also drop `snapPoints` because
 * snap-points + inner scroll conflict on touch devices.
 */
import { Drawer } from 'vaul'
import { cn } from '@/lib/utils'

interface SheetProps {
  open:         boolean
  onOpenChange: (open: boolean) => void
  children:     React.ReactNode
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    // no snapPoints — vaul will use full-height mode which doesn't fight inner scroll
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      shouldScaleBackground={false}
    >
      {children}
    </Drawer.Root>
  )
}

interface SheetContentProps {
  side?:      'bottom' | 'top'
  className?: string
  children:   React.ReactNode
}

export function SheetContent({ side = 'bottom', className, children }: SheetContentProps) {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <Drawer.Content
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-background flex flex-col outline-none',
          className,
        )}
      >
        {/* Drag handle — vaul still watches drags on this pill */}
        <div className="flex-shrink-0 flex items-center justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/*
          data-vaul-no-drag: vaul will NOT intercept touches inside here,
          so the user can scroll the form normally without accidentally dismissing.
        */}
        <div
          data-vaul-no-drag
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          {children}
        </div>
      </Drawer.Content>
    </Drawer.Portal>
  )
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4', className)} {...props} />
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold mb-3', className)} {...props} />
}
