import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMe, login, logout } from '@/api/auth'
import type { AdminUser } from '@/types/api'
import type { LoginCredentials } from '@/api/auth'

const ME_KEY  = ['auth', 'me'] as const
const TOKEN_KEY = 'snifftok_admin_token'

/** Token store — used by apiFetch to send Authorization: Bearer */
export const tokenStore = {
  get: ()    => sessionStorage.getItem(TOKEN_KEY) ?? '',
  set: (t: string) => sessionStorage.setItem(TOKEN_KEY, t),
  clear: ()  => sessionStorage.removeItem(TOKEN_KEY),
}

export function useAuth() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ME_KEY,
    queryFn: getMe,
    staleTime: Infinity,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: (creds: LoginCredentials) => login(creds),
    onSuccess: (res) => {
      if (res.token) tokenStore.set(res.token)   // store for Bearer auth
      qc.setQueryData(ME_KEY, res)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      tokenStore.clear()                         // clear stored token
      qc.setQueryData(ME_KEY, { user: null })
      qc.clear()
    },
  })

  const user: AdminUser | null = data?.user ?? null

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  }
}
