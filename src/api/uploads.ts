import { apiFetch, apiPost } from './client'
import type { PricingPreview } from '@/types/api'

export interface UploadSignature {
  signature:      string
  timestamp:      number
  apiKey:         string
  cloudName:      string
  folder:         string
  allowedFormats: string
}

export interface PricingPreviewRequest {
  type:      'bottle' | 'tester'
  costPrice: number   // paise
  minProfit: number   // paise
}

export async function getUploadSignature(folder?: string): Promise<UploadSignature> {
  return apiPost('/api/admin/uploads/signature', { folder: folder ?? 'snifftok/products' })
}

export async function discardImages(publicIds: string[]): Promise<{ ok: boolean }> {
  return apiPost('/api/admin/uploads/discard', { publicIds })
}

export async function getPricingPreview(data: PricingPreviewRequest): Promise<PricingPreview> {
  return apiPost<PricingPreview>('/api/admin/pricing/preview', data)
}
