import { Users } from 'lucide-react'
import { EmptyState } from '@/components/States'
export default function CustomersPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Customers</h1>
      <EmptyState icon={<Users className="h-6 w-6" />} title="Customers coming in Phase 8" />
    </div>
  )
}
