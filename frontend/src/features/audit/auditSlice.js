import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '../../services/api'

const initialState = {
  items: [],
  loading: false,
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
    action: '',
    targetType: ''
  }
}

export const fetchAuditLogs = createAsyncThunk(
  'audit/fetchAuditLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/audit-logs', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch audit logs'
      )
    }
  }
)

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    clearAuditError: state => {
      state.error = null
    },
    setAuditFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAuditLogs.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.logs
        state.pagination = action.payload.pagination
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearAuditError, setAuditFilters } = auditSlice.actions

export default auditSlice.reducer
