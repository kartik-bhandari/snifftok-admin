import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, Filter, Package, ShoppingBag, ChevronDown,
  Clock, CheckCircle2, Truck, PackageCheck, XCircle, AlertCircle, Eye,
} from 'lucide-react'
import { apiFetch, apiPatch } from '@/api/client'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
interface OrderItem {
  name: string
  brand?: string
  variantType: string
  sizeMl: number
  unitPrice: number
  quantity: number
  lineTotal: number
}

interface Order {
  _id: string
  orderNumber: string
  customer: { name: string; email: string; phone: string }
  address: { line1: string; city?: string; state?: string; pincode: string; country: string }
  items: OrderItem[]
  subtotal: number
  shippingAmount: number
  total: number
  status: string
  notes?: string
  createdAt: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

const STATUS_META: Record<string, { label: string; cls: string; Icon: any }> = {
  pending:    { label: 'Pending',    cls: 'bg-amber-50 border-amber-200 text-amber-700',    Icon: Clock        },
  confirmed:  { label: 'Confirmed',  cls: 'bg-blue-50 border-blue-200 text-blue-700',       Icon: CheckCircle2 },
  processing: { label: 'Processing', cls: 'bg-purple-50 border-purple-200 text-purple-700', Icon: Package      },
  shipped:    { label: 'Shipped',    cls: 'bg-indigo-50 border-indigo-200 text-indigo-700', Icon: Truck        },
  delivered:  { label: 'Delivered',  cls: 'bg-emerald-50 border-emerald-200 text-emerald-700', Icon: PackageCheck },
  cancelled:  { label: 'Cancelled',  cls: 'bg-red-50 border-red-200 text-red-600',          Icon: XCircle      },
}

const ALL_STATUSES = Object.keys(STATUS_META)

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: status, cls: 'bg-muted border-border text-muted-foreground', Icon: AlertCircle }
  const { label, cls, Icon } = meta
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize', cls)}>
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  )
}

// ── Loading skeleton (same style as ProductsPage) ─────────────────────────────
function Skeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-border last:border-0">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/4 bg-muted rounded" />
            <div className="h-3 w-1/3 bg-muted rounded" />
          </div>
          <div className="h-6 w-24 bg-muted rounded-full" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}

// ── Pagination (same as ProductsPage) ─────────────────────────────────────────
function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 py-4 border-t border-border">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="px-3 py-1.5 text-sm rounded-lg border border-input disabled:opacity-40 hover:bg-accent transition-colors"
      >
        ← Prev
      </button>
      <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
      <button
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="px-3 py-1.5 text-sm rounded-lg border border-input disabled:opacity-40 hover:bg-accent transition-colors"
      >
        Next →
      </button>
    </div>
  )
}

