import mongoose from 'mongoose'

import { ROLES } from '../middlewares/auth.middleware.js'
import { User } from '../models/User.js'

const VALID_ROLES = Object.values(ROLES)

const toUserResponse = user => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  designation: user.designation,
  managerId: user.managerId,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
})

const validateRole = role => {
  if (!role) {
    return null
  }

  if (!VALID_ROLES.includes(role)) {
    return `Invalid role. Allowed roles: ${VALID_ROLES.join(', ')}`
  }

  return null
}

const validateManagerId = async managerId => {
  if (managerId === undefined) {
    return null
  }

  if (managerId === null || managerId === '') {
    return null
  }

  if (!mongoose.isValidObjectId(managerId)) {
    return 'Invalid managerId format'
  }

  const manager = await User.findById(managerId).select('_id role')
  if (!manager) {
    return 'Manager not found'
  }

  if (![ROLES.MANAGER, ROLES.ADMIN].includes(manager.role)) {
    return 'managerId must reference a MANAGER or ADMIN'
  }

  return null
}

export const listUsers = async (_req, res) => {
  try {
    const {
      page = '1',
      limit = '10',
      search = '',
      role,
      department,
      designation,
      managerId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = _req.query

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1)
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100)

    const filters = {}

    if (search) {
      const regex = new RegExp(search, 'i')
      filters.$or = [
        { name: regex },
        { email: regex },
        { department: regex },
        { designation: regex }
      ]
    }

    if (role && VALID_ROLES.includes(role)) {
      filters.role = role
    }

    if (department) {
      filters.department = new RegExp(`^${department}$`, 'i')
    }

    if (designation) {
      filters.designation = new RegExp(`^${designation}$`, 'i')
    }

    if (managerId && mongoose.isValidObjectId(managerId)) {
      filters.managerId = managerId
    }

    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'name',
      'email',
      'role'
    ]
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const safeSortOrder = sortOrder === 'asc' ? 1 : -1

    const [users, total] = await Promise.all([
      User.find(filters)
        .select('-password')
        .sort({ [safeSortBy]: safeSortOrder })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      User.countDocuments(filters)
    ])

    const totalPages = Math.max(Math.ceil(total / limitNumber), 1)

    return res.status(200).json({
      users: users.map(toUserResponse),
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      }
    })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to fetch users', error: error.message })
  }
}

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId' })
    }

    const user = await User.findById(userId).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json({ user: toUserResponse(user) })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to fetch user', error: error.message })
  }
}

export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, managerId } =
      req.body

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are required' })
    }

    const roleError = validateRole(role)
    if (roleError) {
      return res.status(400).json({ message: roleError })
    }

    const managerError = await validateManagerId(managerId)
    if (managerError) {
      return res.status(400).json({ message: managerError })
    }

    const normalizedEmail = email.toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' })
    }

    const createdUser = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: role || ROLES.EMPLOYEE,
      department,
      designation,
      managerId: managerId || null
    })

    const user = await User.findById(createdUser._id).select('-password')

    return res.status(201).json({ user: toUserResponse(user) })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to create user', error: error.message })
  }
}

export const updateUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params
    const { name, email, role, department, designation, managerId, password } =
      req.body

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId' })
    }

    const user = await User.findById(userId).select('+password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const roleError = validateRole(role)
    if (roleError) {
      return res.status(400).json({ message: roleError })
    }

    const managerError = await validateManagerId(managerId)
    if (managerError) {
      return res.status(400).json({ message: managerError })
    }

    if (managerId && String(managerId) === String(user._id)) {
      return res
        .status(400)
        .json({ message: 'User cannot be their own manager' })
    }

    if (name !== undefined) {
      user.name = name
    }

    if (email !== undefined) {
      user.email = email.toLowerCase()
    }

    if (role !== undefined) {
      user.role = role
    }

    if (department !== undefined) {
      user.department = department
    }

    if (designation !== undefined) {
      user.designation = designation
    }

    if (managerId !== undefined) {
      user.managerId = managerId || null
    }

    if (password !== undefined) {
      user.password = password
    }

    await user.save()

    const updatedUser = await User.findById(user._id).select('-password')

    return res.status(200).json({ user: toUserResponse(updatedUser) })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    return res
      .status(500)
      .json({ message: 'Failed to update user', error: error.message })
  }
}

export const deleteUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId' })
    }

    if (String(req.user._id) === String(userId)) {
      return res
        .status(400)
        .json({ message: 'Admin cannot delete their own account' })
    }

    const deletedUser = await User.findByIdAndDelete(userId)
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to delete user', error: error.message })
  }
}
