import { Zap } from 'lucide-react'
import { EmptyState } from '@/components/States'
export default function QuickOrderPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Quick Order</h1>
      <EmptyState icon={<Zap className="h-6 w-6" />} title="Quick Order coming in Phase 7" />
    </div>
  )
}
