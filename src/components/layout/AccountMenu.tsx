import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL ?? 'http://localhost:3000'

export function AccountMenu() {
  const { user, isLoggingOut } = useAuth()

  const handleLogout = async () => {
    try {
      // Call the API to clear the session cookie
      await fetch(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/auth/logout`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'snifftok-admin',
          },
        },
      )
    } finally {
      // Always redirect to storefront — session is cleared by the API
      window.location.assign(STOREFRONT_URL)
    }
  }

  if (!user) return null

  const initials  = user.email.slice(0, 2).toUpperCase()
  const roleLabel = { superadmin: 'Super Admin', admin: 'Admin', ops: 'Operations', staff: 'Staff' }[user.role] ?? user.role

  return (
    <div className="flex items-center gap-3 px-1">
      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{user.email}</p>
        <p className="text-[10px] text-muted-foreground">{roleLabel}</p>
      </div>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
