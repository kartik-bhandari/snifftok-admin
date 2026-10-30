import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { MoneyText } from '@/components/MoneyText'
import { coverText, variantLabel } from '@/features/inventory/format'
import { Segmented, StockStatusBadge, SummaryCard, Th, Thumb } from './parts'
import type { StockItem, StockResponse, StockStatus } from '@/types/api'

type StatusFilter = 'all' | StockStatus
type SortKey = 'name' | 'available' | 'cover' | 'value'

interface Props {
  data: StockResponse
  showCosts: boolean
  onAdjust: (item: StockItem) => void
}

const coverSort = (i: StockItem) => (i.available === 0 ? -1 : i.daysOfCover ?? Number.MAX_SAFE_INTEGER)

export function StockOverview({ data, showCosts, onAdjust }: Props) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [sort, setSort]     = useState<SortKey>('name')

  const items = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = data.items.filter(i =>
      (status === 'all' || i.status === status) &&
      (!q || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.brand?.toLowerCase().includes(q)))
    const sorters: Record<SortKey, (a: StockItem, b: StockItem) => number> = {
      name:      (a, b) => a.name.localeCompare(b.name) || a.sizeMl - b.sizeMl,
      available: (a, b) => a.available - b.available,
      cover:     (a, b) => coverSort(a) - coverSort(b),
      value:     (a, b) => (b.stockValue ?? 0) - (a.stockValue ?? 0),
    }
    return [...filtered].sort(sorters[sort])
  }, [data.items, search, status, sort])

  const t = data.totals
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <SummaryCard label="Products" value={t.variants.toLocaleString('en-IN')} hint="active sizes" />
        <SummaryCard label="Units available" value={t.available.toLocaleString('en-IN')} hint={`${t.reserved} reserved for orders`} />
        <SummaryCard label="Low stock" value={t.low} hint="at or below reorder level" tone={t.low ? 'warn' : undefined} />
        <SummaryCard label="Out of stock" value={t.out} hint="nothing available" tone={t.out ? 'bad' : undefined} />
        {showCosts && t.stockValue != null && (
          <SummaryCard label="Stock value" value={<MoneyText paise={t.stockValue} />} hint="available units at cost" className="col-span-2 lg:col-span-1" />
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, brand or SKU…"
            aria-label="Search stock"
            className="w-full pl-9 pr-4 h-10 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Segmented<StatusFilter>
          label="Stock status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'low', label: `Low (${t.low})` },
            { value: 'out', label: `Out (${t.out})` },
            { value: 'ok',  label: 'In stock' },
          ]}
        />
        <label className="relative inline-flex items-center">
          <SlidersHorizontal className="absolute left-3 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            aria-label="Sort by"
            className="appearance-none pl-8 pr-3 h-10 rounded-xl border border-input bg-background text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="name">Name A–Z</option>
            <option value="available">Lowest stock</option>
            <option value="cover">Running out soonest</option>
            {showCosts && <option value="value">Highest value</option>}
          </select>
        </label>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          {data.items.length === 0 ? 'No active products yet.' : 'No products match these filters.'}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <Th className="pl-4">Product</Th>
                  <Th>SKU</Th>
                  <Th className="text-right">Available</Th>
                  <Th className="text-right">Reorder at</Th>
                  <Th className="text-right">Sold (30d)</Th>
                  <Th>Stock left for</Th>
                  {showCosts && <Th className="text-right">Value</Th>}
                  <Th>Status</Th>
                  <Th className="pr-4" />
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.variantId} className="border-b border-border last:border-0 hover:bg-accent/30">
                    <td className="pl-4 pr-3 py-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <Thumb src={i.image} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate max-w-[260px]">{i.name}</p>
                          <p className="text-xs text-muted-foreground">{variantLabel(i)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-mono text-muted-foreground">{i.sku}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-sm font-semibold tabular-nums">{i.available}</span>
                      {i.reserved > 0 && <span className="block text-[11px] text-muted-foreground">{i.reserved} reserved</span>}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-right tabular-nums text-muted-foreground">{i.reorderLevel}</td>
                    <td className="px-3 py-2.5 text-sm text-right tabular-nums">{i.sold30}</td>
                    <td className="px-3 py-2.5 text-sm text-muted-foreground whitespace-nowrap">{coverText(i)}</td>
                    {showCosts && (
                      <td className="px-3 py-2.5 text-right"><MoneyText paise={i.stockValue ?? 0} className="text-sm" /></td>
                    )}
                    <td className="px-3 py-2.5"><StockStatusBadge status={i.status} /></td>
                    <td className="pr-4 pl-2 py-2.5 text-right">
                      <AdjustButton onClick={() => onAdjust(i)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards (mobile + tablet) */}
          <ul className="lg:hidden space-y-2">
            {items.map(i => (
              <li key={i.variantId} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex gap-3">
                  <Thumb src={i.image} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">{i.name}</p>
                      <StockStatusBadge status={i.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{variantLabel(i)} · <span className="font-mono">{i.sku}</span></p>
                  </div>
                </div>
                <dl className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <Stat label="Available" value={i.available} sub={i.reserved ? `${i.reserved} reserved` : undefined} />
                  <Stat label="Sold (30d)" value={i.sold30} />
                  <Stat label="Lasts" value={coverText(i)} />
                </dl>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">
                    Reorder at {i.reorderLevel}
                    {showCosts && i.stockValue != null && <> · <MoneyText paise={i.stockValue} /></>}
                  </span>
                  <AdjustButton onClick={() => onAdjust(i)} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl bg-muted/50 px-2 py-1.5">
      <dt className="text-[10px] text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold tabular-nums truncate">{value}</dd>
      {sub && <dd className="text-[10px] text-muted-foreground">{sub}</dd>}
    </div>
  )
}

function AdjustButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors"
    >
      Adjust
    </button>
  )
}
