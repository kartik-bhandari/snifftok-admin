import { apiFetch } from './client'
import type { AttentionItem, DashboardPeriod, DashboardSummary } from '@/types/api'

export function getDashboardSummary(period: DashboardPeriod): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>(`/api/admin/dashboard/summary?period=${period}`)
}

export function getAttention(): Promise<{ items: AttentionItem[] }> {
  return apiFetch<{ items: AttentionItem[] }>('/api/admin/dashboard/attention')
}
