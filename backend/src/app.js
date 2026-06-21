import cors from 'cors'
import express from 'express'

import { env } from './config/env.js'
import authRoutes from './routes/auth.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import employeesRoutes from './routes/employees.routes.js'
import expenseRoutes from './routes/expense.routes.js'
import leaveRoutes from './routes/leave.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import usersRoutes from './routes/users.routes.js'

const app = express()

app.use(
  cors({
    origin: env.clientUrl
  })
)
app.use(express.json())

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', usersRoutes)
app.use('/api/v1/employees', employeesRoutes)
app.use('/api/v1/leaves', leaveRoutes)
app.use('/api/v1/expenses', expenseRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)
app.use('/api/v1/notifications', notificationRoutes)

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` })
})

export default app
