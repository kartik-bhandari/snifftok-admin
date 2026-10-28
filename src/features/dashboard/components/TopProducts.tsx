import { Package } from 'lucide-react'
import { MoneyText } from '@/components/MoneyText'
import type { DashboardSummary } from '@/types/api'

export function TopProducts({ products }: { products: DashboardSummary['topProducts'] }) {
  const max = Math.max(1, ...products.map(p => p.revenue))

  return (
    <section className="bg-card rounded-2xl border border-border overflow-hidden">
      <h2 className="text-sm font-semibold px-4 py-3 border-b border-border">Top products</h2>

      {products.length === 0 ? (
        <p className="px-4 py-8 text-center text-xs text-muted-foreground">No products sold in this period.</p>
      ) : (
        <ol className="divide-y divide-border">
          {products.map((p, i) => (
            <li key={p.productId ?? p.name} className="flex items-center gap-3 px-4 py-3">
              <span className="w-4 text-xs font-semibold text-muted-foreground tabular-nums">{i + 1}</span>
              {p.image ? (
                <img src={p.image} alt="" className="h-9 w-9 rounded-lg object-cover bg-muted shrink-0" />
              ) : (
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(p.revenue / max) * 100}%` }} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <MoneyText paise={p.revenue} className="text-sm font-semibold" />
                <p className="text-[11px] text-muted-foreground tabular-nums">{p.unitsSold} sold</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
