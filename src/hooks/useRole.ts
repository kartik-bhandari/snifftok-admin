/**
 * src/hooks/useRole.ts
 * Derives role-based capabilities from the auth state.
 * Matches what Sidebar, MoreSheet, RoleGuard, and feature components expect.
 */
import { useAuth } from '@/hooks/useAuth'
import type { AdminRole } from '@/types/api'

export function useRole() {
  const { user } = useAuth()
  const role: AdminRole = (user?.role ?? 'staff') as AdminRole

  /** Returns true if the current user meets or exceeds the required role. */
  const hasRole = (required: AdminRole): boolean => {
    if (required === 'staff') return true           // every authenticated user is at least staff
    if (required === 'admin') return role === 'admin'
    return false
  }

  return {
    role,
    isAdmin:        role === 'admin',
    isStaff:        role === 'staff',
    canSeeCosts:    role === 'admin',   // purchase cost + profit only visible to admin
    canSeeReports:  role === 'admin',
    canSeeSettings: role === 'admin',
    hasRole,
  }
}
