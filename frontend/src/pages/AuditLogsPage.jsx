import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import {
  clearAuditError,
  fetchAuditLogs,
  setAuditFilters
} from '../features/audit/auditSlice'

const AuditLogsPage = () => {
  const dispatch = useDispatch()
  const { items, loading, error, pagination, filters } = useSelector(
    state => state.audit
  )

  const [pageInput, setPageInput] = useState(1)

  const loadLogs = (page = 1) => {
    dispatch(
      fetchAuditLogs({
        page,
        limit: pagination.limit,
        action: filters.action || undefined,
        targetType: filters.targetType || undefined
      })
    )
  }

  useEffect(() => {
    setPageInput(pagination.page)
  }, [pagination.page])

  useEffect(() => {
    loadLogs(1)

    return () => {
      dispatch(clearAuditError())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters.action, filters.targetType])

  const onFilterChange = event => {
    const { name, value } = event.target
    dispatch(setAuditFilters({ [name]: value }))
  }

  const onPageSubmit = event => {
    event.preventDefault()
    const nextPage = Math.min(
      Math.max(Number(pageInput) || 1, 1),
      pagination.totalPages
    )
    loadLogs(nextPage)
  }

  return (
    <div className="module-layout">
      <header className="module-header">
        <div>
          <h1>Audit Logs</h1>
          <p>Track privileged actions across employees, leave, and expenses.</p>
        </div>
        <div className="module-links">
          <Link to="/dashboard" className="secondary-btn button-link">
            Dashboard
          </Link>
          <Link to="/profile" className="secondary-btn button-link">
            My Profile
          </Link>
        </div>
      </header>

      <section className="panel">
        <h2>Filters</h2>
        <div className="filters-grid">
          <select
            name="action"
            value={filters.action}
            onChange={onFilterChange}
          >
            <option value="">All Actions</option>
            <option value="USER_CREATED">USER_CREATED</option>
            <option value="USER_UPDATED">USER_UPDATED</option>
            <option value="USER_DELETED">USER_DELETED</option>
            <option value="LEAVE_APPROVED">LEAVE_APPROVED</option>
            <option value="LEAVE_REJECTED">LEAVE_REJECTED</option>
            <option value="EXPENSE_APPROVED">EXPENSE_APPROVED</option>
            <option value="EXPENSE_REJECTED">EXPENSE_REJECTED</option>
          </select>
          <select
            name="targetType"
            value={filters.targetType}
            onChange={onFilterChange}
          >
            <option value="">All Targets</option>
            <option value="USER">USER</option>
            <option value="LEAVE">LEAVE</option>
            <option value="EXPENSE">EXPENSE</option>
          </select>
        </div>
      </section>

      <section className="panel">
        <div className="employee-list-header">
          <h2>Activity</h2>
          <span className="pill">Total: {pagination.total}</span>
        </div>

        {loading ? <p>Loading audit logs...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <div className="table-wrap">
          <table className="module-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Target</th>
                <th>Performed By</th>
                <th>Details</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {items.map(log => (
                <tr key={log.id}>
                  <td>{log.action}</td>
                  <td>
                    {log.targetType} / {log.targetId}
                  </td>
                  <td>{log.performedBy}</td>
                  <td>
                    <pre className="audit-details">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && !loading ? <p>No audit logs found.</p> : null}

        <div className="pagination-bar">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => loadLogs(pagination.page - 1)}
            disabled={!pagination.hasPrevPage || loading}
          >
            Previous
          </button>

          <form onSubmit={onPageSubmit} className="jump-form">
            <label htmlFor="audit-page">Page</label>
            <input
              id="audit-page"
              type="number"
              min={1}
              max={pagination.totalPages}
              value={pageInput}
              onChange={event => setPageInput(event.target.value)}
            />
            <span>of {pagination.totalPages}</span>
            <button type="submit" className="secondary-btn">
              Go
            </button>
          </form>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => loadLogs(pagination.page + 1)}
            disabled={!pagination.hasNextPage || loading}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  )
}

export default AuditLogsPage
