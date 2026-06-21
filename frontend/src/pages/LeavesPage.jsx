import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import {
  applyLeave,
  approveLeave,
  cancelLeave,
  clearLeavesError,
  fetchLeavesForReview,
  fetchMyLeaves,
  rejectLeave
} from '../features/leaves/leavesSlice'

const initialForm = {
  leaveType: 'SICK',
  startDate: '',
  endDate: '',
  reason: ''
}

const LeavesPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { myLeaves, reviewLeaves, loading, submitting, error } = useSelector(
    state => state.leaves
  )

  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [formData, setFormData] = useState(initialForm)
  const [toast, setToast] = useState(null)

  const canReview = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  const loadData = () => {
    dispatch(fetchMyLeaves())

    if (canReview) {
      dispatch(fetchLeavesForReview(statusFilter))
    }
  }

  useEffect(() => {
    loadData()
    return () => {
      dispatch(clearLeavesError())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, canReview, statusFilter])

  useEffect(() => {
    if (!error) {
      return
    }

    setToast({ type: 'error', message: error })
  }, [error])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timer = setTimeout(() => {
      setToast(null)
    }, 2600)

    return () => clearTimeout(timer)
  }, [toast])

  const getStatusClassName = status => {
    if (status === 'APPROVED') {
      return 'status-badge status-approved'
    }

    if (status === 'REJECTED') {
      return 'status-badge status-rejected'
    }

    if (status === 'CANCELLED') {
      return 'status-badge status-cancelled'
    }

    return 'status-badge status-pending'
  }

  const onFormChange = event => {
    const { name, value } = event.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const onApply = async event => {
    event.preventDefault()
    const result = await dispatch(applyLeave(formData))

    if (applyLeave.fulfilled.match(result)) {
      setFormData(initialForm)
      setToast({ type: 'success', message: 'Leave applied successfully' })
      loadData()
    }
  }

  const onCancel = async leaveId => {
    const result = await dispatch(cancelLeave(leaveId))
    if (cancelLeave.fulfilled.match(result)) {
      setToast({ type: 'success', message: 'Leave cancelled' })
      loadData()
    }
  }

  const onApprove = async leaveId => {
    const result = await dispatch(approveLeave(leaveId))
    if (approveLeave.fulfilled.match(result)) {
      setToast({ type: 'success', message: 'Leave approved' })
      loadData()
    }
  }

  const onReject = async leaveId => {
    const result = await dispatch(rejectLeave(leaveId))
    if (rejectLeave.fulfilled.match(result)) {
      setToast({ type: 'success', message: 'Leave rejected' })
      loadData()
    }
  }

  return (
    <div className="module-layout">
      <header className="module-header">
        <div>
          <h1>Leave Management</h1>
          <p>Apply, cancel, and review leave requests based on your role.</p>
        </div>
        <div className="module-links">
          <Link to="/profile" className="secondary-btn button-link">
            My Profile
          </Link>
          <Link to="/expenses" className="secondary-btn button-link">
            Expenses
          </Link>
        </div>
      </header>

      {toast ? (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.message}
        </div>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}

      <section className="panel">
        <h2>Apply Leave</h2>
        <form className="module-form-grid" onSubmit={onApply}>
          <select
            name="leaveType"
            value={formData.leaveType}
            onChange={onFormChange}
          >
            <option value="SICK">SICK</option>
            <option value="CASUAL">CASUAL</option>
            <option value="EARNED">EARNED</option>
            <option value="UNPAID">UNPAID</option>
          </select>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={onFormChange}
            required
          />
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={onFormChange}
            required
          />
          <input
            type="text"
            name="reason"
            value={formData.reason}
            onChange={onFormChange}
            placeholder="Reason"
            required
          />
          <div className="module-form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Apply Leave'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>My Leave History</h2>
        {loading ? <p>Loading...</p> : null}
        <div className="table-wrap">
          <table className="module-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.map(item => (
                <tr key={item.id}>
                  <td>{item.leaveType}</td>
                  <td>{new Date(item.startDate).toLocaleDateString()}</td>
                  <td>{new Date(item.endDate).toLocaleDateString()}</td>
                  <td>{item.reason}</td>
                  <td>
                    <span className={getStatusClassName(item.status)}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    {user?.role === 'EMPLOYEE' && item.status === 'PENDING' ? (
                      <button type="button" onClick={() => onCancel(item.id)}>
                        Cancel
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {canReview ? (
        <section className="panel">
          <div className="module-section-head">
            <h2>Review Leave Requests</h2>
            <select
              value={statusFilter}
              onChange={event => setStatusFilter(event.target.value)}
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          <div className="table-wrap">
            <table className="module-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reviewLeaves.map(item => (
                  <tr key={item.id}>
                    <td>{item.employeeId}</td>
                    <td>{item.leaveType}</td>
                    <td>
                      {new Date(item.startDate).toLocaleDateString()} -{' '}
                      {new Date(item.endDate).toLocaleDateString()}
                    </td>
                    <td>{item.reason}</td>
                    <td>
                      <span className={getStatusClassName(item.status)}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.status === 'PENDING' ? (
                        <div className="row-actions">
                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => onApprove(item.id)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(item.id)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default LeavesPage
