import { MessageCircle } from 'lucide-react'
import { EmptyState } from '@/components/States'
export default function WhatsAppInboxPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">WhatsApp Inbox</h1>
      <EmptyState icon={<MessageCircle className="h-6 w-6" />} title="WhatsApp Inbox coming in Phase 7" />
    </div>
  )
}
