// Core API types mirroring the backend Mongoose models.
// All monetary values are INTEGER PAISE — never floats.

export type AdminRole = 'admin' | 'staff'

export interface AdminUser {
  _id: string
  email: string
  name?: string
  role: AdminRole
  twoFactorEnabled?: boolean
  lastLoginAt?: string
  createdAt: string
}

/** One of the 5 scent families (Floral, Amber, Woody, Fresh, Gourmand) */
export interface Category {
  _id: string
  name: string
  slug: string
  isActive: boolean
  sortOrder?: number
  aka?: string
  smellsLike?: string
  notes?: string[]
  subfamilies?: string[]
  bestFor?: string
  createdAt: string
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface Settings {
  _id: 'global'
  gstRate: number             // e.g. 0.18
  gatewayFeeRate: number      // e.g. 0.02
  gatewayFeeGstRate: number   // e.g. 0.18
  deliveryPerSlab: number     // paise — e.g. 8000
  testersPerSlab: number      // e.g. 5
  defaultMinProfit: {
    bottle: number            // paise
    tester: number            // paise
  }
  roundingStep: number        // paise — e.g. 100
  mixedCartSlabSharing: boolean
  reservationHoldHours: number
  vendor: {
    name: string
    whatsappNumber: string
  }
  updatedAt: string
}

// ─── Variant / Product ───────────────────────────────────────────────────────

export type VariantType = 'bottle' | 'tester'

export interface ProductImage {
  url:       string
  publicId:  string
  width?:    number
  height?:   number
  order:     number
}

export interface Variant {
  _id: string
  type: VariantType
  sizeMl: number
  sku: string
  costPrice?: number          // paise — omitted for staff
  minProfit?: number          // paise — omitted for staff
  stock: number
  reserved: number
  reorderLevel: number
  pricing?: {
    unitPriceExclDelivery: number   // paise
    calculatedAt: string
  }
}

export interface Product {
  _id: string
  name: string
  slug: string
  brand?: string
  categoryId?: string | Category
  description?: string
  notes: {
    top: string[]
    heart: string[]
    base: string[]
  }
  concentration?: string
  origin?: string
  images: ProductImage[]
  tags: Array<'trending' | 'best-seller' | 'new'>
  isActive: boolean
  variants: Variant[]
  __v?: number
  createdAt: string
  updatedAt: string
}


// ─── Pricing preview ─────────────────────────────────────────────────────────

export interface PricingPreview {
  variant: { type: VariantType; costPrice: number; minProfit: number }
  k: number
  single: {
    grandTotal: number
    gstAmount: number
    gatewayFee: number
    gatewayFeeGst: number
    rawDelivery: number
    totalCost: number
    netProfit: number
  }
  pack?: {
    qty: number
    grandTotal: number
    perUnit: number
    gstAmount: number
    gatewayFee: number
    gatewayFeeGst: number
    rawDelivery: number
    totalCost: number
    netProfit: number
  }
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'draft'
  | 'awaiting_details'
  | 'awaiting_payment'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type OrderSource = 'web' | 'whatsapp' | 'admin'

export interface OrderLine {
  sku: string
  productName: string
  variantLabel: string
  type: VariantType
  sizeMl: number
  qty: number
  costPriceSnap: number     // paise
  minProfitSnap: number     // paise
  unitPrice: number         // paise
}

export interface OrderTotals {
  linesTotal: number
  shipping: number
  grandTotal: number
  gstAmount: number
  gatewayFee: number
  gatewayFeeGst: number
  totalCost: number
  netProfit: number
}

export interface Order {
  _id: string
  orderNumber: string
  source: OrderSource
  customer: {
    name: string
    phone: string
    email?: string
  }
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
  }
  lines: OrderLine[]
  totals: OrderTotals
  status: OrderStatus
  payment: {
    method?: string
    razorpayOrderId?: string
    razorpayPaymentId?: string
    paidAt?: string
  }
  waMessageId?: string
  reservedUntil?: string
  vendorNotifiedAt?: string
  tracking?: {
    courier?: string
    awb?: string
    url?: string
  }
  createdAt: string
  updatedAt: string
}

// ─── Stock / Inventory ───────────────────────────────────────────────────────

export type StockReason =
  | 'purchase'
  | 'adjustment'
  | 'web_order_reserved'
  | 'wa_order_reserved'
  | 'order_confirmed'
  | 'reservation_released'
  | 'cancelled'
  | 'returned'

export interface StockMovement {
  _id: string
  sku: string
  delta: number
  field: 'stock' | 'reserved'
  reason: StockReason
  orderId?: string
  refId?: string
  actor: string
  createdAt: string
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export interface Customer {
  _id: string
  name: string
  phone: string
  email?: string
  orderCount: number
  lifetimeSpend: number    // paise
  lastOrderAt?: string
  notes?: string
  createdAt: string
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export type DashboardPeriod = 'today' | '7d' | '30d' | 'fy' | 'lifetime'

export interface DashboardTotals {
  revenue: number           // paise
  netProfit: number | null  // paise — null for staff (admin-only)
  orders: number
  aov: number               // paise
  unitsSold: number
}

export interface DashboardSummary extends DashboardTotals {
  period: DashboardPeriod
  bucket: 'hour' | 'day' | 'month'
  /** e.g. "FY 2026–27" — null for the short periods */
  label: string | null
  /** Start of the period (ISO) */
  rangeStart: string
  /** Order lines whose cost price couldn't be found — left out of profit */
  profitMissingCost: number
  byChannel: {
    web: number
    whatsapp: number
    admin: number
  }
  chartData: Array<{
    date: string              // IST — "2026-10-28T14" (hour), "2026-10-28" (day) or "2026-10" (month)
    revenue: number
    netProfit: number | null
  }>
  /** Same-length period just before, up to the same point in time — null for lifetime */
  previous: DashboardTotals | null
  topProducts: Array<{
    productId: string | null
    name: string
    brand: string | null
    image: string | null
    unitsSold: number
    revenue: number           // paise
  }>
}

export interface AttentionItem {
  type: 'order_pending' | 'order_awaiting' | 'order_expiring' | 'low_stock' | 'failed_notification'
  orderId?: string
  orderNumber?: string
  customerName?: string
  total?: number            // paise
  createdAt?: string
  productId?: string
  sku?: string
  variantLabel?: string
  availableStock?: number
  reorderLevel?: number
  expiresAt?: string
  message: string
}

// ─── Storefront event section ───────────────────────────────────────────────

/** Max products in the event section (matches the API) */
export const EVENT_SECTION_MAX_PRODUCTS = 12

export interface EventSectionProduct {
  _id: string
  name: string
  brand?: string
  image: string | null
  /** false = archived — still saved, but not shown on the storefront */
  isActive: boolean
}

export interface EventSection {
  enabled: boolean
  title: string
  subtitle: string
  products: EventSectionProduct[]
  updatedAt?: string
}

export interface EventSectionUpdate {
  enabled: boolean
  title: string
  subtitle: string
  productIds: string[]
}

// ─── WhatsApp ────────────────────────────────────────────────────────────────

export interface WaMessage {
  _id: string
  from: string              // phone number
  customerName?: string
  body: string
  receivedAt: string
  handled: boolean
  handledAt?: string
  note?: string
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── API Error ───────────────────────────────────────────────────────────────

export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string>
}
