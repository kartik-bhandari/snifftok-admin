import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
      // dismissible={false}: overlay taps and drags do NOT close the sheet.
      // The user must use the ✕ button or the Cancel / Create buttons inside the form.
      <Sheet open={open} onOpenChange={() => {}} dismissible={false}>
        <SheetContent
          title="Create Product"
          onClose={onClose}
        >
          <div className="px-4 pt-2 pb-6">
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
