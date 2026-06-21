import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '../../services/api'

const initialState = {
  data: null,
  loading: false,
  error: null
}

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard')
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load dashboard'
      )
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchDashboard.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearDashboardError } = dashboardSlice.actions

export default dashboardSlice.reducer
