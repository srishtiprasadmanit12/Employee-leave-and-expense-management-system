import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import {
  clearEmployeesError,
  createEmployee,
  deleteEmployee,
  fetchEmployeeById,
  fetchEmployees,
  resetSelectedEmployee,
  setEmployeeFilters,
  updateEmployee
} from '../features/employees/employeesSlice'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
  department: '',
  designation: '',
  managerId: ''
}

const EmployeesPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const {
    items,
    loading,
    submitting,
    error,
    pagination,
    filters,
    selectedEmployee
  } = useSelector(state => state.employees)

  const [formMode, setFormMode] = useState('create')
  const [editEmployeeId, setEditEmployeeId] = useState(null)
  const [pageInput, setPageInput] = useState(1)
  const [formData, setFormData] = useState(emptyForm)

  const managerOptions = useMemo(
    () =>
      items.filter(item => item.role === 'ADMIN' || item.role === 'MANAGER'),
    [items]
  )

  const loadEmployees = (page = 1) => {
    dispatch(
      fetchEmployees({
        page,
        limit: pagination.limit,
        search: filters.search || undefined,
        role: filters.role || undefined,
        department: filters.department || undefined
      })
    )
  }

  useEffect(() => {
    setPageInput(pagination.page)
  }, [pagination.page])

  useEffect(() => {
    loadEmployees(1)
    return () => {
      dispatch(clearEmployeesError())
      dispatch(resetSelectedEmployee())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters.search, filters.role, filters.department])

  const onFilterChange = event => {
    const { name, value } = event.target
    dispatch(setEmployeeFilters({ [name]: value }))
  }

  const onFormChange = event => {
    const { name, value } = event.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const onCreateSubmit = async event => {
    event.preventDefault()
    const payload = {
      ...formData,
      managerId: formData.managerId || null
    }

    const result = await dispatch(createEmployee(payload))
    if (createEmployee.fulfilled.match(result)) {
      setFormData(emptyForm)
      loadEmployees(pagination.page)
    }
  }

  const onStartEdit = async employeeId => {
    setFormMode('edit')
    setEditEmployeeId(employeeId)

    const result = await dispatch(fetchEmployeeById(employeeId))
    if (fetchEmployeeById.fulfilled.match(result)) {
      const employee = result.payload
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        password: '',
        role: employee.role || 'EMPLOYEE',
        department: employee.department || '',
        designation: employee.designation || '',
        managerId: employee.managerId || ''
      })
    }
  }

  const onCancelEdit = () => {
    setFormMode('create')
    setEditEmployeeId(null)
    setFormData(emptyForm)
    dispatch(resetSelectedEmployee())
  }

  const onUpdateSubmit = async event => {
    event.preventDefault()
    if (!editEmployeeId) {
      return
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      designation: formData.designation,
      managerId: formData.managerId || null
    }

    if (formData.password) {
      payload.password = formData.password
    }

    const result = await dispatch(
      updateEmployee({ employeeId: editEmployeeId, payload })
    )
    if (updateEmployee.fulfilled.match(result)) {
      onCancelEdit()
      loadEmployees(pagination.page)
    }
  }

  const onDelete = async employeeId => {
    const confirmed = window.confirm(
      'Delete this employee? This cannot be undone.'
    )
    if (!confirmed) {
      return
    }

    const result = await dispatch(deleteEmployee(employeeId))
    if (deleteEmployee.fulfilled.match(result)) {
      const targetPage =
        pagination.page > 1 && items.length === 1
          ? pagination.page - 1
          : pagination.page
      loadEmployees(targetPage)
    }
  }

  const onPageSubmit = event => {
    event.preventDefault()
    const nextPage = Math.min(
      Math.max(Number(pageInput) || 1, 1),
      pagination.totalPages
    )
    loadEmployees(nextPage)
  }

  return (
    <div className="employees-layout">
      <header className="employees-header">
        <div>
          <h1>Employee Management</h1>
          <p>
            Admin controls for employee CRUD, pagination, search, and filtering.
          </p>
        </div>
        <div className="employees-header-links">
          <Link to="/profile" className="secondary-btn button-link">
            My Profile
          </Link>
          {user ? <span className="pill">{user.role}</span> : null}
        </div>
      </header>

      <section className="panel">
        <h2>Filters</h2>
        <div className="filters-grid">
          <input
            name="search"
            placeholder="Search name/email/department/designation"
            value={filters.search}
            onChange={onFilterChange}
          />
          <select name="role" value={filters.role} onChange={onFilterChange}>
            <option value="">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
          </select>
          <input
            name="department"
            placeholder="Filter by department"
            value={filters.department}
            onChange={onFilterChange}
          />
        </div>
      </section>

      <section className="panel">
        <h2>{formMode === 'create' ? 'Add Employee' : 'Update Employee'}</h2>
        <form
          className="employee-form-grid"
          onSubmit={formMode === 'create' ? onCreateSubmit : onUpdateSubmit}
        >
          <input
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={onFormChange}
            required
          />
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={onFormChange}
            required
          />
          <input
            name="password"
            placeholder={
              formMode === 'create' ? 'Password' : 'New password (optional)'
            }
            type="password"
            minLength={6}
            value={formData.password}
            onChange={onFormChange}
            required={formMode === 'create'}
          />
          <select name="role" value={formData.role} onChange={onFormChange}>
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="MANAGER">MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <input
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={onFormChange}
          />
          <input
            name="designation"
            placeholder="Designation"
            value={formData.designation}
            onChange={onFormChange}
          />
          <select
            name="managerId"
            value={formData.managerId}
            onChange={onFormChange}
          >
            <option value="">No Manager</option>
            {managerOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name} ({option.role})
              </option>
            ))}
          </select>

          <div className="employee-form-actions">
            <button type="submit" disabled={submitting}>
              {submitting
                ? 'Saving...'
                : formMode === 'create'
                  ? 'Add Employee'
                  : 'Update Employee'}
            </button>
            {formMode === 'edit' ? (
              <button
                type="button"
                className="secondary-btn"
                onClick={onCancelEdit}
                disabled={submitting}
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="employee-list-header">
          <h2>Employee List</h2>
          <span className="pill">Total: {pagination.total}</span>
        </div>

        {loading ? <p>Loading employees...</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <div className="table-wrap">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.role}</td>
                  <td>{employee.department || '-'}</td>
                  <td>{employee.designation || '-'}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => onStartEdit(employee.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(employee.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && !loading ? <p>No employees found.</p> : null}

        <div className="pagination-bar">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => loadEmployees(pagination.page - 1)}
            disabled={!pagination.hasPrevPage || loading}
          >
            Previous
          </button>

          <form onSubmit={onPageSubmit} className="jump-form">
            <label htmlFor="page-input">Page</label>
            <input
              id="page-input"
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
            onClick={() => loadEmployees(pagination.page + 1)}
            disabled={!pagination.hasNextPage || loading}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  )
}

export default EmployeesPage
