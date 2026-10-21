import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

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

  // Not logged in → admin's own login page (avoids cross-origin cookie issues)
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but wrong role (customer) → back to login with message
  const role = user?.role as string
  if (!role || role === 'customer') {
    return <Navigate to="/login" state={{ from: location, error: 'access_denied' }} replace />
  }

  return <Outlet />
}
