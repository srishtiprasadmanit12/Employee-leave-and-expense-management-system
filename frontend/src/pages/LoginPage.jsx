import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { clearError, loginUser } from '../features/auth/authSlice'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, token } = useSelector(state => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const onChange = event => {
    setFormData(prev => ({
      ...prev,
      [event.target.name]: event.target.value
    }))
  }

  const onSubmit = async event => {
    event.preventDefault()
    await dispatch(loginUser(formData))
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
      <h1>Welcome Back</h1>
      <p>Login to your HRMS account.</p>
      <form onSubmit={onSubmit} className="auth-form">
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
          required
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <p>
        New user? <Link to="/register">Create account</Link>
      </p>
    </div>
  )
}

export default LoginPage
