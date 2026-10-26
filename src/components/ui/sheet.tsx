/**
 * src/components/ui/sheet.tsx
 * Bottom sheet using vaul (Drawer) for mobile modals.
 *
 * KEY FIXES:
 * - dismissible={false} by default: prevents accidental close from tapping
 *   the overlay or dragging. The sheet can only be closed via an explicit button.
 * - data-vaul-no-drag on the scrollable body: vaul won't intercept touches
 *   inside the form, so native scroll works normally.
 * - SheetContent renders its own sticky header with title + close (X) button,
 *   so it's always reachable even when the keyboard is open.
 */
import { Drawer } from 'vaul'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open:         boolean
  onOpenChange: (open: boolean) => void
  children:     React.ReactNode
  /** If true, tapping the overlay or dragging down closes the sheet. Default: false */
  dismissible?: boolean
}

export function Sheet({ open, onOpenChange, children, dismissible = false }: SheetProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      dismissible={dismissible}
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
  /** Title shown in the sticky sheet header */
  title?:     string
  /** Called when the ✕ button in the header is pressed */
  onClose?:   () => void
}

export function SheetContent({ side = 'bottom', className, children, title, onClose }: SheetContentProps) {
  return (
    <Drawer.Portal>
      {/* Overlay — purely visual; tapping it does NOT close (dismissible=false) */}
      <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />

      <Drawer.Content
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-background flex flex-col outline-none',
          className,
        )}
      >
        {/* ── Sticky header: drag handle + title + close button ─────────── */}
        <div className="flex-shrink-0 bg-background border-b border-border">
          {/* Drag handle pill */}
          <div className="flex items-center justify-center pt-3 pb-2">
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>

          {/* Title row + close */}
          {(title || onClose) && (
            <div className="flex items-center justify-between px-4 pb-3">
              {title && (
                <h2 className="text-base font-semibold">{title}</h2>
              )}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="ml-auto p-2 -mr-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/*
          data-vaul-no-drag: vaul will NOT intercept touches inside here,
          so the user can scroll the form normally without accidentally dismissing.
          padding-bottom accounts for the iOS safe area (home indicator bar).
        */}
        <div
          data-vaul-no-drag
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 'env(safe-area-inset-bottom, 16px)',
          } as React.CSSProperties}
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
