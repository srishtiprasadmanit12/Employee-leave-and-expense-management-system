import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { clearError, registerUser } from '../features/auth/authSlice'

const RegisterPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, token } = useSelector(state => state.auth)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    designation: ''
  })

  const onChange = event => {
    setFormData(prev => ({
      ...prev,
      [event.target.name]: event.target.value
    }))
  }

  const onSubmit = async event => {
    event.preventDefault()
    await dispatch(registerUser(formData))
  }

  useEffect(() => {
    if (token) {
      navigate('/profile', { replace: true })
    }

    return () => {
      dispatch(clearError())
    }
  }, [token, navigate, dispatch])

  return (
    <div className="auth-card">
      <h1>Create Account</h1>
      <p>Register as an employee to start using HRMS.</p>
      <form onSubmit={onSubmit} className="auth-form">
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          onChange={onChange}
          value={formData.name}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          onChange={onChange}
          value={formData.email}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          onChange={onChange}
          value={formData.password}
          minLength={6}
          required
        />

        <label htmlFor="department">Department</label>
        <input
          id="department"
          name="department"
          type="text"
          onChange={onChange}
          value={formData.department}
        />

        <label htmlFor="designation">Designation</label>
        <input
          id="designation"
          name="designation"
          type="text"
          onChange={onChange}
          value={formData.designation}
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p>
        Already registered? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}

export default RegisterPage
