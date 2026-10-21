import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCategories, createCategory } from '@/api/categories'
import { toast } from 'sonner'

export const CATEGORIES_KEY = 'categories'

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn:  getCategories,
    staleTime: 5 * 60 * 1000,   // categories rarely change
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] })
      toast.success('Category created.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create category.')
    },
  })
}
