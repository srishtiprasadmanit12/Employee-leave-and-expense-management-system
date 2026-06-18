import mongoose from 'mongoose'

import { ROLES } from '../middlewares/auth.middleware.js'
import { Expense } from '../models/Expense.js'
import { User } from '../models/User.js'

const isManager = user => user.role === ROLES.MANAGER

const toExpenseResponse = expense => ({
  id: expense._id,
  employeeId: expense.employeeId,
  amount: expense.amount,
  category: expense.category,
  description: expense.description,
  receiptUrl: expense.receiptUrl,
  status: expense.status,
  approvedBy: expense.approvedBy,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt
})

const canManagerReviewEmployee = (managerId, employee) => {
  if (!employee || !employee.managerId) {
    return false
  }

  return String(employee.managerId) === String(managerId)
}

export const createExpense = async (req, res) => {
  try {
    const { amount, category, description, receiptUrl } = req.body

    if (!amount || !category || !description) {
      return res
        .status(400)
        .json({ message: 'amount, category and description are required' })
    }

    if (Number(amount) <= 0) {
      return res
        .status(400)
        .json({ message: 'amount must be greater than zero' })
    }

    const expense = await Expense.create({
      employeeId: req.user._id,
      amount,
      category,
      description,
      receiptUrl: receiptUrl || '',
      status: 'PENDING'
    })

    return res.status(201).json({ expense: toExpenseResponse(expense) })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to create expense', error: error.message })
  }
}

export const getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ employeeId: req.user._id }).sort({
      createdAt: -1
    })

    return res
      .status(200)
      .json({
        expenses: expenses.map(toExpenseResponse),
        total: expenses.length
      })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to fetch expenses', error: error.message })
  }
}

export const listExpensesForReview = async (req, res) => {
  try {
    const status = req.query.status || 'PENDING'
    const filters = { status }

    if (isManager(req.user)) {
      const teamMembers = await User.find({ managerId: req.user._id }).select(
        '_id'
      )
      filters.employeeId = { $in: teamMembers.map(member => member._id) }
    }

    const expenses = await Expense.find(filters).sort({ createdAt: -1 })

    return res
      .status(200)
      .json({
        expenses: expenses.map(toExpenseResponse),
        total: expenses.length
      })
  } catch (error) {
    return res
      .status(500)
      .json({
        message: 'Failed to fetch expense requests',
        error: error.message
      })
  }
}

const reviewExpense = async (req, res, nextStatus) => {
  const { expenseId } = req.params

  if (!mongoose.isValidObjectId(expenseId)) {
    return res.status(400).json({ message: 'Invalid expenseId' })
  }

  const expense = await Expense.findById(expenseId)
  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' })
  }

  if (expense.status !== 'PENDING') {
    return res
      .status(400)
      .json({ message: 'Only pending expense can be reviewed' })
  }

  if (
    isManager(req.user) &&
    String(expense.employeeId) === String(req.user._id)
  ) {
    return res
      .status(400)
      .json({ message: 'Manager cannot approve/reject own expense' })
  }

  if (isManager(req.user)) {
    const employee = await User.findById(expense.employeeId).select('managerId')
    if (!canManagerReviewEmployee(req.user._id, employee)) {
      return res
        .status(403)
        .json({ message: 'Forbidden: not your team member' })
    }
  }

  expense.status = nextStatus
  expense.approvedBy = req.user._id
  await expense.save()

  return res.status(200).json({ expense: toExpenseResponse(expense) })
}

export const approveExpense = async (req, res) => {
  try {
    return await reviewExpense(req, res, 'APPROVED')
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to approve expense', error: error.message })
  }
}

export const rejectExpense = async (req, res) => {
  try {
    return await reviewExpense(req, res, 'REJECTED')
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to reject expense', error: error.message })
  }
}
