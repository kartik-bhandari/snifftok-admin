import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, ChevronRight, Clock, PackageX } from 'lucide-react'
import { MoneyText } from '@/components/MoneyText'
import { fromNow } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { AttentionItem } from '@/types/api'

interface Props {
  items: AttentionItem[] | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

export function AttentionPanel({ items, isLoading, isError, onRetry }: Props) {
  const count = items?.length ?? 0

  return (
    <section className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          Needs attention
          {count > 0 && (
            <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 text-[10px] font-semibold tabular-nums">
              {count}
            </span>
          )}
        </h2>
      </div>

      {isError ? (
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-destructive mb-2">Couldn't load this list.</p>
          <button onClick={onRetry} className="text-xs font-medium underline underline-offset-2">Try again</button>
        </div>
      ) : isLoading ? (
        <ul className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="px-4 py-3 flex gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-lg bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-muted rounded" />
                <div className="h-2.5 w-24 bg-muted rounded" />
              </div>
            </li>
          ))}
        </ul>
      ) : count === 0 ? (
        <div className="px-4 py-8 text-center">
          <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-profit" />
          <p className="text-sm font-medium">All caught up</p>
          <p className="text-xs text-muted-foreground mt-0.5">No pending orders or low stock.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border max-h-[420px] overflow-y-auto">
          {items!.map((item, i) => <AttentionRow key={`${item.type}-${item.orderId ?? item.sku ?? i}`} item={item} />)}
        </ul>
      )}
    </section>
  )
}

function AttentionRow({ item }: { item: AttentionItem }) {
  if (item.type === 'low_stock') {
    const out = (item.availableStock ?? 0) <= 0
    return (
      <li>
        <Link to="/inventory" className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors">
          <Icon className={out ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}>
            {out ? <PackageX className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          </Icon>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.variantLabel}</p>
            <p className="text-xs text-muted-foreground">
              {item.message} · <span className="font-mono">{item.sku}</span>
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </Link>
      </li>
    )
  }

  // order_pending (and any future order-type items)
  return (
    <li>
      <Link
        to={item.orderId ? `/orders/${item.orderId}` : '/orders?status=pending'}
        className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors"
      >
        <Icon className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <Clock className="h-4 w-4" />
        </Icon>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.orderNumber}</p>
          <p className="text-xs text-muted-foreground truncate">
            {item.customerName ?? item.message}{item.createdAt && ` · ${fromNow(item.createdAt)}`}
          </p>
        </div>
        {item.total != null && <MoneyText paise={item.total} className="text-sm font-semibold shrink-0" />}
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </Link>
    </li>
  )
}

function Icon({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', className)}>{children}</div>
}
