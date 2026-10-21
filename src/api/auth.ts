import { apiFetch, apiPost } from './client'
import type { AdminUser } from '@/types/api'

export interface LoginCredentials {
  email: string
  password: string
}

export async function login(creds: LoginCredentials): Promise<{ user: AdminUser; token?: string }> {
  return apiPost<{ user: AdminUser; token?: string }>('/api/auth/login', creds)
}

export async function logout(): Promise<void> {
  return apiPost<void>('/api/auth/logout', {})
}

export async function getMe(): Promise<{ user: AdminUser | null }> {
  try {
    return await apiFetch<{ user: AdminUser | null }>('/api/auth/me')
  } catch {
    // Network error or 401 → treat as unauthenticated (AuthGuard handles the redirect)
    return { user: null }
  }
}
