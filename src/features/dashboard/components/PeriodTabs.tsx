import { cn } from '@/lib/utils'
import type { DashboardPeriod } from '@/types/api'

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d',    label: '7 days' },
  { value: '30d',   label: '30 days' },
  { value: 'fy',    label: 'This FY' },
  { value: 'lifetime', label: 'Lifetime' },
]

interface Props {
  value: DashboardPeriod
  onChange: (period: DashboardPeriod) => void
}

export function PeriodTabs({ value, onChange }: Props) {
  return (
    <div role="tablist" aria-label="Period" className="inline-flex max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-xl border border-border bg-card p-1">
      {PERIODS.map(p => (
        <button
          key={p.value}
          role="tab"
          aria-selected={value === p.value}
          onClick={() => onChange(p.value)}
          className={cn(
            'px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
            value === p.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
