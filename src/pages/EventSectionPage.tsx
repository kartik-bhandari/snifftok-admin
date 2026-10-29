import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowDown, ArrowUp, Check, Eye, EyeOff, Loader2, Megaphone, Package, Plus, Search, X,
} from 'lucide-react'
import { getProducts } from '@/api/products'
import { HttpError } from '@/api/client'
import { useEventSection, useSaveEventSection } from '@/hooks/useEventSection'
import { ErrorState } from '@/components/States'
import { CardSkeleton } from '@/components/Skeletons'
import { cn } from '@/lib/utils'
import { EVENT_SECTION_MAX_PRODUCTS, type EventSectionProduct } from '@/types/api'

interface Draft {
  title: string
  subtitle: string
  products: EventSectionProduct[]
}

const sameDraft = (a: Draft, b: Draft) =>
  a.title === b.title &&
  a.subtitle === b.subtitle &&
  a.products.map(p => p._id).join() === b.products.map(p => p._id).join()

export default function EventSectionPage() {
  const { data, isLoading, isError, error, refetch } = useEventSection()
  const save = useSaveEventSection()

  const saved: Draft | null = useMemo(
    () => (data ? { title: data.title, subtitle: data.subtitle, products: data.products } : null),
    [data],
  )
  const [draft, setDraft] = useState<Draft | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // Load the saved section into the form (and again after each save) —
  // reset during render when the saved data changes, no effect needed
  const [loadedFrom, setLoadedFrom] = useState<Draft | null>(null)
  if (saved && saved !== loadedFrom) {
    setLoadedFrom(saved)
    setDraft(saved)
  }

  const dirty = !!draft && !!saved && !sameDraft(draft, saved)

  const persist = async (enabled: boolean, successMessage: string) => {
    if (!draft) return
    setFieldErrors({})
    try {
      await save.mutateAsync({
        enabled,
        title:      draft.title.trim(),
        subtitle:   draft.subtitle.trim(),
        productIds: draft.products.map(p => p._id),
      })
      toast.success(successMessage)
    } catch (err) {
      if (err instanceof HttpError && err.errors) setFieldErrors(err.errors as unknown as Record<string, string[]>)
      toast.error((err as Error).message || 'Failed to save.')
    }
  }

  if (isError) {
    return (
      <Page>
        <div className="rounded-2xl border border-border bg-card">
          <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
        </div>
      </Page>
    )
  }

  if (isLoading || !draft || !data) {
    return (
      <Page>
        <CardSkeleton className="rounded-2xl" />
        <CardSkeleton className="rounded-2xl h-48" />
      </Page>
    )
  }

  const enabled  = data.enabled
  const full     = draft.products.length >= EVENT_SECTION_MAX_PRODUCTS
  const selected = new Set(draft.products.map(p => p._id))

  const move = (i: number, dir: -1 | 1) => setDraft(d => {
    if (!d) return d
    const products = [...d.products]
    ;[products[i], products[i + dir]] = [products[i + dir], products[i]]
    return { ...d, products }
  })
  const remove = (id: string) => setDraft(d => d && { ...d, products: d.products.filter(p => p._id !== id) })
  const add = (p: EventSectionProduct) => setDraft(d => d && { ...d, products: [...d.products, p] })

  return (
    <Page>
      {/* ── Visibility ─────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
        <div className={cn(
          'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
          enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-muted text-muted-foreground',
        )}>
          {enabled ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{enabled ? 'Live on the storefront' : 'Hidden from the storefront'}</p>
          <p className="text-xs text-muted-foreground">
            {enabled
              ? 'Shown on the home page. Turn it off when the event or offer ends.'
              : 'Turn it on for a festival, event or offer — your setup below is kept.'}
          </p>
        </div>
        <Switch
          checked={enabled}
          disabled={save.isPending}
          onChange={(on) => persist(on, on ? 'Event section is live.' : 'Event section hidden.')}
          label="Show event section on storefront"
        />
      </section>

      {/* ── Name ──────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <Field
          label="Section name"
          hint="Shown as the heading, e.g. Diwali Sale, Valentine's Picks, Monsoon Offer"
          value={draft.title}
          max={60}
          onChange={(title) => setDraft(d => d && { ...d, title })}
          error={fieldErrors.title?.[0]}
          placeholder="e.g. Diwali Sale"
        />
        <Field
          label="Subtitle (optional)"
          hint="A short line under the heading — the offer, dates or a code"
          value={draft.subtitle}
          max={140}
          onChange={(subtitle) => setDraft(d => d && { ...d, subtitle })}
          placeholder="e.g. Flat 15% off on these bottles till 5 Nov"
        />
      </section>

      {/* ── Products ──────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">Products</h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {draft.products.length} / {EVENT_SECTION_MAX_PRODUCTS}
          </span>
        </div>

        {fieldErrors.productIds?.[0] && (
          <p className="px-4 pt-3 text-xs text-destructive">{fieldErrors.productIds[0]}</p>
        )}

        {draft.products.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            No products yet — search below to add some.
          </p>
        ) : (
          <ol className="divide-y divide-border">
            {draft.products.map((p, i) => (
              <li key={p._id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-4 text-xs font-semibold text-muted-foreground tabular-nums">{i + 1}</span>
                <Thumb src={p.image} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.brand}
                    {!p.isActive && <span className="text-amber-600 dark:text-amber-400"> · Archived — won't show</span>}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-3.5 w-3.5" /></IconButton>
                  <IconButton label="Move down" disabled={i === draft.products.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-3.5 w-3.5" /></IconButton>
                  <IconButton label={`Remove ${p.name}`} onClick={() => remove(p._id)}><X className="h-3.5 w-3.5" /></IconButton>
                </div>
              </li>
            ))}
          </ol>
        )}

        <ProductPicker selected={selected} full={full} onAdd={add} />
      </section>

      {/* ── Save bar ──────────────────────────────────────────── */}
      {dirty && (
        <div className="sticky bottom-20 md:bottom-4 z-20 rounded-2xl border border-border bg-card shadow-lg p-3 flex items-center gap-3">
          <p className="flex-1 text-xs text-muted-foreground">
            Unsaved changes{enabled ? ' — they go live when you save.' : '.'}
          </p>
          <button
            onClick={() => saved && setDraft(saved)}
            disabled={save.isPending}
            className="text-xs font-medium px-3 py-2 rounded-lg hover:bg-accent disabled:opacity-50"
          >
            Discard
          </button>
          <button
            onClick={() => persist(enabled, 'Event section saved.')}
            disabled={save.isPending}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {save.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Save changes
          </button>
        </div>
      )}
    </Page>
  )
}

// ── Pieces ────────────────────────────────────────────────────────────────────

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="h-5 w-5" /> Event section
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          A highlighted row on the storefront home page for festivals, events and offers.
        </p>
      </div>
      {children}
    </div>
  )
}

