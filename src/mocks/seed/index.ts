import type { AdminUser, Order, Product, Customer, Settings } from '@/types/api'

// ─── Admin users ──────────────────────────────────────────────────────────────

export const ADMIN_USER: AdminUser = {
  _id: 'admin_001',
  email: 'admin@snifftok.com',
  role: 'admin',
  lastLoginAt: new Date().toISOString(),
  createdAt: '2024-01-01T00:00:00Z',
}

export const OPS_USER: AdminUser = {
  _id: 'ops_001',
  email: 'ops@snifftok.com',
  role: 'staff',
  createdAt: '2024-01-15T00:00:00Z',
}

export const STAFF_USER: AdminUser = {
  _id: 'staff_001',
  email: 'staff@snifftok.com',
  role: 'staff',
  createdAt: '2024-02-01T00:00:00Z',
}

export const MOCK_USERS = [ADMIN_USER, OPS_USER, STAFF_USER]

// Credentials map
export const CREDENTIALS: Record<string, AdminUser> = {
  'admin@snifftok.com:admin123': ADMIN_USER,
  'ops@snifftok.com:ops123': OPS_USER,
  'staff@snifftok.com:staff123': STAFF_USER,
}

// ─── Settings ────────────────────────────────────────────────────────────────

export const MOCK_SETTINGS: Settings = {
  _id: 'global',
  gstRate: 0.18,
  gatewayFeeRate: 0.02,
  gatewayFeeGstRate: 0.18,
  deliveryPerSlab: 8000,
  testersPerSlab: 5,
  defaultMinProfit: { bottle: 30000, tester: 30000 },
  roundingStep: 100,
  mixedCartSlabSharing: false,
  reservationHoldHours: 24,
  vendor: { name: 'snifftok', whatsappNumber: '919876543210' },
  updatedAt: new Date().toISOString(),
}

// ─── Products ────────────────────────────────────────────────────────────────

const mockImg = (text: string, bg = '1a1a1a', fg = 'ffffff') => [{
  url:      `https://placehold.co/400x400/${bg}/${fg}?text=${encodeURIComponent(text)}`,
  publicId: `snifftok/products/mock_${text.toLowerCase().replace(/\s+/g, '_')}`,
  width:    400,
  height:   400,
  order:    0,
}]

const reorderLevel = 3

