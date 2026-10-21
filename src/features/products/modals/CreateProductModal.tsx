import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { ProductForm } from '../forms/ProductForm'
import { useCreateProduct } from '@/hooks/useProducts'
import type { ProductFormValues } from '../forms/productSchema'

interface Props {
  open:    boolean
  onClose: () => void
}

export function CreateProductModal({ open, onClose }: Props) {
  const isMobile  = useMediaQuery('(max-width: 639px)')
  const createMut = useCreateProduct()

  const handleSubmit = async (values: ProductFormValues, images: any[]) => {
    await createMut.mutateAsync({
      ...values,
      images: images.map((img, i) => ({
        url:      img.url,
        publicId: img.publicId,
        width:    img.width,
        height:   img.height,
        order:    i,
      })),
    })
    onClose()
  }

  const content = (
    <ProductForm
      mode="create"
      onSubmit={handleSubmit}
      onCancel={onClose}
      isSubmitting={createMut.isPending}
    />
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(v: boolean) => !v && onClose()}>
        <SheetContent side="bottom" className="h-[92dvh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Create Product</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
