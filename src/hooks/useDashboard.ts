import { useQuery } from '@tanstack/react-query'
import { getAttention, getDashboardSummary } from '@/api/dashboard'
import type { DashboardPeriod } from '@/types/api'

export const DASHBOARD_KEY = 'dashboard'

export function useDashboardSummary(period: DashboardPeriod) {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'summary', period],
    queryFn:  () => getDashboardSummary(period),
    placeholderData: (prev) => prev,   // keep the old period on screen while switching
    staleTime: 30_000,
  })
}

export function useAttention() {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'attention'],
    queryFn:  getAttention,
    staleTime: 30_000,
  })
}
