/**
 * src/components/ui/sheet.tsx
 * Bottom sheet using vaul (Drawer) for mobile modals.
 *
 * KEY FIXES:
 * 1. dismissible={false}: overlay taps and drags do NOT close the sheet.
 * 2. JS-driven height via VisualViewport API — fixes the "stuck black gap" bug
 *    that happens when the keyboard is dismissed via scroll or tap instead of
 *    the system minimize button. CSS dvh/vh units do NOT re-evaluate in that
 *    case, but visualViewport.resize fires correctly every time.
 * 3. data-vaul-no-drag on the scrollable body: vaul won't intercept touches
 *    inside the form, so native scroll works without accidental dismissal.
 * 4. Sticky header (drag handle + title + ✕ close button) always visible.
 */
import { useRef, useEffect } from 'react'
import { Drawer } from 'vaul'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// What fraction of the visual viewport the sheet occupies (92%)
const SHEET_HEIGHT_RATIO = 0.92

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

export function SheetContent({ className, children, title, onClose }: SheetContentProps) {
  /**
   * innerRef points to the div INSIDE Drawer.Content that we size with JS.
   * Drawer.Content itself is left WITHOUT a height class so vaul can handle
   * its own transform/animation. We size the inner container instead.
   *
   * Why inner div and not Drawer.Content directly?
   * vaul applies CSS transforms on Drawer.Content for slide animation.
   * Setting height on it via JS at the same time can fight those transforms.
   * The inner div is a stable child that we can freely size.
   */
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const vv = window.visualViewport
    const el  = innerRef.current
    if (!vv || !el) return

    const sync = () => {
      // Use visualViewport.height — this is the ONLY value that updates
      // correctly when keyboard is dismissed via scroll/tap/any means.
      el.style.height = `${Math.round(vv.height * SHEET_HEIGHT_RATIO)}px`
    }

    // Fire immediately on mount
    sync()

    // Both events are needed:
    // - 'resize': keyboard open/close, orientation change, browser chrome show/hide
    // - 'scroll': some browsers fire scroll instead of resize for keyboard events
    vv.addEventListener('resize', sync)
    vv.addEventListener('scroll', sync)

    return () => {
      vv.removeEventListener('resize', sync)
      vv.removeEventListener('scroll', sync)
    }
  }, [])

  return (
    <Drawer.Portal>
      {/* Overlay — purely visual; tapping it does NOT close (dismissible=false) */}
      <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />

      {/*
        Drawer.Content: NO height class here — vaul controls its own transform.
        Height is applied to the inner div via JS.
      */}
      <Drawer.Content
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 outline-none',
          className,
        )}
      >
        {/*
          Inner container: height set by visualViewport JS above.
          Initial fallback via style.height is set synchronously in useEffect
          before first paint (no flash). rounded-t-2xl lives here so the
          rounding doesn't need to be passed from outside.
        */}
        <div
          ref={innerRef}
          className="flex flex-col bg-background rounded-t-2xl overflow-hidden"
          style={{ height: `${SHEET_HEIGHT_RATIO * 100}dvh` }}  // CSS fallback only
        >
          {/* ── Sticky header: drag handle + title + close button ─── */}
          <div className="flex-shrink-0 bg-background border-b border-border">
            {/* Drag handle pill */}
            <div className="flex items-center justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            {/* Title row + close button */}
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
            Scrollable body.
            data-vaul-no-drag: vaul ignores touches here → native scroll works.
            overscroll-contain: prevents pull-to-refresh / background scroll bleed.
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
