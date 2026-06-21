import { configureStore } from '@reduxjs/toolkit'

import auditReducer from '../features/audit/auditSlice'
import authReducer from '../features/auth/authSlice'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import employeesReducer from '../features/employees/employeesSlice'
import expensesReducer from '../features/expenses/expensesSlice'
import leavesReducer from '../features/leaves/leavesSlice'
import notificationsReducer from '../features/notifications/notificationsSlice'

export const store = configureStore({
  reducer: {
    audit: auditReducer,
    auth: authReducer,
    employees: employeesReducer,
    leaves: leavesReducer,
    expenses: expensesReducer,
    dashboard: dashboardReducer,
    notifications: notificationsReducer
  }
})
