import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProductFilters } from '@/api/products'
import {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, archiveProduct,
} from '@/api/products'
import { toast } from 'sonner'

export const PRODUCTS_KEY = 'products'

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, filters],
    queryFn:  () => getProducts(filters),
    placeholderData: (prev) => prev,   // keep stale data while refetching
  })
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, id],
    queryFn:  () => getProduct(id!),
    enabled:  !!id,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] })
      toast.success('Product created successfully.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create product.')
    },
  })
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => updateProduct(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] })
      toast.success('Product updated successfully.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update product.')
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] })
      toast.success('Product deleted.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete product.')
    },
  })
}

export function useArchiveProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: archiveProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] })
      toast.success('Product archived.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to archive product.')
    },
  })
}
