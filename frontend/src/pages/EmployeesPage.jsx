import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import {
  clearEmployeesError,
  clearTeamMembers,
  fetchEmployeeById,
  fetchEmployees,
  fetchMyTeam,
  resetSelectedEmployee,
  setEmployeeFilters
} from '../features/employees/employeesSlice'

const EmployeesPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const {
    items,
    teamMembers,
    loading,
    error,
    pagination,
    filters,
    selectedEmployee
  } = useSelector(state => state.employees)

  const [pageInput, setPageInput] = useState(1)
  const [showTeam, setShowTeam] = useState(false)

  const isManager = useMemo(() => user?.role === 'MANAGER', [user?.role])

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
      dispatch(clearTeamMembers())
      dispatch(resetSelectedEmployee())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters.search, filters.role, filters.department])

  const onFilterChange = event => {
    const { name, value } = event.target
    dispatch(setEmployeeFilters({ [name]: value }))
  }

  const onLoadEmployee = employeeId => {
    dispatch(fetchEmployeeById(employeeId))
  }

  const onToggleMyTeam = () => {
    if (showTeam) {
      setShowTeam(false)
      return
    }

    setShowTeam(true)
    dispatch(
      fetchMyTeam({
        page: 1,
        limit: 50,
        search: filters.search || undefined,
        department: filters.department || undefined
      })
    )
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
          <h1>Employees</h1>
          <p>Employee directory available to all authenticated users.</p>
        </div>
        <div className="employees-header-links">
          <Link to="/profile" className="secondary-btn button-link">
            My Profile
          </Link>
          {isManager ? (
            <button
              type="button"
              className="secondary-btn"
              onClick={onToggleMyTeam}
            >
              {showTeam ? 'Hide My Team' : 'View My Team'}
            </button>
          ) : null}
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
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => onLoadEmployee(employee.id)}
                    >
                      View
                    </button>
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

      {selectedEmployee ? (
        <section className="panel">
          <h2>Employee Details</h2>
          <ul className="profile-list">
            <li>
              <span>Name</span>
              <strong>{selectedEmployee.name}</strong>
            </li>
            <li>
              <span>Email</span>
              <strong>{selectedEmployee.email}</strong>
            </li>
            <li>
              <span>Role</span>
              <strong>{selectedEmployee.role}</strong>
            </li>
            <li>
              <span>Department</span>
              <strong>{selectedEmployee.department || '-'}</strong>
            </li>
            <li>
              <span>Designation</span>
              <strong>{selectedEmployee.designation || '-'}</strong>
            </li>
          </ul>
        </section>
      ) : null}

      {isManager && showTeam ? (
        <section className="panel">
          <div className="employee-list-header">
            <h2>My Team</h2>
            <span className="pill">Members: {teamMembers.length}</span>
          </div>
          <div className="table-wrap">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Designation</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map(member => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>{member.role}</td>
                    <td>{member.department || '-'}</td>
                    <td>{member.designation || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {teamMembers.length === 0 && !loading ? (
            <p>No team members found.</p>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}

export default EmployeesPage
