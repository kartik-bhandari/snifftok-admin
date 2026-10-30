import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStock } from '@/hooks/useInventory'
import { useRole } from '@/hooks/useRole'
import { CardSkeleton, TableSkeleton } from '@/components/Skeletons'
import { ErrorState } from '@/components/States'
import { Segmented } from '@/features/inventory/components/parts'
import { StockOverview } from '@/features/inventory/components/StockOverview'
import { RestockList } from '@/features/inventory/components/RestockList'
import { NotSellingReport } from '@/features/inventory/components/NotSellingReport'
import { MovementHistory } from '@/features/inventory/components/MovementHistory'
import { AdjustStockDialog, type AdjustTarget } from '@/features/inventory/components/AdjustStockDialog'

type Tab = 'overview' | 'restock' | 'not-selling' | 'history'
const TABS: Tab[] = ['overview', 'restock', 'not-selling', 'history']

export default function InventoryPage() {
  const [params, setParams] = useSearchParams()
  const tab: Tab = TABS.includes(params.get('tab') as Tab) ? (params.get('tab') as Tab) : 'overview'
  const setTab = (t: Tab) => setParams(t === 'overview' ? {} : { tab: t }, { replace: true })

  const { canSeeCosts } = useRole()
  const stock = useStock()
  const [adjust, setAdjust] = useState<AdjustTarget | null>(null)

  const needsRestock = stock.data ? stock.data.totals.low + stock.data.totals.out : 0

  const stockState = stock.isError && !stock.data ? (
    <div className="rounded-2xl border border-border bg-card">
      <ErrorState message={(stock.error as Error)?.message} onRetry={() => stock.refetch()} />
    </div>
  ) : !stock.data ? (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} className="rounded-2xl" />)}
      </div>
      <div className="rounded-2xl border border-border bg-card"><TableSkeleton rows={6} cols={5} /></div>
    </>
  ) : null

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Stock levels, what to reorder, what isn&apos;t moving, and every stock change.</p>
        </div>
        <Segmented<Tab>
          label="Inventory sections"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'overview',    label: 'Overview' },
            { value: 'restock',     label: needsRestock ? `Restock (${needsRestock})` : 'Restock' },
            { value: 'not-selling', label: 'Not selling' },
            { value: 'history',     label: 'History' },
          ]}
        />
      </div>

      {tab === 'overview' && (stockState ?? (
        <StockOverview data={stock.data!} showCosts={canSeeCosts} onAdjust={item => setAdjust({ item })} />
      ))}
      {tab === 'restock' && (stockState ?? (
        <RestockList data={stock.data!} onRestock={(item, qty) => setAdjust({ item, reason: 'purchase', qty })} />
      ))}
      {tab === 'not-selling' && <NotSellingReport showCosts={canSeeCosts} />}
      {tab === 'history' && <MovementHistory />}

      <AdjustStockDialog target={adjust} onClose={() => setAdjust(null)} />
    </div>
  )
}
