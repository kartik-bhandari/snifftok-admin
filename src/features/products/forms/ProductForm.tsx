import { useEffect } from 'react'
import { useForm, FormProvider, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { productSchema, type ProductFormValues, DEFAULT_VARIANT } from './productSchema'
import { VariantRow } from './VariantRow'
import { ImageUploader } from '../components/ImageUploader'
import { CategorySelect } from '../components/CategorySelect'
import { TagInput } from '../components/TagInput'
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload'
import { discardImages } from '@/api/uploads'
import type { Product } from '@/types/api'
import { cn } from '@/lib/utils'

interface Props {
  mode:           'create' | 'edit'
  product?:       Product
  onSubmit:       (values: ProductFormValues, images: any[]) => Promise<void>
  onCancel:       () => void
  isSubmitting:   boolean
  stockNote?:     string
  onStockNote?:   (note: string) => void
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pt-2">
      {children}
    </p>
  )
}

function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
    </div>
  )
}

const inputCls = (err?: string) => cn(
  'w-full px-3 py-2 rounded-lg border text-sm h-10 bg-background focus:outline-none focus:ring-1 focus:ring-primary',
  err ? 'border-destructive' : 'border-input',
)

export function ProductForm({ mode, product, onSubmit, onCancel, isSubmitting }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: product
      ? {
          name:          product.name,
          brand:         product.brand ?? '',
          categoryId:    (product.categoryId as any)?._id ?? (product.categoryId as string) ?? '',
          description:   product.description ?? '',
          notes:         product.notes ?? { top: [], heart: [], base: [] },
          concentration: product.concentration ?? '',
          origin:        product.origin ?? '',
          tags:          product.tags ?? [],
          isActive:      product.isActive ?? true,
          variants:      product.variants?.map(v => ({
            ...v,
            _id:       v._id?.toString(),
            costPrice: ((v as any).costPrice ?? 0) / 100 as any,
            minProfit: ((v as any).minProfit ?? 0) / 100 as any,
          })) ?? [DEFAULT_VARIANT],
        }
      : {
          name:        '',
          brand:       '',
          categoryId:  '',
          description: '',
          notes:       { top: [], heart: [], base: [] },
          tags:        [],
          isActive:    true,
          variants:    [{ ...DEFAULT_VARIANT }],
        },
  })

  const { register, control, watch, setValue, handleSubmit, formState: { errors, isDirty } } = methods
  const { fields: variantFields, append, remove } = useFieldArray({ control, name: 'variants' })
  const isActive = watch('isActive')

  // Image upload state
  const upload = useCloudinaryUpload()

  // Prefill existing images in edit mode
  useEffect(() => {
    if (mode === 'edit' && product?.images?.length) {
      upload.setExistingImages(
        [...product.images]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((img, i) => ({
            url:      img.url,
            publicId: img.publicId,
            width:    img.width,
            height:   img.height,
            order:    i,
            localId:  img.publicId,
          }))
      )
    }
  }, [mode, product])  // eslint-disable-line

  const handleCancel = async () => {
    // Discard orphaned images (uploaded but removed from form)
    const orphans = upload.getPublicIdsForDiscard()
    if (orphans.length > 0) {
      discardImages(orphans).catch(console.error)
    }
    onCancel()
  }

  const handleFormSubmit = async (values: ProductFormValues) => {
    if (upload.validImages.length === 0) {
      methods.setError('root', { message: 'At least one image is required.' })
      return
    }
    await onSubmit(values, upload.validImages)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">

        {/* ── Images ──────────────────────────────────────────────── */}
        <div>
          <SectionLabel>Images</SectionLabel>
          <ImageUploader
            images={upload.images}
            isUploading={upload.isUploading}
            onAdd={upload.addFiles}
            onRemove={upload.removeImage}
            onReorder={upload.reorderImages}
            error={errors.root?.message}
          />
        </div>

        {/* ── Basic info ──────────────────────────────────────────── */}
        <SectionLabel>Product info</SectionLabel>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required error={errors.name?.message}>
            <input {...register('name')} className={inputCls(errors.name?.message)} placeholder="e.g. Santal Velvet" />
          </Field>
          <Field label="Brand" error={errors.brand?.message}>
            <input {...register('brand')} className={inputCls(errors.brand?.message)} placeholder="e.g. Maison Margiela" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" required error={errors.categoryId?.message}>
            <CategorySelect />
          </Field>
          <Field label="Concentration" error={errors.concentration?.message}>
            <input {...register('concentration')} className={inputCls()} placeholder="e.g. EDP, EDT, Parfum" />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Describe the fragrance…"
            className="w-full px-3 py-2 rounded-lg border border-input text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </Field>

        {/* ── Notes ───────────────────────────────────────────────── */}
        <SectionLabel>Fragrance notes</SectionLabel>
        <div className="space-y-3">
          {(['top', 'heart', 'base'] as const).map(note => (
            <TagInput
              key={note}
              label={`${note.charAt(0).toUpperCase() + note.slice(1)} notes`}
              value={watch(`notes.${note}`) ?? []}
              onChange={v => setValue(`notes.${note}`, v)}
            />
          ))}
        </div>

        {/* ── Origin + Tags + Active ───────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Origin">
            <input {...register('origin')} className={inputCls()} placeholder="e.g. France" />
          </Field>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Tags</label>
            <div className="flex gap-2 flex-wrap">
              {(['trending', 'best-seller', 'new'] as const).map(tag => {
                const current = watch('tags') ?? []
                const active  = current.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setValue('tags', active ? current.filter(t => t !== tag) : [...current, tag])}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                      active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:bg-accent',
                    )}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
          <div>
            <p className="text-sm font-medium">Active</p>
            <p className="text-xs text-muted-foreground">Visible to customers on the storefront</p>
          </div>
          <button
            type="button"
            onClick={() => setValue('isActive', !isActive)}
            className="text-primary"
          >
            {isActive
              ? <ToggleRight className="h-8 w-8" />
              : <ToggleLeft className="h-8 w-8 text-muted-foreground" />
            }
          </button>
        </div>

        {/* ── Variants ─────────────────────────────────────────────── */}
        <SectionLabel>Variants</SectionLabel>
        {(errors.variants as any)?.root?.message && (
          <p className="text-xs text-destructive">{(errors.variants as any).root.message}</p>
        )}
        <div className="space-y-3">
          {variantFields.map((field, i) => (
            <VariantRow
              key={field.id}
              index={i}
              onRemove={() => remove(i)}
              canRemove={variantFields.length > 1}
              productId={product?._id}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => append({ ...DEFAULT_VARIANT } as any)}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Plus className="h-4 w-4" /> Add variant
        </button>

        {/* ── Footer ───────────────────────────────────────────────── */}
        {/* sticky: always visible even when keyboard is open on mobile */}
        <div className="sticky bottom-0 bg-background flex gap-3 pt-4 pb-4 border-t mt-2 -mx-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting || upload.isUploading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-input text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || upload.isUploading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {(isSubmitting || upload.isUploading) && (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {mode === 'create' ? 'Create product' : 'Save changes'}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}
