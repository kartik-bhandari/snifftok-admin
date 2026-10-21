import type { ApiError } from '@/types/api'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'
const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL ?? 'http://localhost:3000'

class HttpError extends Error {
  status: number
  errors?: Record<string, string>

  constructor(status: number, message: string, errors?: Record<string, string>) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export { HttpError }

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${BASE}${path}`

  const res = await fetch(url, {
    credentials: 'include',           // always send the httpOnly session cookie
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'snifftok-admin',   // CSRF sentinel
      ...init.headers,
    },
    ...init,
  })

  // 401 — session expired or not logged in
  // Throw instead of hard-redirect so callers (e.g. getMe) can catch and handle gracefully.
  if (res.status === 401) {
    throw new HttpError(401, 'Unauthorised')
  }

  // 403 — logged in but insufficient role
  if (res.status === 403) {
    let body: Partial<ApiError> = {}
    try { body = await res.json() } catch { /* ignore */ }
    throw new HttpError(403, body.message ?? 'Access denied.', body.errors)
  }

  if (!res.ok) {
    let body: Partial<ApiError> = {}
    try { body = await res.json() } catch { /* ignore */ }
    throw new HttpError(
      res.status,
      body.message ?? `HTTP ${res.status}`,
      body.errors,
    )
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

/** POST helper */
export function apiPost<T>(path: string, data: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** PATCH helper */
export function apiPatch<T>(path: string, data: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/** PUT helper */
export function apiPut<T>(path: string, data: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/** DELETE helper */
export function apiDelete<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: 'DELETE' })
}
