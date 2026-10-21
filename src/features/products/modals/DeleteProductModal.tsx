import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { AlertTriangle, Loader2, Archive } from 'lucide-react'
import { useDeleteProduct, useArchiveProduct } from '@/hooks/useProducts'
import type { Product } from '@/types/api'

interface Props {
  product: Product | null
  open:    boolean
  onClose: () => void
}

export function DeleteProductModal({ product, open, onClose }: Props) {
  const deleteMut  = useDeleteProduct()
  const archiveMut = useArchiveProduct()
  const [canArchive, setCanArchive] = useState(false)
  const [blockMsg,   setBlockMsg]   = useState<string | null>(null)

  if (!product) return null

  const handleDelete = async () => {
    setBlockMsg(null)
    setCanArchive(false)
    try {
      await deleteMut.mutateAsync(product._id)
      onClose()
    } catch (err: any) {
      if (err?.canArchive) {
        setBlockMsg(err.message ?? 'This product has open orders and cannot be deleted.')
        setCanArchive(true)
      }
    }
  }

  const handleArchive = async () => {
    await archiveMut.mutateAsync(product._id)
    onClose()
  }

  const isLoading = deleteMut.isPending || archiveMut.isPending

  return (
    <Dialog open={open} onOpenChange={v => !v && !isLoading && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Delete "{product.name}"?</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            This will permanently remove the product, all its variants, and its
            images from Cloudinary. <strong>This cannot be undone.</strong> Past
            orders will keep their own snapshots and are unaffected.
          </DialogDescription>
        </DialogHeader>

        {blockMsg && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            {blockMsg}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-input text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          {canArchive && (
            <button
              type="button"
              onClick={handleArchive}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {archiveMut.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Archive className="h-4 w-4" />
              }
              Archive instead
            </button>
          )}

          {!canArchive && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleteMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete product
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
