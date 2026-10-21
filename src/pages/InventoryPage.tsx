import { Boxes } from 'lucide-react'
import { EmptyState } from '@/components/States'
export default function InventoryPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Inventory</h1>
      <EmptyState icon={<Boxes className="h-6 w-6" />} title="Inventory coming in Phase 5" />
    </div>
  )
}
