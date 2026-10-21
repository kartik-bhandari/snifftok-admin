import { z } from 'zod'

/** Convert rupees input string → paise integer */
const rupeesToPaise = (val: unknown) => {
  const num = parseFloat(String(val))
  return isNaN(num) ? 0 : Math.round(num * 100)
}

export const variantSchema = z.object({
  _id:          z.string().optional(),
  type:         z.enum(['bottle', 'tester']),
  sizeMl:       z.coerce.number().int().positive('Size must be positive'),
  sku:          z.string().trim().min(1, 'SKU required').max(50).transform(s => s.toUpperCase()),
  costPrice:    z.preprocess(rupeesToPaise, z.number().int().positive('Cost must be > 0')),
  minProfit:    z.preprocess(rupeesToPaise, z.number().int().min(0, 'Min profit cannot be negative')),
  stock:        z.coerce.number().int().min(0, 'Stock cannot be negative'),
  reorderLevel: z.coerce.number().int().min(0).default(3),
})

export const productSchema = z.object({
  name:         z.string().trim().min(1, 'Name is required').max(200),
  brand:        z.string().trim().max(100).optional(),
  categoryId:   z.string().min(1, 'Category is required'),
  description:  z.string().max(2000).optional(),
  notes: z.object({
    top:   z.array(z.string()).default([]),
    heart: z.array(z.string()).default([]),
    base:  z.array(z.string()).default([]),
  }).default(() => ({ top: [], heart: [], base: [] })),
  concentration: z.string().trim().max(100).optional(),
  origin:        z.string().trim().max(100).optional(),
  tags:          z.array(z.enum(['trending', 'best-seller', 'new'])).default([]),
  isActive:      z.boolean().default(true),
  variants:      z.array(variantSchema).min(1, 'At least one variant is required'),
})

export type ProductFormValues = z.infer<typeof productSchema>
export type VariantFormValues = z.infer<typeof variantSchema>

/** Default values for a new variant row */
export const DEFAULT_VARIANT: Partial<VariantFormValues> = {
  type:         'bottle',
  sizeMl:       100,
  sku:          '',
  costPrice:    0 as any,   // displayed as empty string in the input
  minProfit:    300 as any, // ₹300 default
  stock:        0,
  reorderLevel: 3,
}
