import { cn } from '@/lib/utils'
import type { DashboardPeriod } from '@/types/api'

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d',    label: '7 days' },
  { value: '30d',   label: '30 days' },
]

interface Props {
  value: DashboardPeriod
  onChange: (period: DashboardPeriod) => void
}

export function PeriodTabs({ value, onChange }: Props) {
  return (
    <div role="tablist" aria-label="Period" className="inline-flex rounded-xl border border-border bg-card p-1">
      {PERIODS.map(p => (
        <button
          key={p.value}
          role="tab"
          aria-selected={value === p.value}
          onClick={() => onChange(p.value)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
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
