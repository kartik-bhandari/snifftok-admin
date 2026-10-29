import { apiFetch } from './client'
import type { Category } from '@/types/api'

/** The 5 scent families — read-only, managed by the API's seed:categories script */
export async function getCategories(): Promise<{ categories: Category[] }> {
  return apiFetch('/api/admin/categories')
}
