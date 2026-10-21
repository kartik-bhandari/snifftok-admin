import { apiFetch, apiPost, apiPut, apiDelete } from './client'
import type { Product, PaginatedResponse } from '@/types/api'

export interface ProductFilters {
  search?:   string
  category?: string
  type?:     'bottle' | 'tester' | ''
  stock?:    'in' | 'low' | 'out' | ''
  status?:   'active' | 'inactive' | ''
  page?:     number
  limit?:    number
}

export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v))
  })
  return apiFetch(`/api/admin/products?${params}`)
}

export async function getProduct(id: string): Promise<{ product: Product }> {
  return apiFetch(`/api/admin/products/${id}`)
}

export async function checkSku(sku: string, excludeProductId?: string): Promise<{ available: boolean }> {
  const params = new URLSearchParams({ sku })
  if (excludeProductId) params.set('excludeProductId', excludeProductId)
  return apiFetch(`/api/admin/products/sku-check?${params}`)
}

export async function createProduct(data: unknown): Promise<{ product: Product }> {
  return apiPost('/api/admin/products', data)
}

export async function updateProduct(id: string, data: unknown): Promise<{ product: Product }> {
  return apiPut(`/api/admin/products/${id}`, data)
}

export async function deleteProduct(id: string): Promise<{ ok: boolean }> {
  return apiDelete(`/api/admin/products/${id}`)
}

export async function archiveProduct(id: string): Promise<{ product: Product }> {
  return apiPost(`/api/admin/products/${id}/archive`, {})
}
