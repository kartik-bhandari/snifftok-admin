import { useState, useEffect, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { usePricingPreview } from '@/hooks/usePricingPreview'
import { Loader2, TrendingUp, Package, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const fmt = (paise: number) =>
  `₹${Math.round(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

interface Props {
  index: number
}

export function PricingPreviewCard({ index }: Props) {
  const { control } = useFormContext()
  const type      = useWatch({ control, name: `variants.${index}.type` })
  const costPrice = useWatch({ control, name: `variants.${index}.costPrice` })
  const minProfit = useWatch({ control, name: `variants.${index}.minProfit` })

  // Debounce 400ms
  const [debouncedParams, setDebouncedParams] = useState<any>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const cp = parseFloat(String(costPrice)) * 100
    const mp = parseFloat(String(minProfit)) * 100
    if (isNaN(cp) || cp <= 0) { setDebouncedParams(null); return }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setDebouncedParams({ type, costPrice: Math.round(cp), minProfit: Math.round(mp || 0) })
    }, 400)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [type, costPrice, minProfit])

  const { data, isLoading, isError } = usePricingPreview(debouncedParams)

  if (!debouncedParams) return null

  // data===null means auth error was silenced — just hide the card
  if (!isLoading && !isError && data === null) return null

  return (
    <div className={cn(
      'mt-3 rounded-xl border p-4 text-sm',
      isError ? 'border-destructive/40 bg-destructive/5' : 'border-border bg-muted/50',
    )}>
      <div className="flex items-center gap-2 mb-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
        <TrendingUp className="h-3.5 w-3.5" />
        Live Price Preview
        {isLoading && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
      </div>

      {isError && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Failed to compute price. Check cost and profit values.
        </p>
      )}

      {data && !isError && (
        <>
          {/* Single unit */}
          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between text-muted-foreground">
              <span>Purchase cost</span>
              <span>{fmt(data.variant.costPrice)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Min profit</span>
              <span>{fmt(data.variant.minProfit)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery (est.)</span>
              <span>{fmt(data.single.rawDelivery)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST (18%)</span>
              <span>{fmt(data.single.gstAmount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Gateway fee</span>
              <span>{fmt(data.single.gatewayFee + data.single.gatewayFeeGst)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
              <span className="flex items-center gap-1">
                <Package className="h-4 w-4" /> Selling price
              </span>
              <span className="text-primary">{fmt(data.single.grandTotal)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Net profit: <span className="text-emerald-600 font-medium">{fmt(data.single.netProfit)}</span>
            </p>
          </div>

          {/* Tester pack */}
          {data.pack && (
            <div className="border-t pt-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">
                {data.pack.qty}× tester pack
              </p>
              <div className="flex justify-between font-bold">
                <span>Pack price</span>
                <span>{fmt(data.pack.grandTotal)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                ≈ {fmt(data.pack.perUnit)} per tester
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
