import express from 'express'

import {
  approveLeaveSample,
  getProfile,
  login,
  logout,
  register
} from '../controllers/auth.controller.js'
import { authorize, protect, ROLES } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', protect, logout)
router.get('/me', protect, getProfile)
router.post(
  '/leave/:leaveId/approve',
  protect,
  authorize(ROLES.ADMIN, ROLES.MANAGER),
  approveLeaveSample
)

export default router
