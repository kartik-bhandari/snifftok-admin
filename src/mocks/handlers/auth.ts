import { http, HttpResponse, delay } from 'msw'
import { CREDENTIALS, MOCK_USERS } from '../seed'

// Simulate logged-in user per session (in-memory)
let currentUser = CREDENTIALS['admin@snifftok.com:admin123']

const latency = () => delay(Math.floor(Math.random() * 250) + 150)

export const authHandlers = [
  // GET /api/auth/me
  http.get('*/api/auth/me', async () => {
    await latency()
    return HttpResponse.json({ user: currentUser ?? null })
  }),

  // POST /api/auth/login
  http.post('*/api/auth/login', async ({ request }) => {
    await latency()
    const body = await request.json() as { email: string; password: string }
    const key = `${body.email}:${body.password}`
    const user = CREDENTIALS[key]

    if (!user) {
      return HttpResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 },
      )
    }

    currentUser = user
    return HttpResponse.json({ user })
  }),

  // POST /api/auth/logout
  http.post('*/api/auth/logout', async () => {
    await latency()
    currentUser = null as any
    return HttpResponse.json({ ok: true })
  }),

  // GET /api/admin/staff
  http.get('*/api/admin/staff', async () => {
    await latency()
    return HttpResponse.json(MOCK_USERS)
  }),
]
