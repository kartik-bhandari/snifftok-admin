import { cn } from '@/lib/utils'

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-card rounded-xl border border-border p-4 animate-pulse', className)}>
      <div className="h-3 w-24 bg-muted rounded mb-3" />
      <div className="h-7 w-32 bg-muted rounded mb-2" />
      <div className="h-2.5 w-20 bg-muted rounded" />
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 px-4 py-2">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1 h-3 bg-muted rounded animate-pulse" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-t border-border animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="flex-1 h-4 bg-muted rounded" style={{ opacity: 1 - j * 0.1 }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse flex gap-3">
          <div className="h-10 w-10 bg-muted rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-muted rounded w-48" />
            <div className="h-2.5 bg-muted rounded w-32" />
          </div>
          <div className="h-5 w-16 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  )
}
