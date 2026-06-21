import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import AuditLogsPage from './pages/AuditLogsPage'
import DashboardPage from './pages/DashboardPage'
import ExpensesPage from './pages/ExpensesPage'
import LoginPage from './pages/LoginPage'
import EmployeesPage from './pages/EmployeesPage'
import LeavesPage from './pages/LeavesPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="gradient-bg" />
      <section className="content-wrap">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/leaves" element={<LeavesPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Routes>
      </section>
    </main>
  )
}

export default App
