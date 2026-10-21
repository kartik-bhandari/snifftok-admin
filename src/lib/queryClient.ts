import { QueryClient } from '@tanstack/react-query'
import { HttpError } from '@/api/client'

const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL ?? 'http://localhost:3000'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // 30 seconds
      retry: (failureCount, error) => {
        // Never retry 401 / 403 — just fail fast
        if (error instanceof HttpError && (error.status === 401 || error.status === 403)) return false
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
      onError: (error: unknown) => {
        if (error instanceof HttpError && error.status === 401) {
          window.location.assign(`${STOREFRONT_URL}/login`)
        }
      },
    },
  },
})

