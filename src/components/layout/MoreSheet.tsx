import { useNavigate } from 'react-router-dom'
import { Zap, MessageCircle, Users, FileText, Settings, X, LogOut, Upload, Megaphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRole } from '@/hooks/useRole'

interface Props {
  open: boolean
  onClose: () => void
}

interface SheetItem {
  label: string
  to: string
  icon: React.ElementType
  description?: string
}

export function MoreSheet({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { canSeeReports, canSeeSettings } = useRole()

  const items: SheetItem[] = [
    { label: 'Quick Order', to: '/quick-order', icon: Zap, description: 'Create a WhatsApp order fast' },
    { label: 'WhatsApp Inbox', to: '/whatsapp', icon: MessageCircle, description: 'Handle incoming messages' },
    { label: 'Customers', to: '/customers', icon: Users, description: 'Browse customer history' },
    { label: 'Bulk Import', to: '/products/import', icon: Upload, description: 'Upload products via CSV' },
    ...(canSeeReports ? [{ label: 'Reports', to: '/reports', icon: FileText, description: 'Sales & profit analytics' }] : []),
    ...(canSeeSettings ? [{ label: 'Event Section', to: '/event-section', icon: Megaphone, description: 'Festival & offer section on the storefront' }] : []),
    ...(canSeeSettings ? [{ label: 'Settings', to: '/settings', icon: Settings, description: 'Pricing, notifications, staff' }] : []),
  ]

  const go = (to: string) => {
    navigate(to)
    onClose()
  }

  const handleLogout = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/auth/logout`,
        { method: 'POST', credentials: 'include', headers: { 'X-Requested-With': 'snifftok-admin', 'Content-Type': 'application/json' } }
      )
    } finally {
      window.location.assign(import.meta.env.VITE_STOREFRONT_URL ?? 'http://localhost:3000')
    }
    onClose()
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={onClose} />

      {/* Sheet */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border md:hidden',
        'pb-safe transform transition-transform duration-200',
      )}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-sm">More</span>
          <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 py-2 space-y-0.5">
          {items.map((item) => (
            <button
              key={item.to}
              onClick={() => go(item.to)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent transition-colors text-left min-h-[56px]"
            >
              <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-secondary flex items-center justify-center">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
              </div>
            </button>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-destructive/10 transition-colors text-left min-h-[56px] text-destructive mt-1"
          >
            <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>

        <div className="h-6" /> {/* safe area bottom */}
      </div>
    </>
  )
}
