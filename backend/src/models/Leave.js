import mongoose from 'mongoose'

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    leaveType: {
      type: String,
      required: [true, 'leaveType is required'],
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'startDate is required']
    },
    endDate: {
      type: Date,
      required: [true, 'endDate is required']
    },
    reason: {
      type: String,
      required: [true, 'reason is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
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

export const Leave = mongoose.model('Leave', leaveSchema)
