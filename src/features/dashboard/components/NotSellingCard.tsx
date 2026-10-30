import { Link } from 'react-router-dom'
import { CheckCircle2, Package } from 'lucide-react'
import { useNotSelling } from '@/hooks/useInventory'
import { MoneyText } from '@/components/MoneyText'
import { lastSoldText, variantLabel } from '@/features/inventory/format'
import { cn } from '@/lib/utils'

const DAYS = 30
const SHOW = 5

/**
 * Dashboard companion to Top products: in-stock items with no sales in the
 * last 30 days (fixed — "not sold today" would just be noise). Full list on
 * the Inventory page.
 */
export function NotSellingCard({ showCosts }: { showCosts: boolean }) {
  const { data, isLoading, isError } = useNotSelling(DAYS, SHOW)
  const items = data?.items ?? []

  return (
    <section className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Not selling</h2>
          <p className="text-[11px] text-muted-foreground truncate">
            In stock, no sales in {DAYS} days
            {data && data.totals.variants > 0 && (
              <>
                {' · '}{data.totals.variants} item{data.totals.variants === 1 ? '' : 's'}
                {showCosts && data.totals.stockValue != null && <> · <MoneyText paise={data.totals.stockValue} /> tied up</>}
              </>
            )}
          </p>
        </div>
        <Link to="/inventory" className="text-xs font-medium text-muted-foreground hover:text-foreground shrink-0">View all</Link>
      </div>

      {isError ? (
        <p className="px-4 py-6 text-center text-xs text-destructive">Couldn&apos;t load this list.</p>
      ) : isLoading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex gap-3 animate-pulse">
              <div className="h-9 w-9 rounded-lg bg-muted shrink-0" />
              <div className="flex-1 space-y-2"><div className="h-3 w-32 bg-muted rounded" /><div className="h-2.5 w-20 bg-muted rounded" /></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-profit" />
          <p className="text-sm font-medium">Everything in stock is selling</p>
          <p className="text-xs text-muted-foreground mt-0.5">No idle stock in the last {DAYS} days.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map(i => (
            <li key={i.variantId} className="flex items-center gap-3 px-4 py-3">
              {i.image ? (
                <img src={i.image} alt="" className="h-9 w-9 rounded-lg object-cover bg-muted shrink-0" />
              ) : (
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{i.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {variantLabel(i)} · {i.available} in stock ·{' '}
                  <span className={cn(i.daysSinceLastSale == null ? 'text-red-600 dark:text-red-400' : 'text-amber-700 dark:text-amber-400')}>
                    {lastSoldText(i)}
                  </span>
                </p>
              </div>
              {showCosts && i.stockValue != null && (
                <MoneyText paise={i.stockValue} className="text-sm font-semibold shrink-0" />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
