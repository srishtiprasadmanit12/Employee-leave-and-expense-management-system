import mongoose from 'mongoose'

import { ROLES } from '../middlewares/auth.middleware.js'
import { Leave } from '../models/Leave.js'
import { User } from '../models/User.js'

const isManager = user => user.role === ROLES.MANAGER

const toLeaveResponse = leave => ({
  id: leave._id,
  employeeId: leave.employeeId,
  leaveType: leave.leaveType,
  startDate: leave.startDate,
  endDate: leave.endDate,
  reason: leave.reason,
  status: leave.status,
  approvedBy: leave.approvedBy,
  createdAt: leave.createdAt,
  updatedAt: leave.updatedAt
})

const canManagerReviewEmployee = (managerId, employee) => {
  if (!employee || !employee.managerId) {
    return false
  }

  return String(employee.managerId) === String(managerId)
}

export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        message: 'leaveType, startDate, endDate and reason are required'
      })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid startDate or endDate' })
    }

    if (start > end) {
      return res
        .status(400)
        .json({ message: 'startDate must be before endDate' })
    }

    const leave = await Leave.create({
      employeeId: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      status: 'PENDING'
    })

    return res.status(201).json({ leave: toLeaveResponse(leave) })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to apply leave', error: error.message })
  }
}

export const cancelLeave = async (req, res) => {
  try {
    const { leaveId } = req.params

    if (!mongoose.isValidObjectId(leaveId)) {
      return res.status(400).json({ message: 'Invalid leaveId' })
    }

    const leave = await Leave.findById(leaveId)
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' })
    }

    if (String(leave.employeeId) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'Forbidden: not your leave request' })
    }

    if (leave.status !== 'PENDING') {
      return res
        .status(400)
        .json({ message: 'Only pending leave can be cancelled' })
    }

    leave.status = 'CANCELLED'
    leave.approvedBy = null
    await leave.save()

    return res.status(200).json({ leave: toLeaveResponse(leave) })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to cancel leave', error: error.message })
  }
}

export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user._id }).sort({
      createdAt: -1
    })

    return res
      .status(200)
      .json({ leaves: leaves.map(toLeaveResponse), total: leaves.length })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to fetch leave history', error: error.message })
  }
}

export const listLeavesForReview = async (req, res) => {
  try {
    const status = req.query.status || 'PENDING'
    const filters = { status }

    if (isManager(req.user)) {
      const teamMembers = await User.find({ managerId: req.user._id }).select(
        '_id'
      )
      filters.employeeId = { $in: teamMembers.map(member => member._id) }
    }

    const leaves = await Leave.find(filters).sort({ createdAt: -1 })

    return res
      .status(200)
      .json({ leaves: leaves.map(toLeaveResponse), total: leaves.length })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to fetch leave requests', error: error.message })
  }
}

const reviewLeave = async (req, res, nextStatus) => {
  const { leaveId } = req.params

  if (!mongoose.isValidObjectId(leaveId)) {
    return res.status(400).json({ message: 'Invalid leaveId' })
  }

  const leave = await Leave.findById(leaveId)
  if (!leave) {
    return res.status(404).json({ message: 'Leave not found' })
  }

  if (leave.status !== 'PENDING') {
    return res
      .status(400)
      .json({ message: 'Only pending leave can be reviewed' })
  }

  if (
    isManager(req.user) &&
    String(leave.employeeId) === String(req.user._id)
  ) {
    return res
      .status(400)
      .json({ message: 'Manager cannot approve/reject own leave' })
  }

  if (isManager(req.user)) {
    const employee = await User.findById(leave.employeeId).select('managerId')
    if (!canManagerReviewEmployee(req.user._id, employee)) {
      return res
        .status(403)
        .json({ message: 'Forbidden: not your team member' })
    }
  }

  leave.status = nextStatus
  leave.approvedBy = req.user._id
  await leave.save()

  return res.status(200).json({ leave: toLeaveResponse(leave) })
}

export const approveLeave = async (req, res) => {
  try {
    return await reviewLeave(req, res, 'APPROVED')
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to approve leave', error: error.message })
  }
}

export const rejectLeave = async (req, res) => {
  try {
    return await reviewLeave(req, res, 'REJECTED')
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to reject leave', error: error.message })
  }
}
