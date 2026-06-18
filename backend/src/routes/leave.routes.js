import express from 'express'

import {
  approveLeave,
  applyLeave,
  cancelLeave,
  getMyLeaves,
  listLeavesForReview,
  rejectLeave
} from '../controllers/leave.controller.js'
import { authorize, protect, ROLES } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.use(protect)

router.post('/', applyLeave)
router.get('/my', getMyLeaves)
router.patch('/:leaveId/cancel', authorize(ROLES.EMPLOYEE), cancelLeave)

router.get(
  '/review',
  authorize(ROLES.ADMIN, ROLES.MANAGER),
  listLeavesForReview
)
router.patch(
  '/:leaveId/approve',
  authorize(ROLES.ADMIN, ROLES.MANAGER),
  approveLeave
)
router.patch(
  '/:leaveId/reject',
  authorize(ROLES.ADMIN, ROLES.MANAGER),
  rejectLeave
)

export default router
