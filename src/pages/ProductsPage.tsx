import { useState, useCallback } from 'react'
import { Search, Plus, Filter, Package, RefreshCw, MoreVertical, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { CreateProductModal } from '@/features/products/modals/CreateProductModal'
import { EditProductModal } from '@/features/products/modals/EditProductModal'
import { DeleteProductModal } from '@/features/products/modals/DeleteProductModal'
import { useRole } from '@/hooks/useRole'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/api'
import type { ProductFilters } from '@/api/products'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (paise: number) =>
  `₹${(paise / 100).toLocaleString('en-IN')}`

function cloudImg(url: string, w = 80) {
  return url?.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`) ?? url
}

function VariantBadges({ product }: { product: Product }) {
  const variants = product.variants ?? []
  return (
    <div className="flex flex-wrap gap-1">
      {variants.map(v => {
        const isLow = v.stock > 0 && v.stock <= (v.reorderLevel ?? 3)
        const isOut = v.stock === 0
        return (
          <span
            key={v._id}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
              isOut  ? 'bg-destructive/10 border-destructive/30 text-destructive' :
              isLow  ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300' :
                       'bg-secondary border-border text-muted-foreground',
            )}
          >
            {v.type === 'bottle' ? '🍾' : '🧪'} {v.sizeMl}ml
            <span className="opacity-50">·</span>
            {isOut ? 'Out of stock' : isLow ? `${v.stock} low` : `${v.stock} in stock`}
            {isLow && ' ⚠'}
          </span>
        )
      })}
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-border last:border-0">
          <div className="h-12 w-12 rounded-lg bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 bg-muted rounded" />
            <div className="h-3 w-1/3 bg-muted rounded" />
          </div>
          <div className="h-8 w-20 bg-muted rounded-lg" />
        </div>
      ))}
    </div>
  )
}

// ─── Product row (desktop table) ──────────────────────────────────────────────

function ProductRow({ product, onEdit, onDelete }: {
  product: Product
  onEdit:   (p: Product) => void
  onDelete: (p: Product) => void
}) {
  const { canSeeCosts } = useRole()
  const cover = product.images?.[0]
  const price = product.variants?.[0]?.pricing?.unitPriceExclDelivery

  return (
    <tr className="border-b border-border hover:bg-accent/30 transition-colors group">
      {/* Image */}
      <td className="pl-4 pr-2 py-3 w-14">
        {cover ? (
          <img
            src={cloudImg(cover.url)}
            alt={product.name}
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </td>

      {/* Name / brand */}
      <td className="px-3 py-3">
        <p className="font-medium text-sm leading-snug">{product.name}</p>
        {product.brand && <p className="text-xs text-muted-foreground">{product.brand}</p>}
      </td>

      {/* Category */}
      <td className="px-3 py-3 hidden md:table-cell">
        <span className="text-xs text-muted-foreground">
          {(product.categoryId as any)?.name ?? '—'}
        </span>
      </td>

      {/* Variants */}
      <td className="px-3 py-3">
        <VariantBadges product={product} />
      </td>

      {/* Price */}
      {canSeeCosts && (
        <td className="px-3 py-3 hidden lg:table-cell">
          <span className="text-sm font-semibold">
            {price ? fmt(price) : '—'}
          </span>
        </td>
      )}

      {/* Status */}
      <td className="px-3 py-3 hidden sm:table-cell">
        <span className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
          product.isActive
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
            : 'bg-muted border-border text-muted-foreground',
        )}>
          {product.isActive ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
          {product.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>

      {/* Actions */}
      <td className="pr-4 pl-2 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(product)}
            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Product card (mobile) ────────────────────────────────────────────────────

function ProductCard({ product, onEdit, onDelete }: {
  product: Product
  onEdit:   (p: Product) => void
  onDelete: (p: Product) => void
}) {
  const cover = product.images?.[0]
  const price = product.variants?.[0]?.pricing?.unitPriceExclDelivery
  const { canSeeCosts } = useRole()

  return (
    <div className="bg-card rounded-2xl border border-border p-4 flex gap-3">
      {cover ? (
        <img
          src={cloudImg(cover.url)}
          alt={product.name}
          className="h-16 w-16 rounded-xl object-cover shrink-0"
        />
      ) : (
        <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="font-semibold text-sm truncate">{product.name}</p>
            {product.brand && <p className="text-xs text-muted-foreground truncate">{product.brand}</p>}
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(product)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(product)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-2">
          <VariantBadges product={product} />
        </div>
        {canSeeCosts && price && (
          <p className="text-sm font-bold mt-1.5">{fmt(price)}</p>
        )}
      </div>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onPage }: {
  page: number; totalPages: number; onPage: (p: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 py-4 border-t border-border">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="px-3 py-1.5 text-sm rounded-lg border border-input disabled:opacity-40 hover:bg-accent transition-colors"
      >
        ← Prev
      </button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="px-3 py-1.5 text-sm rounded-lg border border-input disabled:opacity-40 hover:bg-accent transition-colors"
      >
        Next →
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [filters, setFilters]           = useState<ProductFilters>({ page: 1, limit: 20 })
  const [showFilters, setShowFilters]   = useState(false)
  const [createOpen, setCreateOpen]     = useState(false)
  const [editProduct, setEditProduct]   = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)

  const { data, isLoading, isError, refetch } = useProducts(filters)
  const { data: catData } = useCategories()

  const setFilter = useCallback(<K extends keyof ProductFilters>(key: K, val: ProductFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: val, page: 1 }))
  }, [])

  const products    = data?.data ?? []
  const totalPages  = data?.totalPages ?? 1
  const total       = data?.total ?? 0

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {total} product{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          id="create-product-btn"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Create product
        </button>
      </div>

      {/* ── Search + filters ─────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="products-search"
              placeholder="Search by name, brand or SKU…"
              value={filters.search ?? ''}
              onChange={e => setFilter('search', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary h-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors h-10',
              showFilters ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-accent',
            )}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-border bg-muted/30">
            {/* Category */}
            <select
              value={filters.category ?? ''}
              onChange={e => setFilter('category', e.target.value || undefined)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm h-9 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All categories</option>
              {(catData?.categories ?? []).map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            {/* Type */}
            <select
              value={filters.type ?? ''}
              onChange={e => setFilter('type', (e.target.value as any) || undefined)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm h-9 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All types</option>
              <option value="bottle">Bottle</option>
              <option value="tester">Tester</option>
            </select>

            {/* Stock */}
            <select
              value={filters.stock ?? ''}
              onChange={e => setFilter('stock', (e.target.value as any) || undefined)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm h-9 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Any stock</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>

            {/* Status */}
            <select
              value={filters.status ?? ''}
              onChange={e => setFilter('status', (e.target.value as any) || undefined)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm h-9 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Any status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              onClick={() => setFilters({ page: 1, limit: 20 })}
              className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground h-9 border border-input hover:bg-accent transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      {isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm text-destructive mb-4">Failed to load products.</p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 mx-auto text-sm text-primary"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <Skeleton />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-1">No products yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {filters.search || filters.category || filters.stock || filters.status || filters.type
              ? 'No products match your filters.'
              : 'Create your first product to get started.'}
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> Create your first product
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="pl-4 pr-2 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider" />
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Variants</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Price</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="pr-4 pl-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <ProductRow
                    key={p._id}
                    product={p}
                    onEdit={setEditProduct}
                    onDelete={setDeleteProduct}
                  />
                ))}
              </tbody>
            </table>
            <Pagination page={filters.page ?? 1} totalPages={totalPages} onPage={p => setFilter('page', p)} />
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {products.map(p => (
              <ProductCard
                key={p._id}
                product={p}
                onEdit={setEditProduct}
                onDelete={setDeleteProduct}
              />
            ))}
            <Pagination page={filters.page ?? 1} totalPages={totalPages} onPage={p => setFilter('page', p)} />
          </div>
        </>
      )}

      {/* ── Modals ──────────────────────────────────────────────── */}
      <CreateProductModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {editProduct && (
        <EditProductModal
          productId={editProduct._id}
          open={!!editProduct}
          onClose={() => setEditProduct(null)}
        />
      )}

      <DeleteProductModal
        product={deleteProduct}
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
      />
    </div>
  )
}
