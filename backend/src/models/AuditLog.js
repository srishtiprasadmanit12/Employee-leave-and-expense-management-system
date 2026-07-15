import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'action is required'],
      trim: true,
      index: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    targetType: {
      type: String,
      required: [true, 'targetType is required'],
      trim: true,
      index: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: false }
)

auditLogSchema.index({ action: 1, timestamp: -1 })
auditLogSchema.index({ targetType: 1, timestamp: -1 })
auditLogSchema.index({ performedBy: 1, timestamp: -1 })
auditLogSchema.index({ targetId: 1, timestamp: -1 })

export const AuditLog = mongoose.model('AuditLog', auditLogSchema)
