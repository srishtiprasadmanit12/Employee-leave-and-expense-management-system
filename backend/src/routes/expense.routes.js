import express from 'express'

import {
  approveExpense,
  createExpense,
  getMyExpenses,
  listExpensesForReview,
  rejectExpense
} from '../controllers/expense.controller.js'
import { attachUploadedReceiptUrl } from '../controllers/upload.controller.js'
import { authorize, protect, ROLES } from '../middlewares/auth.middleware.js'
import { receiptUpload } from '../middlewares/upload.middleware.js'

const router = express.Router()

router.use(protect)

router.post(
  '/',
  receiptUpload.single('receipt'),
  attachUploadedReceiptUrl,
  createExpense
)
router.get('/my', getMyExpenses)

router.get(
  '/review',
  authorize(ROLES.ADMIN, ROLES.MANAGER),
  listExpensesForReview
)
router.patch(
  '/:expenseId/approve',
  authorize(ROLES.ADMIN, ROLES.MANAGER),
  approveExpense
)
router.patch(
  '/:expenseId/reject',
  authorize(ROLES.ADMIN, ROLES.MANAGER),
  rejectExpense
)

export default router
