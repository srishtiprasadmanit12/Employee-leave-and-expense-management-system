import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import {
  clearDashboardError,
  fetchDashboard
} from '../features/dashboard/dashboardSlice'

const DashboardPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { data, loading, error } = useSelector(state => state.dashboard)

  useEffect(() => {
    dispatch(fetchDashboard())

    return () => {
      dispatch(clearDashboardError())
    }
  }, [dispatch])

  const cards = data?.cards || {}
  const cardEntries = Object.entries(cards)

  return (
    <div className="module-layout">
      <header className="module-header">
        <div>
          <h1>Dashboard</h1>
          <p>Role-based analytics for leave and expense workflows.</p>
        </div>
        <div className="module-links">
          <Link to="/profile" className="secondary-btn button-link">
            My Profile
          </Link>
          <Link to="/employees" className="secondary-btn button-link">
            Employees
          </Link>
          {user?.role === 'ADMIN' ? (
            <Link to="/users" className="secondary-btn button-link">
              Manage Users
            </Link>
          ) : null}
          <Link to="/notifications" className="secondary-btn button-link">
            Notifications
          </Link>
        </div>
      </header>

      {loading ? <p>Loading dashboard...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <section className="panel">
        <h2>{data?.role || 'User'} Insights</h2>
        <div className="stats-grid">
          {cardEntries.map(([key, value]) => (
            <article key={key} className="stat-card">
              <p>{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Leave Status Breakdown</h2>
        <ul className="status-list">
          {Object.entries(data?.leaveStatus || {}).map(([status, count]) => (
            <li key={status}>
              <span className={`status-badge status-${status.toLowerCase()}`}>
                {status}
              </span>
              <strong>{count}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Expense Status Breakdown</h2>
        <ul className="status-list">
          {Object.entries(data?.expenseStatus || {}).map(([status, count]) => (
            <li key={status}>
              <span className={`status-badge status-${status.toLowerCase()}`}>
                {status}
              </span>
              <strong>{count}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default DashboardPage
