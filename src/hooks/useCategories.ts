import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/api/categories'

export const CATEGORIES_KEY = 'categories'

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn:  getCategories,
    staleTime: 5 * 60 * 1000,   // categories rarely change
  })
}
