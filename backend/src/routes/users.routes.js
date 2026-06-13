import express from 'express'

import {
  createUserByAdmin,
  deleteUserByAdmin,
  getUserById,
  listUsers,
  updateUserByAdmin
} from '../controllers/users.controller.js'
import { authorize, protect, ROLES } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.use(protect, authorize(ROLES.ADMIN))

router.get('/', listUsers)
router.get('/:userId', getUserById)
router.post('/', createUserByAdmin)
router.patch('/:userId', updateUserByAdmin)
router.delete('/:userId', deleteUserByAdmin)

export default router
