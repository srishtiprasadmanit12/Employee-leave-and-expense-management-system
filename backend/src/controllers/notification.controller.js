import mongoose from 'mongoose'

import { Notification } from '../models/Notification.js'
import { clearCacheByPrefix, getCache, setCache } from '../utils/cache.js'
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js'

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

    const { pageNumber, limitNumber } = parsePagination({ page, limit })

    const filters = { userId: req.user._id }
    if (unreadOnly === 'true') {
      filters.isRead = false
    }

    const cacheKey = [
      'notifications:my',
      String(req.user._id),
      pageNumber,
      limitNumber,
      unreadOnly
    ].join(':')

    const cachedPayload = await getCache(cacheKey)
    if (cachedPayload) {
      return res.status(200).json(cachedPayload)
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filters)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      Notification.countDocuments(filters),
      Notification.countDocuments({ userId: req.user._id, isRead: false })
    ])

    const payload = {
      notifications: notifications.map(toNotificationResponse),
      unreadCount,
      pagination: buildPaginationMeta(pageNumber, limitNumber, total)
    }

    await setCache(cacheKey, payload)

    return res.status(200).json(payload)
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

    await clearCacheByPrefix(`notifications:my:${String(req.user._id)}:`)

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

    await clearCacheByPrefix(`notifications:my:${String(req.user._id)}:`)

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
