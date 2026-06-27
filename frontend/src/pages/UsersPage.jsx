import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import {
  clearUsersError,
  createUser,
  deleteUser,
  fetchUserById,
  fetchUsers,
  resetSelectedUser,
  setUserFilters,
  updateUser
} from '../features/users/usersSlice'

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
  department: '',
  designation: '',
  managerId: ''
}

const UsersPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { items, loading, submitting, error, pagination, filters } =
    useSelector(state => state.users)

  const [formMode, setFormMode] = useState('create')
  const [editUserId, setEditUserId] = useState(null)
  const [pageInput, setPageInput] = useState(1)
  const [formData, setFormData] = useState(emptyForm)

  const managerOptions = useMemo(
    () =>
      items.filter(item => item.role === 'ADMIN' || item.role === 'MANAGER'),
    [items]
  )

  const loadUsers = (page = 1) => {
    dispatch(
      fetchUsers({
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
    loadUsers(1)
    return () => {
      dispatch(clearUsersError())
      dispatch(resetSelectedUser())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters.search, filters.role, filters.department])

  const onFilterChange = event => {
    const { name, value } = event.target
    dispatch(setUserFilters({ [name]: value }))
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

    const result = await dispatch(createUser(payload))
    if (createUser.fulfilled.match(result)) {
      setFormData(emptyForm)
      loadUsers(pagination.page)
    }
  }

  const onStartEdit = async userId => {
    setFormMode('edit')
    setEditUserId(userId)

    const result = await dispatch(fetchUserById(userId))
    if (fetchUserById.fulfilled.match(result)) {
      const selectedUser = result.payload
      setFormData({
        name: selectedUser.name || '',
        email: selectedUser.email || '',
        password: '',
        role: selectedUser.role || 'EMPLOYEE',
        department: selectedUser.department || '',
        designation: selectedUser.designation || '',
        managerId: selectedUser.managerId || ''
      })
    }
  }

  const onCancelEdit = () => {
    setFormMode('create')
    setEditUserId(null)
    setFormData(emptyForm)
    dispatch(resetSelectedUser())
  }

  const onUpdateSubmit = async event => {
    event.preventDefault()
    if (!editUserId) {
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

    const result = await dispatch(updateUser({ userId: editUserId, payload }))
    if (updateUser.fulfilled.match(result)) {
      onCancelEdit()
      loadUsers(pagination.page)
    }
  }

  const onDelete = async userId => {
    const confirmed = window.confirm('Delete this user? This cannot be undone.')
    if (!confirmed) {
      return
    }

    const result = await dispatch(deleteUser(userId))
    if (deleteUser.fulfilled.match(result)) {
      const targetPage =
        pagination.page > 1 && items.length === 1
          ? pagination.page - 1
          : pagination.page
      loadUsers(targetPage)
    }
  }

  const onPageSubmit = event => {
    event.preventDefault()
    const nextPage = Math.min(
      Math.max(Number(pageInput) || 1, 1),
      pagination.totalPages
    )
    loadUsers(nextPage)
  }

  return (
    <div className="employees-layout">
      <header className="employees-header">
        <div>
          <h1>User Management</h1>
          <p>Admin-only CRUD for the user module APIs.</p>
        </div>
        <div className="employees-header-links">
          <Link to="/profile" className="secondary-btn button-link">
            My Profile
          </Link>
          <Link to="/employees" className="secondary-btn button-link">
            Employees
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
        <h2>{formMode === 'create' ? 'Add User' : 'Update User'}</h2>
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
                  ? 'Add User'
                  : 'Update User'}
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
          <h2>User List</h2>
          <span className="pill">Total: {pagination.total}</span>
        </div>

        {loading ? <p>Loading users...</p> : null}
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
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.role}</td>
                  <td>{item.department || '-'}</td>
                  <td>{item.designation || '-'}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => onStartEdit(item.id)}
                      >
                        Edit
                      </button>
                      <button type="button" onClick={() => onDelete(item.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && !loading ? <p>No users found.</p> : null}

        <div className="pagination-bar">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => loadUsers(pagination.page - 1)}
            disabled={!pagination.hasPrevPage || loading}
          >
            Previous
          </button>

          <form onSubmit={onPageSubmit} className="jump-form">
            <label htmlFor="users-page-input">Page</label>
            <input
              id="users-page-input"
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
            onClick={() => loadUsers(pagination.page + 1)}
            disabled={!pagination.hasNextPage || loading}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  )
}

export default UsersPage