export const MOCK_PRODUCTS: Product[] = [
  {
    _id: 'prod_001',
    name: 'Oud Royale',
    slug: 'oud-royale',
    brand: 'Lattafa',
    categoryId: 'cat_oud',
    description: 'Rich oud with deep woody base notes. A bestseller for evenings.',
    notes: { top: ['Bergamot', 'Saffron'], heart: ['Rose', 'Oud'], base: ['Amber', 'Musk'] },
    concentration: 'EDP',
    origin: 'UAE',
    images: mockImg('Oud Royale'),
    tags: ['best-seller', 'trending'],
    isActive: true,
    variants: [
      {
        _id: 'var_001a', type: 'bottle', sizeMl: 100, sku: 'OUD-100-BTL',
        costPrice: 200000, minProfit: 30000, stock: 12, reserved: 2, reorderLevel,
        pricing: { unitPriceExclDelivery: 279200, calculatedAt: new Date().toISOString() },
      },
      {
        _id: 'var_001b', type: 'tester', sizeMl: 3, sku: 'OUD-3-TST',
        costPrice: 50000, minProfit: 30000, stock: 25, reserved: 0, reorderLevel,
        pricing: { unitPriceExclDelivery: 97200, calculatedAt: new Date().toISOString() },
      },
    ],
    createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-10-01T00:00:00Z',
  },
  {
    _id: 'prod_002',
    name: 'Santal Mystique',
    slug: 'santal-mystique',
    brand: 'Maison Margiela',
    categoryId: 'cat_unisex',
    description: 'Creamy sandalwood with a hint of vanilla.',
    notes: { top: ['Pink Pepper'], heart: ['Sandalwood', 'Iris'], base: ['Vanilla', 'Cedarwood'] },
    concentration: 'EDT',
    origin: 'France',
    images: mockImg('Santal', 'f5f0e8', '1a1a1a'),
    tags: ['new'],
    isActive: true,
    variants: [
      {
        _id: 'var_002a', type: 'bottle', sizeMl: 100, sku: 'SNT-100-BTL',
        costPrice: 350000, minProfit: 50000, stock: 5, reserved: 1, reorderLevel,
        pricing: { unitPriceExclDelivery: 486800, calculatedAt: new Date().toISOString() },
      },
      {
        _id: 'var_002b', type: 'tester', sizeMl: 2, sku: 'SNT-2-TST',
        costPrice: 70000, minProfit: 30000, stock: 3, reserved: 0, reorderLevel,
        pricing: { unitPriceExclDelivery: 121900, calculatedAt: new Date().toISOString() },
      },
    ],
    createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-10-05T00:00:00Z',
  },
  {
    _id: 'prod_003',
    name: 'Rose Elixir',
    slug: 'rose-elixir',
    brand: 'Initio',
    categoryId: 'cat_women',
    description: 'A modern take on the classic rose fragrance with a spicy twist.',
    notes: { top: ['Lychee', 'Rose'], heart: ['Peony', 'Patchouli'], base: ['White Musk', 'Sandalwood'] },
    concentration: 'EDP',
    origin: 'France',
    images: mockImg('Rose Elixir', 'ffe4e1', '8b0000'),
    tags: ['trending'],
    isActive: true,
    variants: [
      {
        _id: 'var_003a', type: 'bottle', sizeMl: 90, sku: 'RSE-90-BTL',
        costPrice: 450000, minProfit: 70000, stock: 8, reserved: 0, reorderLevel,
        pricing: { unitPriceExclDelivery: 632000, calculatedAt: new Date().toISOString() },
      },
    ],
    createdAt: '2024-07-15T00:00:00Z', updatedAt: '2024-10-08T00:00:00Z',
  },
  {
    _id: 'prod_004',
    name: 'Tobacco Amber',
    slug: 'tobacco-amber',
    brand: 'Tom Ford',
    categoryId: 'cat_men',
    description: 'Bold tobacco and amber. Statement fragrance for confident personalities.',
    notes: { top: ['Cardamom', 'Black Pepper'], heart: ['Tobacco', 'Honey'], base: ['Amber', 'Leather'] },
    concentration: 'Extrait',
    origin: 'USA',
    images: mockImg('Tobacco', '2d1a0e', 'f5deb3'),
    tags: ['best-seller'],
    isActive: true,
    variants: [
      {
        _id: 'var_004a', type: 'bottle', sizeMl: 50, sku: 'TAB-50-BTL',
        costPrice: 800000, minProfit: 100000, stock: 3, reserved: 1, reorderLevel,
        pricing: { unitPriceExclDelivery: 1093200, calculatedAt: new Date().toISOString() },
      },
      {
        _id: 'var_004b', type: 'tester', sizeMl: 2, sku: 'TAB-2-TST',
        costPrice: 120000, minProfit: 30000, stock: 2, reserved: 0, reorderLevel,
        pricing: { unitPriceExclDelivery: 182400, calculatedAt: new Date().toISOString() },
      },
    ],
    createdAt: '2024-04-01T00:00:00Z', updatedAt: '2024-09-20T00:00:00Z',
  },
]


// ─── Orders ──────────────────────────────────────────────────────────────────

