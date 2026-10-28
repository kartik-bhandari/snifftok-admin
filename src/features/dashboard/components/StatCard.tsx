import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: ReactNode
  /** Current and previous raw values — used for the change indicator */
  current: number
  previous: number
  /** Text after the change, e.g. "vs previous 7 days" */
  compareLabel: string
  hint?: ReactNode
}

export function StatCard({ label, value, current, previous, compareLabel, hint }: Props) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tabular-nums mt-1.5 truncate">{value}</p>
      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground min-w-0">
        <Change current={current} previous={previous} />
        <span className="truncate">{compareLabel}</span>
      </div>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

function Change({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) {
    return <span className="font-semibold text-foreground">{current === 0 ? '—' : 'New'}</span>
  }
  const pct = ((current - previous) / Math.abs(previous)) * 100
  const up  = pct >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span className={cn('inline-flex items-center font-semibold tabular-nums', up ? 'text-profit' : 'text-destructive')}>
      <Icon className="h-3 w-3" />
      {Math.abs(pct) >= 1000 ? '999+' : Math.abs(pct).toFixed(0)}%
    </span>
  )
}
