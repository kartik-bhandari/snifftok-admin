import { http, HttpResponse, delay } from 'msw'
import type { Category } from '@/types/api'

const latency = () => delay(Math.floor(Math.random() * 150) + 100)

let categories: Category[] = [
  { _id: 'cat_men',     name: 'Men',                slug: 'men',                isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { _id: 'cat_women',   name: 'Women',              slug: 'women',              isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { _id: 'cat_unisex',  name: 'Unisex',             slug: 'unisex',             isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { _id: 'cat_oud',     name: 'Oud',                slug: 'oud',                isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { _id: 'cat_attar',   name: 'Attar',              slug: 'attar',              isActive: true, createdAt: '2024-01-01T00:00:00Z' },
  { _id: 'cat_arabic',  name: 'Arabic Fragrances',  slug: 'arabic-fragrances',  isActive: true, createdAt: '2024-01-01T00:00:00Z' },
]

export const categoryHandlers = [
  // GET /api/admin/categories
  http.get('*/api/admin/categories', async () => {
    await latency()
    return HttpResponse.json({ categories })
  }),

  // POST /api/admin/categories
  http.post('*/api/admin/categories', async ({ request }) => {
    await latency()
    const body = await request.json() as { name: string }
    const newCat: Category = {
      _id:       `cat_${Date.now()}`,
      name:      body.name,
      slug:      body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      isActive:  true,
      createdAt: new Date().toISOString(),
    }
    categories = [...categories, newCat]
    return HttpResponse.json({ category: newCat }, { status: 201 })
  }),
]
