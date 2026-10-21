import { apiFetch, apiPost } from './client'
import type { Category } from '@/types/api'

export async function getCategories(): Promise<{ categories: Category[] }> {
  return apiFetch('/api/admin/categories')
}

export async function createCategory(name: string): Promise<{ category: Category }> {
  return apiPost('/api/admin/categories', { name })
}
