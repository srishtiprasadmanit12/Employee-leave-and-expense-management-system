import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import {
  approveExpense,
  clearExpensesError,
  createExpense,
  fetchExpensesForReview,
  fetchMyExpenses,
  rejectExpense
} from '../features/expenses/expensesSlice'

const initialForm = {
  amount: '',
  category: '',
  description: '',
  receipt: null
}

const ExpensesPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { myExpenses, reviewExpenses, loading, submitting, error } =
    useSelector(state => state.expenses)

  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [formData, setFormData] = useState(initialForm)
  const [toast, setToast] = useState(null)

  const canReview = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  const loadData = () => {
    dispatch(fetchMyExpenses())

    if (canReview) {
      dispatch(fetchExpensesForReview(statusFilter))
    }
  }

  useEffect(() => {
    loadData()
    return () => {
      dispatch(clearExpensesError())
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

    return 'status-badge status-pending'
  }

  const onFormChange = event => {
    const { name, value, files } = event.target

    if (name === 'receipt') {
      setFormData(prev => ({
        ...prev,
        receipt: files?.[0] || null
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const onCreate = async event => {
    event.preventDefault()
    const payload = {
      ...formData,
      amount: Number(formData.amount)
    }

    const result = await dispatch(createExpense(payload))
    if (createExpense.fulfilled.match(result)) {
      setFormData(initialForm)
      setToast({ type: 'success', message: 'Expense created successfully' })
      loadData()
    }
  }

  const onApprove = async expenseId => {
    const result = await dispatch(approveExpense(expenseId))
    if (approveExpense.fulfilled.match(result)) {
      setToast({ type: 'success', message: 'Expense approved' })
      loadData()
    }
  }

  const onReject = async expenseId => {
    const result = await dispatch(rejectExpense(expenseId))
    if (rejectExpense.fulfilled.match(result)) {
      setToast({ type: 'success', message: 'Expense rejected' })
      loadData()
    }
  }

  return (
    <div className="module-layout">
      <header className="module-header">
        <div>
          <h1>Expense Management</h1>
          <p>Create expenses and review requests based on your role.</p>
        </div>
        <div className="module-links">
          <Link to="/profile" className="secondary-btn button-link">
            My Profile
          </Link>
          <Link to="/leaves" className="secondary-btn button-link">
            Leaves
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
        <h2>Create Expense</h2>
        <form className="module-form-grid" onSubmit={onCreate}>
          <input
            type="number"
            min="0.01"
            step="0.01"
            name="amount"
            value={formData.amount}
            onChange={onFormChange}
            placeholder="Amount"
            required
          />
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={onFormChange}
            placeholder="Category"
            required
          />
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={onFormChange}
            placeholder="Description"
            required
          />
          <input
            type="file"
            name="receipt"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={onFormChange}
          />
          <p className="helper-text">
            Optional. Allowed: JPG, PNG, WEBP, PDF up to 5 MB.
          </p>
          <div className="module-form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Create Expense'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>My Expenses</h2>
        {loading ? <p>Loading...</p> : null}
        <div className="table-wrap">
          <table className="module-table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Category</th>
                <th>Description</th>
                <th>Receipt</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myExpenses.map(item => (
                <tr key={item.id}>
                  <td>{item.amount}</td>
                  <td>{item.category}</td>
                  <td>{item.description}</td>
                  <td>
                    {item.receiptUrl ? (
                      <a
                        href={item.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <span className={getStatusClassName(item.status)}>
                      {item.status}
                    </span>
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
            <h2>Review Expense Requests</h2>
            <select
              value={statusFilter}
              onChange={event => setStatusFilter(event.target.value)}
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
          <div className="table-wrap">
            <table className="module-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reviewExpenses.map(item => (
                  <tr key={item.id}>
                    <td>{item.employeeId}</td>
                    <td>{item.amount}</td>
                    <td>{item.category}</td>
                    <td>{item.description}</td>
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

export default ExpensesPage
