import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'message is required'],
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
)

notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })

export const Notification = mongoose.model('Notification', notificationSchema)
