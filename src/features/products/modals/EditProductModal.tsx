import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { ProductForm } from '../forms/ProductForm'
import { useUpdateProduct, useProduct } from '@/hooks/useProducts'
import type { ProductFormValues } from '../forms/productSchema'
import { Loader2, RefreshCw } from 'lucide-react'

interface Props {
  productId: string
  open:      boolean
  onClose:   () => void
}

export function EditProductModal({ productId, open, onClose }: Props) {
  const isMobile  = useMediaQuery('(max-width: 639px)')
  const { data, isLoading, isError, refetch } = useProduct(productId)
  const updateMut = useUpdateProduct(productId)
  const [conflictError, setConflictError] = useState<string | null>(null)

  const product = data?.product

  const handleSubmit = async (values: ProductFormValues, images: any[]) => {
    setConflictError(null)
    try {
      await updateMut.mutateAsync({
        ...values,
        __v:    (product as any)?.__v,
        images: images.map((img, i) => ({
          url:      img.url,
          publicId: img.publicId,
          width:    img.width,
          height:   img.height,
          order:    i,
        })),
      })
      onClose()
    } catch (err: any) {
      if (err?.status === 409 || err?.message?.includes('changed elsewhere')) {
        setConflictError('This product was changed elsewhere. Please reload and try again.')
      }
    }
  }

  const inner = isLoading ? (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ) : isError ? (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-sm text-muted-foreground">Failed to load product.</p>
      <button onClick={() => refetch()} className="flex items-center gap-2 text-sm text-primary">
        <RefreshCw className="h-4 w-4" /> Retry
      </button>
    </div>
  ) : (
    <>
      {conflictError && (
        <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-3">
          {conflictError}
          <button
            type="button"
            onClick={() => { setConflictError(null); refetch() }}
            className="flex items-center gap-1 text-xs font-medium underline"
          >
            <RefreshCw className="h-3 w-3" /> Reload
          </button>
        </div>
      )}
      <ProductForm
        mode="edit"
        product={product}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={updateMut.isPending}
      />
    </>
  )

  const title = product ? `Edit — ${product.name}` : 'Edit Product'

  if (isMobile) {
    return (
      // dismissible={false}: no accidental close from tapping overlay or dragging
      <Sheet open={open} onOpenChange={() => {}} dismissible={false}>
        <SheetContent
          title={title}
          onClose={onClose}
        >
          <div className="px-4 pt-2 pb-6">
            {inner}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {inner}
      </DialogContent>
    </Dialog>
  )
}
