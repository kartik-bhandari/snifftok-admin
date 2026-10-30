import { CheckCircle2, PackagePlus } from 'lucide-react'
import { coverText, suggestedReorder, variantLabel } from '@/features/inventory/format'
import { StockStatusBadge, Thumb } from './parts'
import type { StockItem, StockResponse } from '@/types/api'

interface Props {
  data: StockResponse
  onRestock: (item: StockItem, suggestedQty: number) => void
}

/** Low and out-of-stock items, most urgent first, with a suggested reorder quantity */
export function RestockList({ data, onRestock }: Props) {
  const items = data.items
    .filter(i => i.status !== 'ok')
    .sort((a, b) =>
      (a.status === 'out' ? 0 : 1) - (b.status === 'out' ? 0 : 1) ||
      b.sold30 - a.sold30 ||                       // fastest sellers first
      a.available - b.available ||
      a.name.localeCompare(b.name))

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card px-4 py-12 text-center">
        <CheckCircle2 className="h-7 w-7 mx-auto mb-2 text-profit" />
        <p className="text-sm font-semibold">Nothing needs restocking</p>
        <p className="text-xs text-muted-foreground mt-1">Every product is above its reorder level.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Out of stock first, then the fastest sellers. Suggested quantity covers about 30 days of recent sales
        (at least twice the reorder level). Set reorder levels per size in Products.
      </p>
      <ul className="space-y-2">
        {items.map(i => {
          const qty = suggestedReorder(i)
          return (
            <li key={i.variantId} className="rounded-2xl border border-border bg-card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Thumb src={i.image} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{i.name}</p>
                    <StockStatusBadge status={i.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {variantLabel(i)} · <span className="font-mono">{i.sku}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {i.available} available · reorder at {i.reorderLevel} · {i.sold30} sold in 30 days
                    {i.available > 0 && <> · lasts {coverText(i).toLowerCase()}</>}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span className="text-xs text-muted-foreground">
                  Suggest <span className="font-semibold text-foreground tabular-nums">{qty}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onRestock(i, qty)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <PackagePlus className="h-3.5 w-3.5" /> Record stock in
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
