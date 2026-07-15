import jwt from 'jsonwebtoken'
import { Expense } from '../models/Expense.js'
import { Leave } from '../models/Leave.js'
import { User } from '../models/User.js'
import { ROLES } from '../middlewares/auth.middleware.js'
import { getCache, setCache } from '../utils/cache.js'
import { env } from '../config/env.js'
import { extractTokenFromHeader, decodeToken } from '../utils/jwt.js'

const toStatusMap = rows => {
  return rows.reduce((acc, row) => {
    acc[row._id] = row.count
    return acc
  }, {})
}

const getStatusCounts = async (Model, matchFilter) => {
  const rows = await Model.aggregate([
    { $match: matchFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ])

  return toStatusMap(rows)
}

export const getDashboard = async (req, res) => {
  try {
    // Extract and validate token
    const authHeader = req.headers.authorization || ''
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' })
    }

    const decoded = decodeToken(token, env.jwtSecret)

    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' })
    }

    const userId = decoded.userId
    const { role } = req.user

    // Validate userId from token matches req.user
    if (String(userId) !== String(req.user._id)) {
      return res.status(401).json({ message: 'Unauthorized: Token mismatch' })
    }

    const cacheKey = `dashboard:${role}:${String(userId)}`
    const cachedPayload = await getCache(cacheKey)

    if (cachedPayload) {
      return res.status(200).json(cachedPayload)
    }

    if (role === ROLES.ADMIN) {
      const [employeeCountRows, leaveStatus, expenseStatus] = await Promise.all(
        [
          User.aggregate([
            { $match: { role: ROLES.EMPLOYEE } },
            { $group: { _id: null, count: { $sum: 1 } } }
          ]),
          getStatusCounts(Leave, {}),
          getStatusCounts(Expense, {})
        ]
      )

      const totalEmployees = employeeCountRows[0]?.count || 0

      const payload = {
        role,
        cards: {
          totalEmployees,
          pendingLeaves: leaveStatus.PENDING || 0,
          pendingExpenses: expenseStatus.PENDING || 0,
          approvedRequests:
            (leaveStatus.APPROVED || 0) + (expenseStatus.APPROVED || 0)
        },
        leaveStatus,
        expenseStatus
      }

      await setCache(cacheKey, payload)

      return res.status(200).json(payload)
    }

    if (role === ROLES.MANAGER) {
      const teamMembers = await User.find({ managerId: userId }).select('_id')
      const teamMemberIds = teamMembers.map(member => member._id)

      const [leaveStatus, expenseStatus] = await Promise.all([
        getStatusCounts(Leave, { employeeId: { $in: teamMemberIds } }),
        getStatusCounts(Expense, { employeeId: { $in: teamMemberIds } })
      ])

      const payload = {
        role,
        cards: {
          teamMembers: teamMemberIds.length,
          teamPendingLeaves: leaveStatus.PENDING || 0,
          teamPendingExpenses: expenseStatus.PENDING || 0,
          teamApprovedRequests:
            (leaveStatus.APPROVED || 0) + (expenseStatus.APPROVED || 0)
        },
        leaveStatus,
        expenseStatus
      }

      await setCache(cacheKey, payload)

      return res.status(200).json(payload)
    }

    const [leaveStatus, expenseStatus] = await Promise.all([
      getStatusCounts(Leave, { employeeId: userId }),
      getStatusCounts(Expense, { employeeId: userId })
    ])

    const payload = {
      role,
      cards: {
        myPendingLeaves: leaveStatus.PENDING || 0,
        myPendingExpenses: expenseStatus.PENDING || 0,
        myApprovedRequests:
          (leaveStatus.APPROVED || 0) + (expenseStatus.APPROVED || 0)
      },
      leaveStatus,
      expenseStatus
    }

    await setCache(cacheKey, payload)

    return res.status(200).json(payload)
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to load dashboard', error: error.message })
  }
}
