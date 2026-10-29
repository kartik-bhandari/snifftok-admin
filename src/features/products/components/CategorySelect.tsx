import { useFormContext, useWatch } from 'react-hook-form'
import { useCategories } from '@/hooks/useCategories'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export function CategorySelect() {
  const { register, formState: { errors } } = useFormContext()
  const value = useWatch({ name: 'categoryId' })
  const { data, isLoading } = useCategories()

  const categories = data?.categories ?? []
  const selected = categories.find(c => c._id === value)

  return (
    <div className="relative">
      <select
        {...register('categoryId', { required: 'Category is required' })}
        defaultValue={value ?? ''}
        className={cn(
          'w-full appearance-none px-3 py-2 pr-9 rounded-lg border bg-background text-sm h-10 focus:outline-none focus:ring-2 focus:ring-primary/30 transition cursor-pointer',
          errors.categoryId ? 'border-destructive' : 'border-input hover:border-primary/50',
          !value && 'text-muted-foreground',
        )}
      >
        <option value="" disabled>
          {isLoading ? 'Loading…' : 'Select category'}
        </option>
        {categories.map(cat => (
          <option key={cat._id} value={cat._id}>
            {cat.name}{cat.aka ? ` (${cat.aka})` : ''}
          </option>
        ))}
      </select>

      {/* Custom chevron icon */}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

      {errors.categoryId ? (
        <p className="text-xs text-destructive mt-1">{String(errors.categoryId.message)}</p>
      ) : selected?.smellsLike ? (
        <p className="text-xs text-muted-foreground mt-1">{selected.smellsLike}</p>
      ) : null}
    </div>
  )
}
