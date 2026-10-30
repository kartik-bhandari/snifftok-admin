import { http, HttpResponse, delay } from 'msw'
import { MOCK_PRODUCTS } from '../seed'
import type { NotSellingItem, StockItem, StockMovementItem } from '@/types/api'

const latency = () => delay(Math.floor(Math.random() * 250) + 150)

// In-memory ledger so adjustments show up in History during a mock session
const movements: StockMovementItem[] = []

function stockItems(): StockItem[] {
  return MOCK_PRODUCTS.flatMap(p => p.variants.map((v, vi) => {
    const reserved = v.reserved ?? 0
    const available = Math.max(0, v.stock - reserved)
    const reorderLevel = v.reorderLevel ?? 3
    const sold30 = (vi + p.name.length) % 7
    return {
      productId: p._id, variantId: v._id ?? `${p._id}-${vi}`, name: p.name, brand: p.brand ?? null,
      image: p.images?.[0]?.url ?? null, sku: v.sku, type: v.type, sizeMl: v.sizeMl,
      stock: v.stock, reserved, available, reorderLevel,
      status: available === 0 ? 'out' as const : available <= reorderLevel ? 'low' as const : 'ok' as const,
      sold30, daysOfCover: sold30 ? Math.floor(available / (sold30 / 30)) : null, lastSoldAt: null,
      costPrice: v.costPrice ?? 0, stockValue: (v.costPrice ?? 0) * available,
    }
  }))
}

export const inventoryHandlers = [
  // GET /api/admin/inventory/stock
  http.get('*/api/admin/inventory/stock', async () => {
    await latency()
    const items = stockItems().sort((a, b) => a.name.localeCompare(b.name))
    return HttpResponse.json({
      totals: {
        variants: items.length,
        available: items.reduce((s, i) => s + i.available, 0),
        reserved: items.reduce((s, i) => s + i.reserved, 0),
        low: items.filter(i => i.status === 'low').length,
        out: items.filter(i => i.status === 'out').length,
        stockValue: items.reduce((s, i) => s + (i.stockValue ?? 0), 0),
      },
      items,
    })
  }),

  // POST /api/admin/inventory/adjust — mutates the mock product
  http.post('*/api/admin/inventory/adjust', async ({ request }) => {
    await latency()
    const body = await request.json() as { sku: string; delta: number; reason: string; note?: string }
    const product = MOCK_PRODUCTS.find(p => p.variants.some(v => v.sku === body.sku.toUpperCase()))
    const v = product?.variants.find(x => x.sku === body.sku.toUpperCase())
    if (!product || !v) return HttpResponse.json({ message: `No product with SKU ${body.sku}.` }, { status: 404 })
    if (v.stock + body.delta < (v.reserved ?? 0)) return HttpResponse.json({ message: 'Too many removed.' }, { status: 400 })
    v.stock += body.delta
    movements.unshift({
      _id: `mv_${Date.now()}`, sku: v.sku, name: product.name, type: v.type, sizeMl: v.sizeMl, delta: body.delta,
      field: 'stock', reason: body.reason, note: body.note ?? null, actor: 'Admin', createdAt: new Date().toISOString(),
    })
    return HttpResponse.json({ sku: v.sku, stock: v.stock, reserved: v.reserved ?? 0, available: v.stock - (v.reserved ?? 0) }, { status: 201 })
  }),

  // GET /api/admin/inventory/movements
  http.get('*/api/admin/inventory/movements', async ({ request }) => {
    await latency()
    const sku = new URL(request.url).searchParams.get('sku')
    return HttpResponse.json({ items: sku ? movements.filter(m => m.sku === sku.toUpperCase()) : movements, nextBefore: null })
  }),

  // GET /api/admin/inventory/not-selling — same shape as the real API
  http.get('*/api/admin/inventory/not-selling', async ({ request }) => {
    await latency()
    const url   = new URL(request.url)
    const days  = [30, 60, 90].includes(Number(url.searchParams.get('days'))) ? Number(url.searchParams.get('days')) : 30
    const limit = Number(url.searchParams.get('limit')) || 200

    // Every other variant "not selling"; longer periods show fewer (older sales count)
    const items: NotSellingItem[] = MOCK_PRODUCTS.flatMap((p, pi) =>
      p.variants.map((v, vi) => ({ p, v, n: pi * 2 + vi })))
      .filter(({ v, n }) => n % 2 === 0 && v.stock - (v.reserved ?? 0) > 0 && n < 14 - days / 15)
      .map(({ p, v, n }) => {
        const available = v.stock - (v.reserved ?? 0)
        const ago = n % 3 === 0 ? null : days + 10 + n * 7
        return {
          productId: p._id, variantId: v._id ?? `${p._id}-${n}`, name: p.name, brand: p.brand ?? null,
          image: p.images?.[0]?.url ?? null, sku: v.sku, type: v.type, sizeMl: v.sizeMl, available,
          lastSoldAt: ago == null ? null : new Date(Date.now() - ago * 86400000).toISOString(),
          daysSinceLastSale: ago, stockValue: (v.costPrice ?? 0) * available,
        }
      })
      .sort((a, b) => (b.stockValue ?? 0) - (a.stockValue ?? 0))

    return HttpResponse.json({
      days,
      totals: {
        variants: items.length,
        units: items.reduce((s, i) => s + i.available, 0),
        stockValue: items.reduce((s, i) => s + (i.stockValue ?? 0), 0),
      },
      items: items.slice(0, limit),
    })
  }),
]