function Switch({ checked, onChange, disabled, label }: {
  checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50',
        checked ? 'bg-emerald-600' : 'bg-muted-foreground/30',
      )}
    >
      <span className={cn(
        'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-6' : 'translate-x-1',
      )} />
    </button>
  )
}

function Field({ label, hint, value, max, onChange, error, placeholder }: {
  label: string; hint: string; value: string; max: number
  onChange: (v: string) => void; error?: string; placeholder?: string
}) {
  const id = label.toLowerCase().replace(/\W+/g, '-')
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <label htmlFor={id} className="text-xs font-semibold">{label}</label>
        <span className="text-[11px] text-muted-foreground tabular-nums">{value.length}/{max}</span>
      </div>
      <input
        id={id}
        value={value}
        maxLength={max}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={cn(
          'w-full px-3 py-2 rounded-lg border bg-background text-sm h-10 placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30',
          error ? 'border-destructive' : 'border-input',
        )}
      />
      <p className={cn('text-[11px] mt-1', error ? 'text-destructive' : 'text-muted-foreground')}>{error ?? hint}</p>
    </div>
  )
}

function Thumb({ src }: { src: string | null }) {
  return src ? (
    <img src={src} alt="" className="h-10 w-10 rounded-lg object-cover bg-muted shrink-0" />
  ) : (
    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
      <Package className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}

function IconButton({ label, onClick, disabled, children }: {
  label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:pointer-events-none"
    >
      {children}
    </button>
  )
}

/** Search active products and add them to the section */
function ProductPicker({ selected, full, onAdd }: {
  selected: Set<string>; full: boolean; onAdd: (p: EventSectionProduct) => void
}) {
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 250)
    return () => clearTimeout(t)
  }, [search])

  const { data, isFetching } = useQuery({
    queryKey: ['products', 'event-picker', debounced],
    queryFn:  () => getProducts({ search: debounced || undefined, status: 'active', limit: 20 }),
    placeholderData: prev => prev,
  })
  const results = data?.data ?? []

  return (
    <div className="border-t border-border bg-muted/30 p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products to add…"
          aria-label="Search products to add"
          className="w-full pl-9 pr-9 py-2 rounded-lg border border-input bg-background text-sm h-10 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {isFetching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {full && (
        <p className="text-xs text-muted-foreground mt-2">
          The section is full ({EVENT_SECTION_MAX_PRODUCTS} products). Remove one to add another.
        </p>
      )}

      <ul className="mt-3 space-y-1.5 max-h-72 overflow-y-auto">
        {results.length === 0 && !isFetching && (
          <li className="text-xs text-muted-foreground text-center py-4">No active products match.</li>
        )}
        {results.map(p => {
          const isIn = selected.has(p._id)
          return (
            <li key={p._id} className="flex items-center gap-3 rounded-xl bg-card border border-border px-3 py-2">
              <Thumb src={p.images?.[0]?.url ?? null} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.brand}</p>
              </div>
              <button
                type="button"
                disabled={isIn || full}
                onClick={() => onAdd({ _id: p._id, name: p.name, brand: p.brand, image: p.images?.[0]?.url ?? null, isActive: p.isActive })}
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0',
                  isIn ? 'text-emerald-700 dark:text-emerald-400' : 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40',
                )}
              >
                {isIn ? <><Check className="h-3.5 w-3.5" /> Added</> : <><Plus className="h-3.5 w-3.5" /> Add</>}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
