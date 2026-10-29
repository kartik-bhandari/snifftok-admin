import { http, HttpResponse, delay } from 'msw'
import type { Category } from '@/types/api'

const latency = () => delay(Math.floor(Math.random() * 150) + 100)

// Mirrors snifftok-api/src/data/scentFamilies.js
const created = '2026-01-01T00:00:00Z'
const categories: Category[] = [
  { _id: 'cat_floral',   name: 'Floral',   slug: 'floral',   sortOrder: 1, isActive: true, createdAt: created, smellsLike: 'Fresh-cut flowers, soft petals, and dewy or powdery bouquets.' },
  { _id: 'cat_amber',    name: 'Amber',    slug: 'amber',    sortOrder: 2, isActive: true, createdAt: created, aka: 'Formerly Oriental', smellsLike: 'Warm, opulent, sensual, and spicy notes with resinous depth.' },
  { _id: 'cat_woody',    name: 'Woody',    slug: 'woody',    sortOrder: 3, isActive: true, createdAt: created, smellsLike: 'Grounded, earthy, warm, and rich forest-floor elements.' },
  { _id: 'cat_fresh',    name: 'Fresh',    slug: 'fresh',    sortOrder: 4, isActive: true, createdAt: created, smellsLike: 'Clean, bright, crisp, and cooling energy.' },
  { _id: 'cat_gourmand', name: 'Gourmand', slug: 'gourmand', sortOrder: 5, isActive: true, createdAt: created, smellsLike: 'Edible, sweet, and dessert-like treats that evoke a culinary warmth.' },
]

export const categoryHandlers = [
  // GET /api/admin/categories — read-only, like the real API
  http.get('*/api/admin/categories', async () => {
    await latency()
    return HttpResponse.json({ categories })
  }),
]
