import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '../../services/api'

const initialState = {
  myLeaves: [],
  reviewLeaves: [],
  loading: false,
  submitting: false,
  error: null
}

export const applyLeave = createAsyncThunk(
  'leaves/applyLeave',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/leaves', payload)
      return response.data.leave
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to apply leave'
      )
    }
  }
)

export const fetchMyLeaves = createAsyncThunk(
  'leaves/fetchMyLeaves',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaves/my')
      return response.data.leaves
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch leave history'
      )
    }
  }
)

export const cancelLeave = createAsyncThunk(
  'leaves/cancelLeave',
  async (leaveId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/leaves/${leaveId}/cancel`)
      return response.data.leave
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to cancel leave'
      )
    }
  }
)

export const fetchLeavesForReview = createAsyncThunk(
  'leaves/fetchLeavesForReview',
  async (status = 'PENDING', { rejectWithValue }) => {
    try {
      const response = await api.get('/leaves/review', {
        params: { status }
      })
      return response.data.leaves
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch review leaves'
      )
    }
  }
)

export const approveLeave = createAsyncThunk(
  'leaves/approveLeave',
  async (leaveId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/leaves/${leaveId}/approve`)
      return response.data.leave
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to approve leave'
      )
    }
  }
)

export const rejectLeave = createAsyncThunk(
  'leaves/rejectLeave',
  async (leaveId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/leaves/${leaveId}/reject`)
      return response.data.leave
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reject leave'
      )
    }
  }
)

const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    clearLeavesError: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMyLeaves.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyLeaves.fulfilled, (state, action) => {
        state.loading = false
        state.myLeaves = action.payload
      })
      .addCase(fetchMyLeaves.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchLeavesForReview.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLeavesForReview.fulfilled, (state, action) => {
        state.loading = false
        state.reviewLeaves = action.payload
      })
      .addCase(fetchLeavesForReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(applyLeave.pending, state => {
        state.submitting = true
        state.error = null
      })
      .addCase(applyLeave.fulfilled, state => {
        state.submitting = false
      })
      .addCase(applyLeave.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(cancelLeave.pending, state => {
        state.submitting = true
        state.error = null
      })
      .addCase(cancelLeave.fulfilled, state => {
        state.submitting = false
      })
      .addCase(cancelLeave.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(approveLeave.pending, state => {
        state.submitting = true
        state.error = null
      })
      .addCase(approveLeave.fulfilled, state => {
        state.submitting = false
      })
      .addCase(approveLeave.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(rejectLeave.pending, state => {
        state.submitting = true
        state.error = null
      })
      .addCase(rejectLeave.fulfilled, state => {
        state.submitting = false
      })
      .addCase(rejectLeave.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
  }
})

export const { clearLeavesError } = leavesSlice.actions

export default leavesSlice.reducer
