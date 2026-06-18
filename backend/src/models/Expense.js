import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'amount is required'],
      min: [0.01, 'amount must be greater than zero']
    },
    category: {
      type: String,
      required: [true, 'category is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'description is required'],
      trim: true
    },
    receiptUrl: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
)

export const Expense = mongoose.model('Expense', expenseSchema)
