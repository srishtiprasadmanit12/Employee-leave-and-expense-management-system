import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '../../services/api'

const initialState = {
  items: [],
  unreadCount: 0,
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
  }
}

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/my', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch notifications'
      )
    }
  }
)

export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`)
      return response.data.notification
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark notification'
      )
    }
  }
)

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.patch('/notifications/read-all')
      return true
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark all notifications'
      )
    }
  }
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsError: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNotifications.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.notifications
        state.unreadCount = action.payload.unreadCount
        state.pagination = action.payload.pagination
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(markNotificationRead.pending, state => {
        state.submitting = true
        state.error = null
      })
      .addCase(markNotificationRead.fulfilled, state => {
        state.submitting = false
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(markAllNotificationsRead.pending, state => {
        state.submitting = true
        state.error = null
      })
      .addCase(markAllNotificationsRead.fulfilled, state => {
        state.submitting = false
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
  }
})

export const { clearNotificationsError } = notificationsSlice.actions

export default notificationsSlice.reducer
