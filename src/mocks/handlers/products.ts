import { http, HttpResponse, delay } from 'msw'
import { MOCK_PRODUCTS, MOCK_SETTINGS } from '../seed'
import type { PricingPreview } from '@/types/api'

const latency = () => delay(Math.floor(Math.random() * 250) + 150)

// In-memory mutable products store
let products = [...MOCK_PRODUCTS]

export const productHandlers = [
  // GET /api/admin/products
  http.get('*/api/admin/products', async ({ request }) => {
    await latency()
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() ?? ''
    const brand = url.searchParams.get('brand') ?? ''
    const isActive = url.searchParams.get('isActive')

    let filtered = products
    if (search) filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search) || (p.brand ?? '').toLowerCase().includes(search)
    )
    if (brand) filtered = filtered.filter(p => p.brand === brand)
    if (isActive !== null) filtered = filtered.filter(p => String(p.isActive) === isActive)

    return HttpResponse.json({ data: filtered, total: filtered.length, page: 1, limit: 50, totalPages: 1 })
  }),

  // GET /api/admin/products/:id
  http.get('*/api/admin/products/:id', async ({ params }) => {
    await latency()
    const p = products.find(x => x._id === params.id || x.slug === params.id)
    if (!p) return HttpResponse.json({ message: 'Product not found' }, { status: 404 })
    return HttpResponse.json({ product: p })
  }),

  // POST /api/admin/products
  http.post('*/api/admin/products', async ({ request }) => {
    await latency()
    const body = await request.json() as any
    const newProduct = { ...body, _id: `prod_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    products = [newProduct, ...products]
    return HttpResponse.json({ product: newProduct }, { status: 201 })
  }),

  // PUT /api/admin/products/:id
  http.put('*/api/admin/products/:id', async ({ params, request }) => {
    await latency()
    const body = await request.json() as any
    products = products.map(p => p._id === params.id ? { ...p, ...body, updatedAt: new Date().toISOString() } : p)
    const updated = products.find(p => p._id === params.id)
    return HttpResponse.json({ product: updated })
  }),

  // PATCH /api/admin/products/:id
  http.patch('*/api/admin/products/:id', async ({ params, request }) => {
    await latency()
    const body = await request.json() as any
    products = products.map(p => p._id === params.id ? { ...p, ...body, updatedAt: new Date().toISOString() } : p)
    return HttpResponse.json({ product: products.find(p => p._id === params.id) })
  }),

  // POST /api/admin/products/:id/archive
  http.post('*/api/admin/products/:id/archive', async ({ params }) => {
    await latency()
    products = products.map(p => p._id === params.id ? { ...p, isActive: false } : p)
    return HttpResponse.json({ product: products.find(p => p._id === params.id) })
  }),

  // DELETE /api/admin/products/:id
  http.delete('*/api/admin/products/:id', async ({ params }) => {
    await latency()
    products = products.filter(p => p._id !== params.id)
    return HttpResponse.json({ ok: true })
  }),

  // POST /api/admin/pricing/preview
  http.post('*/api/admin/pricing/preview', async ({ request }) => {
    await delay(300)
    const body = await request.json() as { type: string; costPrice: number; minProfit: number }

    const s = MOCK_SETTINGS
    const k = 1 / (1 + s.gstRate) - s.gatewayFeeRate * (1 + s.gatewayFeeGstRate)
    const ceil = (v: number, step: number) => Math.ceil(v / step) * step

    const calcTotals = (qty: number, type: string) => {
      const C = body.costPrice * qty
      const P = body.minProfit * qty
      const slabs = type === 'bottle' ? qty : Math.ceil(qty / s.testersPerSlab)
      const D = slabs * s.deliveryPerSlab
      const grandTotal = ceil((C + P + D) / k, s.roundingStep)
      const gstAmount = Math.round(grandTotal * s.gstRate / (1 + s.gstRate))
      const gatewayFee = Math.round(grandTotal * s.gatewayFeeRate)
      const gatewayFeeGst = Math.round(gatewayFee * s.gatewayFeeGstRate)
      const totalCost = C + D
      const netProfit = grandTotal - gstAmount - gatewayFee - gatewayFeeGst - totalCost
      return { grandTotal, gstAmount, gatewayFee, gatewayFeeGst, rawDelivery: D, totalCost, netProfit }
    }

    const response: PricingPreview = {
      variant: { type: body.type as any, costPrice: body.costPrice, minProfit: body.minProfit },
      k,
      single: calcTotals(1, body.type),
    }

    if (body.type === 'tester') {
      const packTotals = calcTotals(s.testersPerSlab, body.type)
      response.pack = {
        qty: s.testersPerSlab,
        perUnit: Math.round(packTotals.grandTotal / s.testersPerSlab),
        ...packTotals,
      }
    }

    return HttpResponse.json(response)
  }),

  // POST /api/admin/uploads/signature — mock Cloudinary signature
  http.post('*/api/admin/uploads/signature', async () => {
    await delay(200)
    return HttpResponse.json({
      signature:      'mock_signature_for_dev',
      timestamp:      Math.floor(Date.now() / 1000),
      apiKey:         '542352522138948',
      cloudName:      'dlb8yyxsx',
      folder:         'snifftok/products',
      allowedFormats: 'jpg,jpeg,png,webp',
    })
  }),

  // POST /api/admin/uploads/discard
  http.post('*/api/admin/uploads/discard', async () => {
    await delay(100)
    return HttpResponse.json({ ok: true })
  }),

  // GET /api/admin/products/sku-check
  http.get('*/api/admin/products/sku-check', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const sku = url.searchParams.get('sku') ?? ''
    const products_flat = products.flatMap(p => p.variants.map(v => v.sku))
    return HttpResponse.json({ available: !products_flat.includes(sku.toUpperCase()) })
  }),
]
