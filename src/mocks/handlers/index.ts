import { authHandlers } from './auth'
import { productHandlers } from './products'
import { categoryHandlers } from './categories'
import { orderHandlers } from './orders'
import { dashboardHandlers } from './dashboard'

export const handlers = [
  ...authHandlers,
  ...categoryHandlers,
  ...productHandlers,
  ...orderHandlers,
  ...dashboardHandlers,
]
