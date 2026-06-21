import express from 'express'

import { listAuditLogs } from '../controllers/audit.controller.js'
import { authorize, protect, ROLES } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/', protect, authorize(ROLES.ADMIN), listAuditLogs)

export default router
