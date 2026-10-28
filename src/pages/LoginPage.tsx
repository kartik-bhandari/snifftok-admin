import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { user, isAuthenticated, isLoading: authLoading, login, isLoggingIn } = useAuth()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname ?? '/'

  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')

  // Only admin/staff go through. A customer session (e.g. the storefront cookie,
  // which is shared across ports on localhost) must stay here — AuthGuard would
  // send it straight back and the two redirects would loop forever.
  // (AdminRole has no 'customer', but /me can still return one — same cast as AuthGuard)
  const isStaffSession = isAuthenticated && (user?.role as string) !== 'customer'
  if (!authLoading && isStaffSession) return <Navigate to={from} replace />

  const customerNotice = isAuthenticated && !isStaffSession
    ? `You're signed in as a customer (${user?.email}). Sign in with an admin or staff account to continue.`
    : null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login({ email: form.email, password: form.password })
      // useAuth will update → Navigate above will redirect
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">SNIFFTOK</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin panel</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {customerNotice && !error && (
              <div className="flex items-start gap-2 bg-muted border border-border text-foreground text-xs px-3 py-2.5 rounded-xl">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px" />
                {customerNotice}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-xs px-3 py-2.5 rounded-xl">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                className="w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                id="login-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full bg-muted rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {isLoggingIn
                ? <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                : <><span>Sign in</span><ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
