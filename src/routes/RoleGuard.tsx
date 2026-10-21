import { Navigate, Outlet } from 'react-router-dom'
import { useRole } from '@/hooks/useRole'
import type { AdminRole } from '@/types/api'

interface Props {
  required: 'admin' | 'staff'
  redirectTo?: string
}

/**
 * Protects routes from lower-privileged roles.
 * Staff cannot access: /reports, /settings
 * Ops cannot access: /settings (staff management)
 */
export function RoleGuard({ required, redirectTo = '/' }: Props) {
  const { hasRole } = useRole()

  if (!hasRole(required)) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
