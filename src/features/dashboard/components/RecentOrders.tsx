import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { apiFetch } from '@/api/client'
import { MoneyText } from '@/components/MoneyText'
import { fromNow } from '@/lib/date'

interface RecentOrder {
  _id: string
  orderNumber: string
  customer: { name: string }
  total: number
  status: string
  createdAt: string
}

const STATUS_DOT: Record<string, string> = {
  pending:    'bg-amber-500',
  confirmed:  'bg-blue-500',
  processing: 'bg-purple-500',
  shipped:    'bg-indigo-500',
  delivered:  'bg-emerald-500',
  cancelled:  'bg-red-500',
}

export function RecentOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', 'recent'],
    queryFn:  () => apiFetch<{ data: RecentOrder[] }>('/api/admin/orders?page=1&limit=5'),
    staleTime: 30_000,
  })
  const orders = data?.data ?? []

  return (
    <section className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">Recent orders</h2>
        <Link to="/orders" className="text-xs font-medium text-muted-foreground hover:text-foreground">View all</Link>
      </div>

      {isLoading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-4 py-3 animate-pulse space-y-2">
              <div className="h-3 w-28 bg-muted rounded" />
              <div className="h-2.5 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="px-4 py-8 text-center text-xs text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {orders.map(o => (
            <li key={o._id}>
              <Link to={`/orders/${o._id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors">
                <span className={`h-2 w-2 rounded-full shrink-0 ${STATUS_DOT[o.status] ?? 'bg-muted-foreground'}`} title={o.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{o.customer.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {o.orderNumber} · <span className="capitalize">{o.status}</span> · {fromNow(o.createdAt)}
                  </p>
                </div>
                <MoneyText paise={o.total} className="text-sm font-semibold shrink-0" />
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
