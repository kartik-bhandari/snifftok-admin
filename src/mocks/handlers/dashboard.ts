import { http, HttpResponse, delay } from 'msw'
import { MOCK_SETTINGS, MOCK_PRODUCTS, generateChartData, MOCK_CUSTOMERS } from '../seed'

const latency = () => delay(Math.floor(Math.random() * 250) + 150)

export const dashboardHandlers = [
  // GET /api/admin/dashboard/summary — same shape as the real API
  http.get('*/api/admin/dashboard/summary', async ({ request }) => {
    await latency()
    const url = new URL(request.url)
    const raw = url.searchParams.get('period')
    const period = raw === 'today' || raw === '30d' ? raw : '7d'
    const days = period === 'today' ? 1 : period === '7d' ? 7 : 30

    const totals = (chartData: ReturnType<typeof generateChartData>) => {
      const revenue = chartData.reduce((s, d) => s + d.revenue, 0)
      const netProfit = chartData.reduce((s, d) => s + d.netProfit, 0)
      const orders = Math.floor(revenue / 350000)
      return { revenue, netProfit, orders, aov: Math.floor(revenue / (orders || 1)), unitsSold: orders + 3 }
    }

    const chartData = generateChartData(days)
    const current = totals(chartData)

    return HttpResponse.json({
      period,
      bucket: period === 'today' ? 'hour' : 'day',
      ...current,
      profitMissingCost: 0,
      byChannel: {
        web: Math.floor(current.orders * 0.6),
        whatsapp: Math.floor(current.orders * 0.3),
        admin: Math.floor(current.orders * 0.1),
      },
      chartData,
      previous: totals(generateChartData(days)),
      topProducts: MOCK_PRODUCTS.slice(0, 5).map((p, i) => ({
        productId: p._id,
        name: p.name,
        brand: p.brand ?? null,
        image: p.images?.[0]?.url ?? null,
        unitsSold: 12 - i * 2,
        revenue: (12 - i * 2) * 450000,
      })),
    })
  }),

  // GET /api/admin/dashboard/attention
  http.get('*/api/admin/dashboard/attention', async () => {
    await latency()
    return HttpResponse.json({
      items: [
        { type: 'order_pending', orderId: 'ord_005', orderNumber: 'SNF-00005', customerName: 'Riya Shah', total: 650000, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), message: 'Waiting to be confirmed' },
        { type: 'order_pending', orderId: 'ord_002', orderNumber: 'SNF-00002', customerName: 'Rahul Gupta', total: 500400, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), message: 'Waiting to be confirmed' },
        { type: 'low_stock', sku: 'TAB-2-TST', variantLabel: 'Tobacco Amber 2ml Tester', availableStock: 0, reorderLevel: 3, message: 'Out of stock' },
        { type: 'low_stock', sku: 'SNT-2-TST', variantLabel: 'Santal Mystique 2ml Tester', availableStock: 3, reorderLevel: 3, message: 'Only 3 left' },
      ],
    })
  }),

  // GET /api/admin/settings
  http.get('*/api/admin/settings', async () => {
    await latency()
    return HttpResponse.json(MOCK_SETTINGS)
  }),

  // PATCH /api/admin/settings
  http.patch('*/api/admin/settings', async ({ request }) => {
    await latency()
    const body = await request.json()
    return HttpResponse.json({ ...MOCK_SETTINGS, ...(body as object), updatedAt: new Date().toISOString() })
  }),

  // GET /api/admin/customers
  http.get('*/api/admin/customers', async () => {
    await latency()
    return HttpResponse.json({ data: MOCK_CUSTOMERS, total: MOCK_CUSTOMERS.length, page: 1, limit: 50, totalPages: 1 })
  }),

  // GET /api/admin/whatsapp/inbox
  http.get('*/api/admin/whatsapp/inbox', async () => {
    await latency()
    return HttpResponse.json({
      messages: [
        { _id: 'wa_001', from: '919876543210', customerName: 'Riya Shah', body: 'Hi, do you have Oud Royale 100ml available?', receivedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), handled: false },
        { _id: 'wa_002', from: '919123456789', customerName: null, body: 'I want to order the tester set. How much?', receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), handled: false },
      ]
    })
  }),
]
