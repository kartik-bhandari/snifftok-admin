import { http, HttpResponse, delay } from 'msw'
import { MOCK_SETTINGS, MOCK_PRODUCTS, generateChartData, MOCK_CUSTOMERS } from '../seed'

const latency = () => delay(Math.floor(Math.random() * 250) + 150)

export const dashboardHandlers = [
  // GET /api/admin/dashboard/summary
  http.get('*/api/admin/dashboard/summary', async ({ request }) => {
    await latency()
    const url = new URL(request.url)
    const period = url.searchParams.get('period') ?? '7d'
    const days = period === 'today' ? 1 : period === '7d' ? 7 : 30

    const chartData = generateChartData(days)
    const revenue = chartData.reduce((s, d) => s + d.revenue, 0)
    const netProfit = chartData.reduce((s, d) => s + d.netProfit, 0)
    const orders = Math.floor(revenue / 350000)

    return HttpResponse.json({
      revenue,
      netProfit,
      orders,
      aov: Math.floor(revenue / (orders || 1)),
      unitsSold: orders + Math.floor(Math.random() * 10),
      byChannel: {
        web: Math.floor(orders * 0.6),
        whatsapp: Math.floor(orders * 0.3),
        admin: Math.floor(orders * 0.1),
      },
      chartData,
    })
  }),

  // GET /api/admin/dashboard/attention
  http.get('*/api/admin/dashboard/attention', async () => {
    await latency()
    return HttpResponse.json({
      items: [
        { type: 'order_awaiting', orderId: 'ord_005', orderNumber: 'SNF-00005', message: 'Awaiting customer details — placed 30 min ago', expiresAt: new Date(Date.now() + 23.5 * 60 * 60 * 1000).toISOString() },
        { type: 'order_expiring', orderId: 'ord_002', orderNumber: 'SNF-00002', message: 'Payment reservation expires in 3 hours', expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() },
        { type: 'low_stock', sku: 'TAB-2-TST', variantLabel: 'Tobacco Amber 2ml Tester', availableStock: 2, message: 'Only 2 units available' },
        { type: 'low_stock', sku: 'SNT-2-TST', variantLabel: 'Santal Mystique 2ml Tester', availableStock: 3, message: 'Only 3 units available' },
      ]
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