export const MOCK_ORDERS: Order[] = [
  {
    _id: 'ord_001',
    orderNumber: 'SNF-00001',
    source: 'web',
    customer: { name: 'Arjun Sharma', phone: '9876543210', email: 'arjun@example.com' },
    shippingAddress: { line1: '12, MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
    lines: [
      {
        sku: 'OUD-100-BTL', productName: 'Oud Royale', variantLabel: '100ml Bottle',
        type: 'bottle', sizeMl: 100, qty: 1,
        costPriceSnap: 200000, minProfitSnap: 30000, unitPrice: 279200,
      },
    ],
    totals: { linesTotal: 279200, shipping: 9700, grandTotal: 288900, gstAmount: 44069, gatewayFee: 5778, gatewayFeeGst: 1040, totalCost: 208000, netProfit: 30013 },
    status: 'confirmed',
    payment: { method: 'razorpay', razorpayOrderId: 'order_test_001', razorpayPaymentId: 'pay_test_001', paidAt: '2024-10-17T10:30:00Z' },
    createdAt: '2024-10-17T10:00:00Z',
    updatedAt: '2024-10-17T10:35:00Z',
  },
  {
    _id: 'ord_002',
    orderNumber: 'SNF-00002',
    source: 'whatsapp',
    customer: { name: 'Priya Nair', phone: '9123456780' },
    shippingAddress: { line1: '5, Anna Salai', city: 'Chennai', state: 'Tamil Nadu', pincode: '600002' },
    lines: [
      {
        sku: 'OUD-3-TST', productName: 'Oud Royale', variantLabel: '3ml Tester',
        type: 'tester', sizeMl: 3, qty: 5,
        costPriceSnap: 50000, minProfitSnap: 30000, unitPrice: 97200,
      },
    ],
    totals: { linesTotal: 486000, shipping: 9300, grandTotal: 495300, gstAmount: 75554, gatewayFee: 9906, gatewayFeeGst: 1783, totalCost: 258000, netProfit: 150057 },
    status: 'awaiting_payment',
    payment: {},
    reservedUntil: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-10-18T08:00:00Z',
    updatedAt: '2024-10-18T08:05:00Z',
  },
  {
    _id: 'ord_003',
    orderNumber: 'SNF-00003',
    source: 'web',
    customer: { name: 'Rahul Gupta', phone: '9988776655', email: 'rahul@example.com' },
    shippingAddress: { line1: 'Flat 3B, Lodhi Colony', city: 'New Delhi', state: 'Delhi', pincode: '110003' },
    lines: [
      {
        sku: 'SNT-100-BTL', productName: 'Santal Mystique', variantLabel: '100ml Bottle',
        type: 'bottle', sizeMl: 100, qty: 1,
        costPriceSnap: 350000, minProfitSnap: 50000, unitPrice: 486800,
      },
    ],
    totals: { linesTotal: 486800, shipping: 13600, grandTotal: 500400, gstAmount: 76332, gatewayFee: 10008, gatewayFeeGst: 1801, totalCost: 358000, netProfit: 54259 },
    status: 'packed',
    payment: { method: 'razorpay', paidAt: '2024-10-15T14:00:00Z' },
    vendorNotifiedAt: '2024-10-15T14:05:00Z',
    createdAt: '2024-10-15T13:30:00Z',
    updatedAt: '2024-10-16T09:00:00Z',
  },
  {
    _id: 'ord_004',
    orderNumber: 'SNF-00004',
    source: 'admin',
    customer: { name: 'Meera Patel', phone: '9654321098' },
    shippingAddress: { line1: 'B-12, Navrangpura', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009' },
    lines: [
      {
        sku: 'RSE-90-BTL', productName: 'Rose Elixir', variantLabel: '90ml Bottle',
        type: 'bottle', sizeMl: 90, qty: 1,
        costPriceSnap: 450000, minProfitSnap: 70000, unitPrice: 632000,
      },
    ],
    totals: { linesTotal: 632000, shipping: 18700, grandTotal: 650700, gstAmount: 99258, gatewayFee: 13014, gatewayFeeGst: 2343, totalCost: 458000, netProfit: 78085 },
    status: 'shipped',
    payment: { method: 'upi', paidAt: '2024-10-12T11:00:00Z' },
    tracking: { courier: 'Delhivery', awb: 'DEL123456789', url: 'https://www.delhivery.com/track/package/DEL123456789' },
    createdAt: '2024-10-12T10:30:00Z',
    updatedAt: '2024-10-14T16:00:00Z',
  },
  {
    _id: 'ord_005',
    orderNumber: 'SNF-00005',
    source: 'web',
    customer: { name: 'Deepak Kumar', phone: '9123456789' },
    shippingAddress: { line1: '23, Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016' },
    lines: [
      {
        sku: 'TAB-50-BTL', productName: 'Tobacco Amber', variantLabel: '50ml Bottle',
        type: 'bottle', sizeMl: 50, qty: 1,
        costPriceSnap: 800000, minProfitSnap: 100000, unitPrice: 1093200,
      },
    ],
    totals: { linesTotal: 1093200, shipping: 7900, grandTotal: 1101100, gstAmount: 168.966, gatewayFee: 22022, gatewayFeeGst: 3964, totalCost: 808000, netProfit: 101148 },
    status: 'awaiting_details',
    payment: {},
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
]

// ─── Customers ────────────────────────────────────────────────────────────────

export const MOCK_CUSTOMERS: Customer[] = [
  { _id: 'cust_001', name: 'Arjun Sharma', phone: '9876543210', email: 'arjun@example.com', orderCount: 3, lifetimeSpend: 866700, lastOrderAt: '2024-10-17T10:00:00Z', createdAt: '2024-05-01T00:00:00Z' },
  { _id: 'cust_002', name: 'Priya Nair', phone: '9123456780', orderCount: 2, lifetimeSpend: 1485900, lastOrderAt: '2024-10-18T08:00:00Z', createdAt: '2024-06-15T00:00:00Z' },
  { _id: 'cust_003', name: 'Rahul Gupta', phone: '9988776655', email: 'rahul@example.com', orderCount: 1, lifetimeSpend: 500400, lastOrderAt: '2024-10-15T13:30:00Z', createdAt: '2024-10-15T13:30:00Z' },
  { _id: 'cust_004', name: 'Meera Patel', phone: '9654321098', orderCount: 1, lifetimeSpend: 650700, lastOrderAt: '2024-10-12T10:30:00Z', createdAt: '2024-10-12T10:30:00Z' },
]

// ─── Dashboard seed ───────────────────────────────────────────────────────────

export function generateChartData(days: number) {
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const revenue = Math.floor(Math.random() * 500000) + 100000
    data.push({
      date: date.toISOString().split('T')[0],
      revenue,
      netProfit: Math.floor(revenue * (0.08 + Math.random() * 0.05)),
    })
  }
  return data
}
