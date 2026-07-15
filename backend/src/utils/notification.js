import { Notification } from '../models/Notification.js'
import { clearCacheByPrefix } from './cache.js'

export const createNotification = async ({ userId, title, message }) => {
  if (!userId || !title || !message) {
    return null
  }

  const notification = await Notification.create({
    userId,
    title,
    message
  })

  await clearCacheByPrefix(`notifications:my:${String(userId)}:`)

  return notification
}
