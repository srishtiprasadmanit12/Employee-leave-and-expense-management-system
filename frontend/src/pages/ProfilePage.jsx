import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { getProfile, logoutUser } from '../features/auth/authSlice'

const ProfilePage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(getProfile())
  }, [dispatch])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login', { replace: true })
  }

  return (
    <div className="profile-card">
      <div className="profile-header">
        <div>
          <h1>My Profile</h1>
          <p>Authenticated user details from protected API.</p>
        </div>
        <div className="profile-actions">
          <Link to="/dashboard" className="secondary-btn button-link">
            Dashboard
          </Link>
          <Link to="/notifications" className="secondary-btn button-link">
            Notifications
          </Link>
          <Link to="/leaves" className="secondary-btn button-link">
            Leaves
          </Link>
          <Link to="/expenses" className="secondary-btn button-link">
            Expenses
          </Link>
          <Link to="/employees" className="secondary-btn button-link">
            Employees
          </Link>
          {user?.role === 'ADMIN' ? (
            <>
              <Link to="/users" className="secondary-btn button-link">
                Manage Users
              </Link>
              <Link to="/audit-logs" className="secondary-btn button-link">
                Audit Logs
              </Link>
            </>
          ) : null}
          <button
            onClick={handleLogout}
            className="secondary-btn"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? <p>Loading profile...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {user ? (
        <ul className="profile-list">
          <li>
            <span>Name</span>
            <strong>{user.name}</strong>
          </li>
          <li>
            <span>Email</span>
            <strong>{user.email}</strong>
          </li>
          <li>
            <span>Role</span>
            <strong>{user.role}</strong>
          </li>
          <li>
            <span>Department</span>
            <strong>{user.department || '-'}</strong>
          </li>
          <li>
            <span>Designation</span>
            <strong>{user.designation || '-'}</strong>
          </li>
        </ul>
      ) : null}
    </div>
  )
}

export default ProfilePage
