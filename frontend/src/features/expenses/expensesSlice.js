import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import api from '../../services/api'

const initialState = {
  myExpenses: [],
  reviewExpenses: [],
  loading: false,
  submitting: false,
  error: null
}

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (payload, { rejectWithValue }) => {
    try {
      const formData = new FormData()

      formData.append('amount', payload.amount)
      formData.append('category', payload.category)
      formData.append('description', payload.description)

      if (payload.receipt) {
        formData.append('receipt', payload.receipt)
      }

      const response = await api.post('/expenses', formData)
      return response.data.expense
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create expense'
      )
    }
  }
)

export const fetchMyExpenses = createAsyncThunk(
  'expenses/fetchMyExpenses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/expenses/my')
      return response.data.expenses
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch expenses'
      )
    }
  }
)

export const fetchExpensesForReview = createAsyncThunk(
  'expenses/fetchExpensesForReview',
  async (status = 'PENDING', { rejectWithValue }) => {
    try {
      const response = await api.get('/expenses/review', {
        params: { status }
      })
      return response.data.expenses
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch review expenses'
      )
    }
  }
)

export const approveExpense = createAsyncThunk(
  'expenses/approveExpense',
  async (expenseId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/expenses/${expenseId}/approve`)
      return response.data.expense
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to approve expense'
      )
    }
  }
)

export const rejectExpense = createAsyncThunk(
  'expenses/rejectExpense',
  async (expenseId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/expenses/${expenseId}/reject`)
      return response.data.expense
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reject expense'
      )
    }
  }
)

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearExpensesError: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMyExpenses.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyExpenses.fulfilled, (state, action) => {
        state.loading = false
        state.myExpenses = action.payload
      })
      .addCase(fetchMyExpenses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchExpensesForReview.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchExpensesForReview.fulfilled, (state, action) => {
        state.loading = false
        state.reviewExpenses = action.payload
      })
      .addCase(fetchExpensesForReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createExpense.pending, state => {
        state.submitting = true
        state.error = null
      })
      .addCase(createExpense.fulfilled, state => {
        state.submitting = false
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(approveExpense.pending, state => {
        state.submitting = true
        state.error = null
      })
      .addCase(approveExpense.fulfilled, state => {
        state.submitting = false
      })
      .addCase(approveExpense.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
      .addCase(rejectExpense.pending, state => {
        state.submitting = true
        state.error = null
      })
      .addCase(rejectExpense.fulfilled, state => {
        state.submitting = false
      })
      .addCase(rejectExpense.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
  }
})

export const { clearExpensesError } = expensesSlice.actions

export default expensesSlice.reducer
