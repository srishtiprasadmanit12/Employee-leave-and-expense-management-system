import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '../../services/api'

const initialState = {
  items: [],
  teamMembers: [],
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
      return {
        employees: response.data.employees || [],
        pagination: response.data.pagination
      }
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
      return response.data.employee
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch employee'
      )
    }
  }
)

export const fetchMyTeam = createAsyncThunk(
  'employees/fetchMyTeam',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/employees/team/my-team', { params })
      return response.data.teamMembers || []
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch team members'
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
    },
    clearTeamMembers: state => {
      state.teamMembers = []
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
        state.items = action.payload.employees
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
      .addCase(fetchMyTeam.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyTeam.fulfilled, (state, action) => {
        state.loading = false
        state.teamMembers = action.payload
      })
      .addCase(fetchMyTeam.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const {
  clearEmployeesError,
  clearTeamMembers,
  resetSelectedEmployee,
  setEmployeeFilters
} = employeesSlice.actions

export default employeesSlice.reducer
