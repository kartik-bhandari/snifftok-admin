import { ShoppingBag } from 'lucide-react'
import { EmptyState } from '@/components/States'
export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Orders</h1>
      <EmptyState icon={<ShoppingBag className="h-6 w-6" />} title="Orders coming in Phase 6" />
    </div>
  )
}