// ── Order Detail Side Sheet ───────────────────────────────────────────────────
function OrderDetailSheet({ order, onClose }: { order: Order; onClose: () => void }) {
  const qc = useQueryClient()
  const [selStatus, setSelStatus] = useState(order.status)

  const updateStatus = useMutation({
    mutationFn: (s: string) => apiPatch(`/api/admin/orders/${order._id}/status`, { status: s }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  })

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[440px] bg-card h-full flex flex-col shadow-2xl z-10 overflow-y-auto border-l border-border">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Order</p>
            <h2 className="text-lg font-bold">{order.orderNumber}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status updater */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => { setSelStatus(s); updateStatus.mutate(s) }}
                  className={cn(
                    'text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize transition-all',
                    selStatus === s
                      ? STATUS_META[s].cls
                      : 'bg-background text-muted-foreground border-border hover:border-foreground/30'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            {updateStatus.isSuccess && <p className="text-[11px] text-emerald-600">✓ Status updated</p>}
          </div>

          {/* Customer */}
          <section>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Customer</p>
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1 text-sm">
              <p className="font-semibold">{order.customer.name}</p>
              <p className="text-muted-foreground">{order.customer.email}</p>
              <p className="text-muted-foreground">{order.customer.phone}</p>
            </div>
          </section>

          {/* Address */}
          <section>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Delivery Address</p>
            <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed">
              <p className="text-foreground">{order.address.line1}</p>
              {(order.address.city || order.address.state) && (
                <p>{[order.address.city, order.address.state].filter(Boolean).join(', ')}</p>
              )}
              <p>Pincode: {order.address.pincode} · {order.address.country}</p>
            </div>
          </section>

          {/* Items */}
          <section>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Items</p>
            <div className="rounded-xl border border-border bg-muted/20 overflow-hidden divide-y divide-border">
              {order.items.map((item, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold capitalize">{item.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.variantType === 'tester' ? 'Decant' : 'Bottle'} · {item.sizeMl}ml × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">{fmt(item.lineTotal)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Totals */}
          <section>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Summary</p>
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{fmt(order.shippingAmount)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                <span>Total</span><span>{fmt(order.total)}</span>
              </div>
            </div>
          </section>

          {order.notes && (
            <section>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-muted-foreground rounded-xl border border-border bg-muted/20 p-4">{order.notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Order Row (desktop) ────────────────────────────────────────────────────────
function OrderRow({ order, onView }: { order: Order; onView: (o: Order) => void }) {
  return (
    <tr className="border-b border-border hover:bg-accent/30 transition-colors group cursor-pointer" onClick={() => onView(order)}>
      <td className="pl-4 pr-2 py-3 w-10">
        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </div>
      </td>
      <td className="px-3 py-3">
        <p className="font-semibold text-sm">{order.orderNumber}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </td>
      <td className="px-3 py-3">
        <p className="text-sm font-medium">{order.customer.name}</p>
        <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
      </td>
      <td className="px-3 py-3 hidden md:table-cell">
        <span className="text-xs text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
      </td>
      <td className="px-3 py-3">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-3 py-3 text-right">
        <span className="text-sm font-semibold">{fmt(order.total)}</span>
      </td>
      <td className="pr-4 pl-2 py-3 text-right">
        <button
          onClick={e => { e.stopPropagation(); onView(order) }}
          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
          aria-label="View order"
        >
          <Eye className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}

// ── Order Card (mobile) ────────────────────────────────────────────────────────
function OrderCard({ order, onView }: { order: Order; onView: (o: Order) => void }) {
  return (
    <div
      className="bg-card rounded-2xl border border-border p-4 cursor-pointer hover:bg-accent/20 transition-colors"
      onClick={() => onView(order)}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm">{order.orderNumber}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{order.customer.name} · {order.customer.phone}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
        <span className="text-sm font-bold">{fmt(order.total)}</span>
      </div>
    </div>
  )
}

// ── API ────────────────────────────────────────────────────────────────────────
const fetchOrders = (page: number, status: string, search: string) =>
  apiFetch<{ data: Order[]; total: number; totalPages: number }>(
    `/api/admin/orders?page=${page}&limit=20${status ? `&status=${status}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
  )

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [page, setPage]         = useState(1)
  const [status, setStatus]     = useState('')
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState<Order | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-orders', page, status, search],
    queryFn:  () => fetchOrders(page, status, search),
    staleTime: 10_000,
  })

  const orders     = data?.data ?? []
  const total      = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {total} order{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* ── Search + Status filter ────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search name, email, order no…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary h-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary h-10 cursor-pointer"
          >
            <option value="">All statuses</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      {isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm text-destructive">Failed to load orders. Is the API running?</p>
        </div>
      ) : isLoading ? (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <Skeleton />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-1">No orders yet</h3>
          <p className="text-sm text-muted-foreground">
            {search || status ? 'No orders match your filters.' : 'Orders will appear here once customers check out.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="pl-4 pr-2 py-3 w-10" />
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Items</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="pr-4 pl-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <OrderRow key={o._id} order={o} onView={setSelected} />
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {orders.map(o => (
              <OrderCard key={o._id} order={o} onView={setSelected} />
            ))}
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </div>
        </>
      )}

      {selected && (
        <OrderDetailSheet order={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
