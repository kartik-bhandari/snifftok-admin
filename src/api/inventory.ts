import { apiFetch, apiPost } from './client'
import type {
  AdjustStockRequest, MovementsResponse, NotSellingDays, NotSellingResponse, StockResponse,
} from '@/types/api'

export function getStock(): Promise<StockResponse> {
  return apiFetch<StockResponse>('/api/admin/inventory/stock')
}

export function getNotSelling(days: NotSellingDays, limit?: number): Promise<NotSellingResponse> {
  const qs = new URLSearchParams({ days: String(days), ...(limit ? { limit: String(limit) } : {}) })
  return apiFetch<NotSellingResponse>(`/api/admin/inventory/not-selling?${qs}`)
}

export function adjustStock(data: AdjustStockRequest): Promise<{ sku: string; stock: number; available: number }> {
  return apiPost('/api/admin/inventory/adjust', data)
}

export function getMovements(params: { sku?: string; before?: string; limit?: number } = {}): Promise<MovementsResponse> {
  const qs = new URLSearchParams()
  if (params.sku)    qs.set('sku', params.sku)
  if (params.before) qs.set('before', params.before)
  qs.set('limit', String(params.limit ?? 50))
  return apiFetch<MovementsResponse>(`/api/admin/inventory/movements?${qs}`)
}
