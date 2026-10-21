import { http, HttpResponse, delay } from 'msw'
import { MOCK_ORDERS } from '../seed'
import type { Order } from '@/types/api'

const latency = () => delay(Math.floor(Math.random() * 250) + 150)
let orders = [...MOCK_ORDERS]

export const orderHandlers = [
  // GET /api/admin/orders
  http.get('*/api/admin/orders', async ({ request }) => {
    await latency()
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''

    let filtered = orders
    if (status) filtered = filtered.filter(o => o.status === status)
    if (search) filtered = filtered.filter(o =>
      o.orderNumber.toLowerCase().includes(search) ||
      o.customer.name.toLowerCase().includes(search) ||
      o.customer.phone.includes(search)
    )

    return HttpResponse.json({ data: filtered, total: filtered.length, page: 1, limit: 50, totalPages: 1 })
  }),

  // GET /api/admin/orders/:id
  http.get('*/api/admin/orders/:id', async ({ params }) => {
    await latency()
    const o = orders.find(x => x._id === params.id || x.orderNumber === params.id)
    if (!o) return HttpResponse.json({ message: 'Order not found' }, { status: 404 })
    return HttpResponse.json(o)
  }),

  // PATCH /api/admin/orders/:id/status
  http.patch('*/api/admin/orders/:id/status', async ({ params, request }) => {
    await latency()
    const body = await request.json() as { status: string; tracking?: any }
    orders = orders.map(o => o._id === params.id
      ? { ...o, status: body.status as any, ...(body.tracking ? { tracking: body.tracking } : {}), updatedAt: new Date().toISOString() }
      : o
    )
    return HttpResponse.json(orders.find(o => o._id === params.id))
  }),

  // GET /api/admin/orders/:id/timeline
  http.get('*/api/admin/orders/:id/timeline', async ({ params }) => {
    await latency()
    const o = orders.find(x => x._id === params.id)
    return HttpResponse.json({
      events: [
        { type: 'created', actor: o?.source === 'web' ? 'customer' : 'admin', note: `Order placed via ${o?.source}`, at: o?.createdAt },
        ...(o?.payment.paidAt ? [{ type: 'paid', actor: 'system', note: `Payment confirmed — ${o.payment.method}`, at: o.payment.paidAt }] : []),
        ...(o?.status === 'packed' || o?.status === 'shipped' || o?.status === 'delivered' ? [{ type: 'packed', actor: 'staff_001', note: 'Packed and ready for dispatch', at: o.updatedAt }] : []),
        ...(o?.tracking?.awb ? [{ type: 'shipped', actor: 'staff_001', note: `Shipped via ${o.tracking.courier} — AWB: ${o.tracking.awb}`, at: o.updatedAt }] : []),
      ]
    })
  }),

  // POST /api/admin/orders/quick
  http.post('*/api/admin/orders/quick', async ({ request }) => {
    await latency()
    const body = await request.json() as any
    const newOrder: Order = {
      _id: `ord_${Date.now()}`,
      orderNumber: `SNF-${String(orders.length + 1).padStart(5, '0')}`,
      source: 'admin',
      ...body,
      status: 'confirmed',
      payment: body.payment ?? {},
      totals: body.totals ?? { linesTotal: 0, shipping: 0, grandTotal: 0, gstAmount: 0, gatewayFee: 0, gatewayFeeGst: 0, totalCost: 0, netProfit: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    orders = [newOrder, ...orders]
    return HttpResponse.json(newOrder, { status: 201 })
  }),

  // POST /api/cart/quote
  http.post('*/api/cart/quote', async ({ request }) => {
    await latency()
    const body = await request.json() as { lines: Array<{ sku: string; qty: number }> }
    // Return a simple mock quote
    const lineTotal = body.lines.reduce((s, l) => s + l.qty * 200000, 0)
    const shipping = 8000
    return HttpResponse.json({ linesTotal: lineTotal, shipping, grandTotal: lineTotal + shipping })
  }),
]
