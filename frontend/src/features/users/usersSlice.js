import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '../../services/api'

const initialState = {
  items: [],
  selectedUser: null,
  loading: false,
  submitting: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {
    search: '',
    role: '',
    department: ''
  }
}

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/users', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users'
      )
    }
  }
)

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`)
      return response.data.user
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user'
      )
    }
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/users', payload)
      return response.data.user
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create user'
      )
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, payload }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${userId}`, payload)
      return response.data.user
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user'
      )
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}`)
      return userId
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete user'
      )
    }
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersError: state => {
      state.error = null
    },
    setUserFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      }
    },
    resetSelectedUser: state => {
      state.selectedUser = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUsers.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.users
        state.pagination = action.payload.pagination
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchUserById.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedUser = action.payload
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createUser.pending, state => {
        state.submitting = true
        state.error = null
      })
      .addCase(createUser.fulfilled, state => {
        state.submitting = false
      })
      .addCase(createUser.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(updateUser.pending, state => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, state => {
        state.submitting = false
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(deleteUser.pending, state => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, state => {
        state.submitting = false
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
  }
})

export const { clearUsersError, resetSelectedUser, setUserFilters } =
  usersSlice.actions

export default usersSlice.reducer
