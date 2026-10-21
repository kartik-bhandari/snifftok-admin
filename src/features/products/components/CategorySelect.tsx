import { useState, useRef, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { createPortal } from 'react-dom'
import { useCategories } from '@/hooks/useCategories'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CategorySelect() {
  const { setValue, formState: { errors } } = useFormContext()
  const value = useWatch({ name: 'categoryId' })
  const { data, isLoading } = useCategories()
  const [open, setOpen]     = useState(false)
  const [rect, setRect]     = useState<DOMRect | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const categories = data?.categories ?? []
  const selected = categories.find(c => c._id === value)

  useEffect(() => {
    if (open && buttonRef.current) setRect(buttonRef.current.getBoundingClientRect())
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const mouseHandler = (e: MouseEvent) => {
      if (!buttonRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', mouseHandler)
    // Close on any scroll or resize so the fixed dropdown doesn't detach from the button
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', mouseHandler)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  const handleSelect = (id: string) => {
    setValue('categoryId', id, { shouldValidate: true })
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 rounded-lg border bg-background text-sm h-10',
          errors.categoryId ? 'border-destructive' : 'border-input hover:border-primary/50',
        )}
      >
        <span className={selected ? '' : 'text-muted-foreground'}>
          {isLoading ? 'Loading…' : selected ? selected.name : 'Select category'}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && rect && createPortal(
        <div
          style={{
            position: 'fixed',
            top:   rect.bottom + 4,
            left:  rect.left,
            width: rect.width,
            zIndex: 9999,
            backgroundColor: 'hsl(var(--card))',
          }}
          className="border border-border rounded-xl shadow-2xl overflow-hidden max-h-64 flex flex-col"
        >
          <div className="overflow-y-auto flex-1">
            {categories.map(cat => (
              <button
                key={cat._id}
                type="button"
                onClick={() => handleSelect(cat._id)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-accent transition-colors text-left"
              >
                {cat.name}
                {cat._id === value && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>,
        document.body,
      )}

      {errors.categoryId && (
        <p className="text-xs text-destructive mt-1">{String(errors.categoryId.message)}</p>
      )}
    </div>
  )
}
