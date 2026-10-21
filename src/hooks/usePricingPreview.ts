import { useQuery } from '@tanstack/react-query'
import { getPricingPreview } from '@/api/uploads'
import type { PricingPreviewRequest } from '@/api/uploads'
import { HttpError } from '@/api/client'

/**
 * Live pricing preview — debouncing is done in PricingPreviewCard via useEffect.
 * Pass null params to disable the query.
 *
 * 401/403 errors are swallowed so the card stays hidden (not broken)
 * when the real API is unreachable or the session has expired.
 */
export function usePricingPreview(params: PricingPreviewRequest | null) {
  return useQuery({
    queryKey:  ['pricing-preview', params],
    queryFn:   async () => {
      try {
        return await getPricingPreview(params!)
      } catch (err) {
        // Auth / permission errors — silently disable the preview
        if (err instanceof HttpError && (err.status === 401 || err.status === 403)) return null
        throw err  // re-throw other errors so isError shows
      }
    },
    enabled:   !!(params?.costPrice && params.costPrice > 0),
    staleTime: 0,
    retry:     false,
  })
}
