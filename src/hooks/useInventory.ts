import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adjustStock, getMovements, getNotSelling, getStock } from '@/api/inventory'
import { DASHBOARD_KEY } from '@/hooks/useDashboard'
import { PRODUCTS_KEY } from '@/hooks/useProducts'
import type { NotSellingDays } from '@/types/api'

export const INVENTORY_KEY = 'inventory'

export function useStock() {
  return useQuery({
    queryKey: [INVENTORY_KEY, 'stock'],
    queryFn:  getStock,
    staleTime: 30_000,
  })
}

export function useNotSelling(days: NotSellingDays, limit?: number) {
  return useQuery({
    queryKey: [INVENTORY_KEY, 'not-selling', days, limit ?? 'all'],
    queryFn:  () => getNotSelling(days, limit),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  })
}

/** Stock ledger, newest first — "Load more" pages backwards */
export function useMovements(sku?: string) {
  return useInfiniteQuery({
    queryKey: [INVENTORY_KEY, 'movements', sku ?? 'all'],
    queryFn:  ({ pageParam }) => getMovements({ sku, before: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextBefore ?? undefined,
  })
}

/** Stock changes ripple into the stock table, reports, ledger, products and dashboard */
export function useAdjustStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [INVENTORY_KEY] })
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] })
      qc.invalidateQueries({ queryKey: [DASHBOARD_KEY] })
    },
  })
}
