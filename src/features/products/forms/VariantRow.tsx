import { useEffect, useRef } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Trash2, ChevronDown } from 'lucide-react'
import { checkSku } from '@/api/products'
import { PricingPreviewCard } from '../components/PricingPreviewCard'
import { useRole } from '@/hooks/useRole'
import { cn } from '@/lib/utils'

interface Props {
  index:           number
  onRemove:        () => void
  canRemove:       boolean
  productId?:      string   // for SKU uniqueness check on edit
  stockChanged?:   boolean
  onStockChange?:  () => void
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
    </div>
  )
}

const inputCls = (err?: string) => cn(
  'w-full px-3 py-2 rounded-lg border text-sm h-10 bg-background focus:outline-none focus:ring-1 focus:ring-primary',
  err ? 'border-destructive' : 'border-input',
)

export function VariantRow({ index, onRemove, canRemove, productId }: Props) {
  const { register, control, setValue, watch, formState: { errors } } = useFormContext()
  const { canSeeCosts } = useRole()
  const variantErrors  = (errors.variants as any)?.[index] ?? {}

  // Auto-generate SKU from name + type + size
  const name    = watch('name')
  const type    = watch(`variants.${index}.type`)
  const sizeMl  = watch(`variants.${index}.sizeMl`)
  const skuVal  = watch(`variants.${index}.sku`)
  const skuRef  = useRef<string>('')

  useEffect(() => {
    if (name && type && sizeMl) {
      const auto = `${name.replace(/\s+/g, '-').toUpperCase().slice(0, 20)}-${type.toUpperCase().slice(0, 3)}-${sizeMl}ML`
      // Only auto-fill if SKU is still at the auto-generated value or empty
      if (!skuVal || skuVal === skuRef.current) {
        setValue(`variants.${index}.sku`, auto, { shouldValidate: false })
        skuRef.current = auto
      }
    }
  }, [name, type, sizeMl])  // eslint-disable-line

  // SKU uniqueness check on blur
  const handleSkuBlur = async (sku: string) => {
    if (!sku) return
    try {
      const { available } = await checkSku(sku, productId)
      if (!available) {
        // inject error manually
        ;(errors.variants as any) ??= {}
      }
    } catch {}
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Variant {index + 1}</h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Type + Size */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type" error={variantErrors.type?.message}>
          <Controller
            name={`variants.${index}.type`}
            control={control}
            render={({ field }) => (
              <div className="flex rounded-lg border border-input overflow-hidden h-10">
                {['bottle', 'tester'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => field.onChange(t)}
                    className={cn(
                      'flex-1 text-sm font-medium capitalize transition-colors',
                      field.value === t
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          />
        </Field>

        <Field label="Size (ml)" error={variantErrors.sizeMl?.message}>
          <input
            {...register(`variants.${index}.sizeMl`)}
            type="number"
            min={1}
            placeholder="100"
            className={inputCls(variantErrors.sizeMl?.message)}
          />
        </Field>
      </div>

      {/* SKU */}
      <Field label="SKU" error={variantErrors.sku?.message}>
        <input
          {...register(`variants.${index}.sku`, {
            onBlur: e => handleSkuBlur(e.target.value),
          })}
          type="text"
          placeholder="AUTO-GENERATED"
          className={inputCls(variantErrors.sku?.message)}
        />
      </Field>

      {/* Cost + Profit (admin only) */}
      {canSeeCosts && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Purchase cost (₹)" error={variantErrors.costPrice?.message}>
            <input
              {...register(`variants.${index}.costPrice`)}
              type="number"
              min={0}
              step={0.01}
              placeholder="e.g. 2000"
              className={inputCls(variantErrors.costPrice?.message)}
            />
          </Field>

          <Field label="Min profit (₹)" error={variantErrors.minProfit?.message}>
            <input
              {...register(`variants.${index}.minProfit`)}
              type="number"
              min={0}
              step={0.01}
              placeholder="300"
              className={inputCls(variantErrors.minProfit?.message)}
            />
          </Field>
        </div>
      )}

      {/* Stock + Reorder */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Stock qty" error={variantErrors.stock?.message}>
          <input
            {...register(`variants.${index}.stock`)}
            type="number"
            min={0}
            step={1}
            className={inputCls(variantErrors.stock?.message)}
          />
        </Field>

        <Field label="Reorder level" error={variantErrors.reorderLevel?.message}>
          <input
            {...register(`variants.${index}.reorderLevel`)}
            type="number"
            min={0}
            className={inputCls(variantErrors.reorderLevel?.message)}
          />
        </Field>
      </div>

      {/* Live pricing preview (admin only) */}
      {canSeeCosts && <PricingPreviewCard index={index} />}
    </div>
  )
}
