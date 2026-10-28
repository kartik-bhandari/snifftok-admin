// Shared utility — format paise as Indian Rupee string
// RULE: All money from the API is integer paise. This is the ONLY place /100 happens.
// Use this everywhere — never divide by 100 or call Intl directly outside this file.

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

/**
 * Format integer paise → "₹1,23,456"
 * @param paise integer paise from API
 */
export function formatMoney(paise: number): string {
  return formatter.format(paise / 100)
}

const compactFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

/**
 * Short form for chart axes — 1234500 → "₹12.3K", 250000000 → "₹25L"
 */
export function formatMoneyCompact(paise: number): string {
  return compactFormatter.format(paise / 100)
}

/**
 * Format with explicit sign — for profit/loss displays
 * e.g.  30013 → "+₹300"   -5000 → "-₹50"
 */
export function formatMoneyWithSign(paise: number): string {
  const abs = formatMoney(Math.abs(paise))
  return paise >= 0 ? `+${abs}` : `-${abs}`
}

/**
 * Parse a rupee string or number back to paise (for form inputs).
 * "2000" → 200000,  2000 → 200000
 */
export function rupeesToPaise(rupees: string | number): number {
  const n = typeof rupees === 'string' ? parseFloat(rupees.replace(/[^0-9.]/g, '')) : rupees
  return Math.round(n * 100)
}

/**
 * Format paise as a plain rupee number string for inputs — "₹2,000" → "2000"
 */
export function paiseToRupeeInput(paise: number): string {
  return (paise / 100).toFixed(0)
}
