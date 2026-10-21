import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL ?? 'http://localhost:3000'

export function AuthGuard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    )
  }

  // Not logged in → storefront login
  if (!isAuthenticated) {
    window.location.assign(`${STOREFRONT_URL}/login`)
    return null
  }

  // Logged in but wrong role (customer or setupOnly) → back to login with message
  const role = user?.role as string
  if (!role || role === 'customer') {
    window.location.assign(`${STOREFRONT_URL}/login?error=access_denied`)
    return null
  }

  return <Outlet />
}
