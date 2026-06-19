import express from 'express'

import {
  getEmployeeById,
  getEmployeeTeam,
  listEmployees
} from '../controllers/employees.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = express.Router()

// All employees routes require authentication
router.use(protect)

// List all employees (non-admin users)
router.get('/', listEmployees)

// Get authenticated user's team (managers only)
router.get('/team/my-team', getEmployeeTeam)

// Get specific employee by ID
router.get('/:employeeId', getEmployeeById)

export default router
