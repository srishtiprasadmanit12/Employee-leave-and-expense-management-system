import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '../../services/api'

const initialState = {
  items: [],
  selectedEmployee: null,
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

export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/employees', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch employees'
      )
    }
  }
)

export const fetchEmployeeById = createAsyncThunk(
  'employees/fetchEmployeeById',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/employees/${employeeId}`)
      return response.data.user
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch employee'
      )
    }
  }
)

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/employees', payload)
      return response.data.user
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create employee'
      )
    }
  }
)

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ employeeId, payload }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/employees/${employeeId}`, payload)
      return response.data.user
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update employee'
      )
    }
  }
)

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (employeeId, { rejectWithValue }) => {
    try {
      await api.delete(`/employees/${employeeId}`)
      return employeeId
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete employee'
      )
    }
  }
)

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearEmployeesError: state => {
      state.error = null
    },
    setEmployeeFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      }
    },
    resetSelectedEmployee: state => {
      state.selectedEmployee = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchEmployees.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.users
        state.pagination = action.payload.pagination
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchEmployeeById.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedEmployee = action.payload
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createEmployee.pending, state => {
        state.submitting = true
        state.error = null
      })
      .addCase(createEmployee.fulfilled, state => {
        state.submitting = false
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(updateEmployee.pending, state => {
        state.submitting = true
        state.error = null
      })
      .addCase(updateEmployee.fulfilled, state => {
        state.submitting = false
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(deleteEmployee.pending, state => {
        state.submitting = true
        state.error = null
      })
      .addCase(deleteEmployee.fulfilled, state => {
        state.submitting = false
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
  }
})

export const {
  clearEmployeesError,
  resetSelectedEmployee,
  setEmployeeFilters
} = employeesSlice.actions

export default employeesSlice.reducer
