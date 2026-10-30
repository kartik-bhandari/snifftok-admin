import type { ReactNode } from 'react'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_LABEL } from '@/features/inventory/format'
import type { StockStatus } from '@/types/api'

export function Thumb({ src, size = 'md' }: { src: string | null; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10'
  return src ? (
    <img src={src} alt="" className={cn(box, 'rounded-lg object-cover bg-muted shrink-0')} />
  ) : (
    <div className={cn(box, 'rounded-lg bg-muted flex items-center justify-center shrink-0')}>
      <Package className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}

export function SummaryCard({ label, value, hint, tone, className }: {
  label: string; value: ReactNode; hint?: string; tone?: 'warn' | 'bad'; className?: string
}) {
  return (
    <div className={cn('bg-card rounded-2xl border border-border p-4', className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn(
        'text-xl sm:text-2xl font-bold tabular-nums mt-1.5',
        tone === 'warn' && 'text-amber-600 dark:text-amber-400',
        tone === 'bad' && 'text-red-600 dark:text-red-400',
      )}>
        {value}
      </p>
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  )
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th className={cn('px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap', className)}>
      {children}
    </th>
  )
}

const STATUS_STYLE: Record<StockStatus, string> = {
  out: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  low: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  ok:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

export function StockStatusBadge({ status }: { status: StockStatus }) {
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap', STATUS_STYLE[status])}>
      {STATUS_LABEL[status]}
    </span>
  )
}

/** Segmented control used for tabs and filters on the inventory page */
export function Segmented<T extends string | number>({ options, value, onChange, label }: {
  options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; label: string
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex max-w-full overflow-x-auto [scrollbar-width:none] rounded-xl border border-border bg-card p-1">
      {options.map(o => (
        <button
          key={String(o.value)}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
            value === o.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
