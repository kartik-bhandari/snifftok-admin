import { NavLink } from 'react-router-dom'
import { BarChart2, ShoppingBag, Package, Boxes, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { MoreSheet } from './MoreSheet'

const tabs = [
  { label: 'Dashboard', to: '/', icon: BarChart2, end: true },
  { label: 'Orders', to: '/orders', icon: ShoppingBag },
  { label: 'Products', to: '/products', icon: Package },
  { label: 'Stock', to: '/inventory', icon: Boxes },
]

export function BottomBar() {
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-pb">
        <div className="flex items-center justify-around px-1 py-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[56px] rounded-xl transition-colors px-1',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn('p-1.5 rounded-lg transition-colors', isActive && 'bg-primary/10')}>
                    <tab.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                  </div>
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* More button */}
          <button
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[56px] rounded-xl text-muted-foreground transition-colors px-1"
            aria-label="More options"
          >
            <div className="p-1.5 rounded-lg">
              <MoreHorizontal className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      <MoreSheet open={showMore} onClose={() => setShowMore(false)} />
    </>
  )
}
