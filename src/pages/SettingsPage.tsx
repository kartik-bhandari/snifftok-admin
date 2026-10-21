import { Settings } from 'lucide-react'
import { EmptyState } from '@/components/States'
export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Settings</h1>
      <EmptyState icon={<Settings className="h-6 w-6" />} title="Settings coming in Phase 8" />
    </div>
  )
}
