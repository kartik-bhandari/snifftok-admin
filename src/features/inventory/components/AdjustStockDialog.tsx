import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAdjustStock } from '@/hooks/useInventory'
import { cn } from '@/lib/utils'
import { variantLabel } from '@/features/inventory/format'
import { Segmented, Thumb } from './parts'
import type { AdjustReason, StockItem } from '@/types/api'

export interface AdjustTarget {
  item: StockItem
  reason?: AdjustReason
  qty?: number
}

/**
 * Record stock received, a customer return, or a correction (±, needs a note).
 * The parent remounts this per target (key), so each opening starts fresh.
 */
export function AdjustStockDialog({ target, onClose }: { target: AdjustTarget | null; onClose: () => void }) {
  return (
    <Dialog open={!!target} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md">
        {target && <AdjustForm key={target.item.variantId} target={target} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function AdjustForm({ target, onDone }: { target: AdjustTarget; onDone: () => void }) {
  const { item } = target
  const [reason, setReason]       = useState<AdjustReason>(target.reason ?? 'purchase')
  const [direction, setDirection] = useState<'add' | 'remove'>('add')
  const [qty, setQty]             = useState(String(target.qty ?? ''))
  const [note, setNote]           = useState('')
  const adjust = useAdjustStock()

  const n       = Math.max(0, Math.floor(Number(qty) || 0))
  const delta   = reason === 'adjustment' && direction === 'remove' ? -n : n
  const next    = item.stock + delta
  const tooMany = next < item.reserved
  const needsNote = reason === 'adjustment' && !note.trim()
  const canSubmit = n > 0 && !tooMany && !needsNote && !adjust.isPending

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    try {
      const res = await adjust.mutateAsync({ sku: item.sku, delta, reason, note: note.trim() || undefined })
      toast.success(`${item.name} (${variantLabel(item)}) — ${res.available} available now`)
      onDone()
    } catch (err) {
      toast.error((err as Error).message || 'Failed to update stock.')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Adjust stock</DialogTitle>
        <DialogDescription className="sr-only">Record stock received, a return or a correction</DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
        <Thumb src={item.image} />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground">{variantLabel(item)} · <span className="font-mono">{item.sku}</span></p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold">What happened?</p>
        <Segmented<AdjustReason>
          label="Reason"
          value={reason}
          onChange={setReason}
          options={[
            { value: 'purchase',   label: 'Stock received' },
            { value: 'returned',   label: 'Customer return' },
            { value: 'adjustment', label: 'Correction' },
          ]}
        />
      </div>

      {reason === 'adjustment' && (
        <Segmented<'add' | 'remove'>
          label="Direction"
          value={direction}
          onChange={setDirection}
          options={[{ value: 'add', label: '+ Add' }, { value: 'remove', label: '− Remove' }]}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-xs font-semibold">Quantity</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            autoFocus
            value={qty}
            onChange={e => setQty(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <div className="space-y-1">
          <span className="text-xs font-semibold">Result</span>
          <p className={cn('h-10 flex items-center gap-1.5 text-sm tabular-nums', tooMany && 'text-destructive')}>
            {item.stock} <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /> <span className="font-semibold">{next}</span>
            <span className="text-xs text-muted-foreground">in stock</span>
          </p>
        </div>
      </div>

      {item.reserved > 0 && (
        <p className="text-xs text-muted-foreground -mt-2">{item.reserved} reserved for open orders · {Math.max(0, next - item.reserved)} would be available</p>
      )}
      {tooMany && (
        <p className="text-xs text-destructive -mt-2">
          {item.reserved > 0 ? `Can't go below ${item.reserved} — reserved for open orders.` : `Only ${item.stock} in stock.`}
        </p>
      )}

      <label className="block space-y-1">
        <span className="text-xs font-semibold">Note {reason === 'adjustment' ? '(required)' : '(optional)'}</span>
        <input
          value={note}
          maxLength={500}
          onChange={e => setNote(e.target.value)}
          placeholder={reason === 'purchase' ? 'e.g. Invoice #1042 from supplier' : reason === 'returned' ? 'e.g. Order ORD-…, unopened' : 'e.g. Recount, broken bottle'}
          className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </label>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onDone} className="text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent">Cancel</button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
        >
          {adjust.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </button>
      </div>
    </form>
  )
}
