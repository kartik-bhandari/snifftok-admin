import { useEffect, useState } from 'react'
import { History, Loader2, Search } from 'lucide-react'
import { useMovements } from '@/hooks/useInventory'
import { ErrorState } from '@/components/States'
import { TableSkeleton } from '@/components/Skeletons'
import { formatDateTime } from '@/lib/date'
import { cn } from '@/lib/utils'
import { REASON_LABEL, variantLabel } from '@/features/inventory/format'

/** Stock ledger — every recorded stock change, newest first */
export function MovementHistory() {
  const [skuInput, setSkuInput] = useState('')
  const [sku, setSku] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setSku(skuInput.trim().toUpperCase()), 300)
    return () => clearTimeout(t)
  }, [skuInput])

  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useMovements(sku || undefined)
  const items = data?.pages.flatMap(p => p.items) ?? []

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={skuInput}
          onChange={e => setSkuInput(e.target.value)}
          placeholder="Filter by exact SKU…"
          aria-label="Filter history by SKU"
          className="w-full pl-9 pr-4 h-10 rounded-xl border border-input bg-background text-sm font-mono uppercase placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {isError ? (
        <div className="rounded-2xl border border-border bg-card"><ErrorState message={(error as Error)?.message} onRetry={() => refetch()} /></div>
      ) : isLoading ? (
        <div className="rounded-2xl border border-border bg-card"><TableSkeleton rows={5} cols={4} /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-12 text-center">
          <History className="h-7 w-7 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-semibold">{sku ? `No stock changes for ${sku}` : 'No stock changes yet'}</p>
          <p className="text-xs text-muted-foreground mt-1">Stock received, returns and corrections show up here.</p>
        </div>
      ) : (
        <ol className="rounded-2xl border border-border bg-card divide-y divide-border">
          {items.map(m => (
            <li key={m._id} className="px-4 py-3 flex items-start gap-3">
              <span className={cn(
                'mt-0.5 min-w-[52px] text-center rounded-lg px-2 py-1 text-sm font-bold tabular-nums',
                m.delta > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
              )}>
                {m.delta > 0 ? `+${m.delta}` : m.delta}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {m.name ?? m.sku}
                  {m.sizeMl != null && <span className="text-muted-foreground font-normal"> · {variantLabel(m)}</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {REASON_LABEL[m.reason] ?? m.reason}
                  {m.field === 'reserved' && ' (reserved)'}
                  {' · '}<span className="font-mono">{m.sku}</span>
                  {' · '}{m.actor}
                </p>
                {m.note && <p className="text-xs mt-1 text-foreground/80">“{m.note}”</p>}
              </div>
              <time className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0" dateTime={m.createdAt}>
                {formatDateTime(m.createdAt)}
              </time>
            </li>
          ))}
        </ol>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50"
          >
            {isFetchingNextPage && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Load older changes
          </button>
        </div>
      )}
    </div>
  )
}
