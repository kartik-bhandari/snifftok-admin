import { FileText } from 'lucide-react'
import { EmptyState } from '@/components/States'
export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Reports</h1>
      <EmptyState icon={<FileText className="h-6 w-6" />} title="Reports coming in Phase 8" />
    </div>
  )
}
