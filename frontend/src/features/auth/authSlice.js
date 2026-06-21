import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '../../services/api'

const tokenFromStorage = localStorage.getItem('token')
const userFromStorage = localStorage.getItem('user')

const initialState = {
  token: tokenFromStorage || null,
  user: userFromStorage ? JSON.parse(userFromStorage) : null,
  loading: false,
  error: null
}

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', payload)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      )
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', payload)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me')
      return response.data.user
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch profile'
      )
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout')
      return true
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(registerUser.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(loginUser.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getProfile.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.user = null
        state.token = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      })
      .addCase(logoutUser.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(logoutUser.fulfilled, state => {
        state.loading = false
        state.user = null
        state.token = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError } = authSlice.actions

export default authSlice.reducer
