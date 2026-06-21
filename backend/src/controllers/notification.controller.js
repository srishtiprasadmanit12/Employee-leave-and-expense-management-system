import mongoose from 'mongoose'

import { Notification } from '../models/Notification.js'

const toNotificationResponse = notification => ({
  id: notification._id,
  userId: notification.userId,
  title: notification.title,
  message: notification.message,
  isRead: notification.isRead,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt
})

export const getMyNotifications = async (req, res) => {
  try {
    const { page = '1', limit = '10', unreadOnly = 'false' } = req.query

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1)
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100)

    const filters = { userId: req.user._id }
    if (unreadOnly === 'true') {
      filters.isRead = false
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filters)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      Notification.countDocuments(filters),
      Notification.countDocuments({ userId: req.user._id, isRead: false })
    ])

    const totalPages = Math.max(Math.ceil(total / limitNumber), 1)

    return res.status(200).json({
      notifications: notifications.map(toNotificationResponse),
      unreadCount,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      }
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch notifications',
      error: error.message
    })
  }
}

export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params

    if (!mongoose.isValidObjectId(notificationId)) {
      return res.status(400).json({ message: 'Invalid notificationId' })
    }

    const notification = await Notification.findById(notificationId)
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    if (String(notification.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    notification.isRead = true
    await notification.save()

    return res.status(200).json({
      notification: toNotificationResponse(notification)
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to mark notification', error: error.message })
  }
}

export const markAllNotificationsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    )

    return res.status(200).json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to mark notifications',
      error: error.message
    })
  }
}
