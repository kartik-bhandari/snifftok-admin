import { NavLink, useLocation } from 'react-router-dom'
import {
  BarChart2, ShoppingBag, Package, Boxes, MessageCircle,
  Users, FileText, Settings, Zap, Upload, ChevronRight, Megaphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRole } from '@/hooks/useRole'
import { AccountMenu } from './AccountMenu'

interface NavItem {
  label: string
  to: string
  icon: React.ElementType
  badge?: number
}

function NavGroup({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className="mb-4">
      <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5',
              'min-h-[44px]',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent',
            )
          }
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="flex-1">{item.label}</span>
          {item.badge != null && item.badge > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  )
}

export function Sidebar() {
  const { canSeeReports, canSeeSettings } = useRole()

  const overview: NavItem[] = [
    { label: 'Dashboard', to: '/', icon: BarChart2 },
  ]

  const sales: NavItem[] = [
    { label: 'Orders', to: '/orders', icon: ShoppingBag },
    { label: 'Quick Order', to: '/quick-order', icon: Zap },
    { label: 'WhatsApp Inbox', to: '/whatsapp', icon: MessageCircle, badge: 2 },
  ]

  const catalogue: NavItem[] = [
    { label: 'Products', to: '/products', icon: Package },
    { label: 'Bulk Import', to: '/products/import', icon: Upload },
  ]

  const operations: NavItem[] = [
    { label: 'Inventory', to: '/inventory', icon: Boxes },
    { label: 'Customers', to: '/customers', icon: Users },
  ]

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <span className="font-wordmark text-foreground text-2xl tracking-widest">snifftok</span>
        <span className="block text-[10px] text-muted-foreground tracking-wider uppercase mt-0.5">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <NavGroup title="Overview" items={overview} />
        <NavGroup title="Sales" items={sales} />
        <NavGroup title="Catalogue" items={catalogue} />
        <NavGroup title="Operations" items={operations} />

        {canSeeReports && (
          <NavGroup title="Insights" items={[{ label: 'Reports', to: '/reports', icon: FileText }]} />
        )}
        {canSeeSettings && (
          <NavGroup title="Storefront" items={[{ label: 'Event Section', to: '/event-section', icon: Megaphone }]} />
        )}
        {canSeeSettings && (
          <NavGroup title="System" items={[{ label: 'Settings', to: '/settings', icon: Settings }]} />
        )}
      </nav>

      {/* Account */}
      <div className="border-t border-border p-3">
        <AccountMenu />
      </div>
    </aside>
  )
}
