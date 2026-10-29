import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthGuard } from './AuthGuard'
import { RoleGuard } from './RoleGuard'
import { AppShell } from '@/components/layout/AppShell'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ProductsPage from '@/pages/ProductsPage'
import InventoryPage from '@/pages/InventoryPage'
import OrdersPage from '@/pages/OrdersPage'
import QuickOrderPage from '@/pages/QuickOrderPage'
import WhatsAppInboxPage from '@/pages/WhatsAppInboxPage'
import CustomersPage from '@/pages/CustomersPage'
import ReportsPage from '@/pages/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'
import EventSectionPage from '@/pages/EventSectionPage'

const router = createBrowserRouter([
  // Public: admin login page
  { path: '/login', element: <LoginPage /> },
  {
    // All authenticated routes
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/',               element: <DashboardPage /> },
          { path: '/products',       element: <ProductsPage /> },
          { path: '/products/import',element: <ProductsPage /> }, // Phase 4
          { path: '/products/new',   element: <ProductsPage /> }, // Phase 3
          { path: '/products/:id/edit', element: <ProductsPage /> }, // Phase 3
          { path: '/inventory',      element: <InventoryPage /> },
          { path: '/orders',         element: <OrdersPage /> },
          { path: '/orders/:id',     element: <OrdersPage /> }, // Phase 6
          { path: '/quick-order',    element: <QuickOrderPage /> },
          { path: '/whatsapp',       element: <WhatsAppInboxPage /> },
          { path: '/customers',      element: <CustomersPage /> },
          { path: '/customers/:id',  element: <CustomersPage /> }, // Phase 8
          // Reports & Settings — ops and above only
          {
            element: <RoleGuard required="admin" />,
            children: [
              { path: '/reports', element: <ReportsPage /> },
            ],
          },
          {
            element: <RoleGuard required="admin" />,
            children: [
              { path: '/settings', element: <SettingsPage /> },
              { path: '/event-section', element: <EventSectionPage /> },
            ],
          },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
