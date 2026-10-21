import { BarChart2 } from 'lucide-react'
import { EmptyState } from '@/components/States'
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Dashboard</h1>
      <EmptyState icon={<BarChart2 className="h-6 w-6" />} title="Dashboard coming in Phase 2" description="Revenue, profit, orders and attention panel will appear here." />
    </div>
  )
}
