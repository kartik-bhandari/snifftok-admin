import type { NotSellingItem, StockItem, StockStatus } from '@/types/api'

/** "50ml bottle" / "2ml decant" */
export const variantLabel = (i: { sizeMl: number | null; type: string | null }) =>
  i.sizeMl == null ? '' : `${i.sizeMl}ml ${i.type === 'tester' ? 'decant' : 'bottle'}`

/** "Never sold" / "Today" / "45 days ago" */
export function lastSoldText(i: Pick<NotSellingItem, 'daysSinceLastSale'>) {
  if (i.daysSinceLastSale == null) return 'Never sold'
  if (i.daysSinceLastSale === 0) return 'Today'
  return `${i.daysSinceLastSale} day${i.daysSinceLastSale === 1 ? '' : 's'} ago`
}

export const STATUS_LABEL: Record<StockStatus, string> = { out: 'Out of stock', low: 'Low stock', ok: 'In stock' }

/** Days of stock left at the last 30 days' sales rate */
export function coverText(i: Pick<StockItem, 'daysOfCover' | 'available'>) {
  if (i.available === 0) return '—'
  if (i.daysOfCover == null) return 'No recent sales'
  if (i.daysOfCover > 365) return '1 year+'
  return `${i.daysOfCover} day${i.daysOfCover === 1 ? '' : 's'}`
}

/**
 * Suggested quantity to reorder: enough for ~30 days at the recent sales rate,
 * and at least twice the reorder level, minus what's available. Minimum 1.
 */
export function suggestedReorder(i: Pick<StockItem, 'available' | 'reorderLevel' | 'sold30'>) {
  const target = Math.max(i.reorderLevel * 2, i.sold30)
  return Math.max(1, target - i.available)
}

export const REASON_LABEL: Record<string, string> = {
  purchase:             'Stock received',
  returned:             'Customer return',
  adjustment:           'Correction',
  web_order_reserved:   'Reserved (web order)',
  wa_order_reserved:    'Reserved (WhatsApp order)',
  order_confirmed:      'Order confirmed',
  reservation_released: 'Reservation released',
  cancelled:            'Order cancelled',
}
