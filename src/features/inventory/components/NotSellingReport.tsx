import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useNotSelling } from '@/hooks/useInventory'
import { MoneyText } from '@/components/MoneyText'
import { CardSkeleton, TableSkeleton } from '@/components/Skeletons'
import { ErrorState } from '@/components/States'
import { formatDate } from '@/lib/date'
import { cn } from '@/lib/utils'
import { lastSoldText, variantLabel } from '@/features/inventory/format'
import { Segmented, SummaryCard, Th, Thumb } from './parts'
import type { NotSellingDays, NotSellingItem } from '@/types/api'

/** In-stock items with no sales in 30 / 60 / 90 days */
export function NotSellingReport({ showCosts }: { showCosts: boolean }) {
  const [days, setDays] = useState<NotSellingDays>(30)
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useNotSelling(days)

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <p className="text-xs text-muted-foreground max-w-md">
          Active products in stock with no sales in the last {days} days{showCosts ? ', most money tied up first' : ', longest without a sale first'} —
          candidates to promote, discount or stop reordering.
        </p>
        <Segmented<NotSellingDays>
          label="Period"
          value={days}
          onChange={setDays}
          options={[{ value: 30, label: '30 days' }, { value: 60, label: '60 days' }, { value: 90, label: '90 days' }]}
        />
      </div>

      {isError && !data ? (
        <div className="rounded-2xl border border-border bg-card"><ErrorState message={(error as Error)?.message} onRetry={() => refetch()} /></div>
      ) : isLoading || !data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} className="rounded-2xl" />)}
          </div>
          <div className="rounded-2xl border border-border bg-card"><TableSkeleton rows={5} cols={4} /></div>
        </>
      ) : (
        <div className={cn('space-y-4 transition-opacity', isPlaceholderData && 'opacity-60')}>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <SummaryCard label="Products not selling" value={data.totals.variants.toLocaleString('en-IN')} hint="product sizes" />
            <SummaryCard label="Units sitting idle" value={data.totals.units.toLocaleString('en-IN')} hint="available to sell" />
            {showCosts && data.totals.stockValue != null && (
              <SummaryCard label="Money tied up" value={<MoneyText paise={data.totals.stockValue} />} hint="at cost price" className="col-span-2 lg:col-span-1" />
            )}
          </div>

          {data.items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-4 py-12 text-center">
              <CheckCircle2 className="h-7 w-7 mx-auto mb-2 text-profit" />
              <p className="text-sm font-semibold">Everything in stock has sold in the last {days} days</p>
              <p className="text-xs text-muted-foreground mt-1">Nothing is sitting idle — nice.</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <Th className="pl-4">Product</Th>
                      <Th>SKU</Th>
                      <Th className="text-right">In stock</Th>
                      <Th>Last sold</Th>
                      {showCosts && <Th className="text-right pr-4">Money tied up</Th>}
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map(i => (
                      <tr key={i.variantId} className="border-b border-border last:border-0">
                        <td className="pl-4 pr-3 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Thumb src={i.image} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{i.name}</p>
                              <p className="text-xs text-muted-foreground">{variantLabel(i)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs font-mono text-muted-foreground">{i.sku}</td>
                        <td className="px-3 py-3 text-sm text-right tabular-nums">{i.available}</td>
                        <td className="px-3 py-3"><LastSold item={i} /></td>
                        {showCosts && (
                          <td className="pr-4 pl-3 py-3 text-right"><MoneyText paise={i.stockValue ?? 0} className="text-sm font-semibold" /></td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="md:hidden space-y-2">
                {data.items.map(i => (
                  <li key={i.variantId} className="rounded-2xl border border-border bg-card p-3 flex gap-3">
                    <Thumb src={i.image} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{variantLabel(i)} · {i.available} in stock</p>
                      <div className="mt-1"><LastSold item={i} /></div>
                    </div>
                    {showCosts && (
                      <div className="text-right shrink-0">
                        <MoneyText paise={i.stockValue ?? 0} className="text-sm font-semibold" />
                        <p className="text-[11px] text-muted-foreground">tied up</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function LastSold({ item }: { item: NotSellingItem }) {
  const never = item.daysSinceLastSale == null
  return (
    <span className="inline-flex flex-col">
      <span className={cn(
        'inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold',
        never ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      )}>
        {lastSoldText(item)}
      </span>
      {item.lastSoldAt && <span className="text-[11px] text-muted-foreground mt-0.5">{formatDate(item.lastSoldAt)}</span>}
    </span>
  )
}
