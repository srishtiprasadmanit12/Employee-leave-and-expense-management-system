import express from 'express'

import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from '../controllers/notification.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.use(protect)

router.get('/my', getMyNotifications)
router.patch('/read-all', markAllNotificationsRead)
router.patch('/:notificationId/read', markNotificationRead)

export default router
