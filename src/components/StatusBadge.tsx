import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/api'

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  draft:              { label: 'Draft',            className: 'bg-muted text-muted-foreground' },
  awaiting_details:   { label: 'Awaiting Details', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  awaiting_payment:   { label: 'Awaiting Payment', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  confirmed:          { label: 'Confirmed',        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  packed:             { label: 'Packed',           className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  shipped:            { label: 'Shipped',          className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
  delivered:          { label: 'Delivered',        className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  cancelled:          { label: 'Cancelled',        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  refunded:           { label: 'Refunded',         className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
}

interface Props {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-muted text-muted-foreground' }

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.className, className)}>
      {config.label}
    </span>
  )
}
