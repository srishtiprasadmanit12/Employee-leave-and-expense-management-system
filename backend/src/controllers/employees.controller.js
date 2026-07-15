import mongoose from 'mongoose'

import { ROLES } from '../middlewares/auth.middleware.js'
import { User } from '../models/User.js'
import { getCache, setCache } from '../utils/cache.js'
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js'

const toEmployeeResponse = user => ({
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

/**
 * List employees with role-based filtering
 * - Managers: see their team + other employees
 * - Employees: see colleagues (excludes ADMIN)
 * - Admins: see all (calls users endpoint instead)
 */
export const listEmployees = async (req, res) => {
  try {
    const {
      page = '1',
      limit = '10',
      search = '',
      department,
      designation,
      managerId,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query

    const { pageNumber, limitNumber } = parsePagination({ page, limit })

    const filters = { role: { $ne: ROLES.ADMIN } } // Exclude admins from employee view

    if (search) {
      const regex = new RegExp(search, 'i')
      filters.$or = [
        { name: regex },
        { email: regex },
        { department: regex },
        { designation: regex }
      ]
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
      'name',
      'email',
      'department',
      'designation',
      'createdAt'
    ]
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name'
    const safeSortOrder = sortOrder === 'asc' ? 1 : -1

    const cacheKey = [
      'employees:list',
      pageNumber,
      limitNumber,
      search,
      department || '',
      designation || '',
      managerId || '',
      safeSortBy,
      safeSortOrder
    ].join(':')

    const cachedPayload = await getCache(cacheKey)
    if (cachedPayload) {
      return res.status(200).json(cachedPayload)
    }

    const [employees, total] = await Promise.all([
      User.find(filters)
        .select('-password')
        .sort({ [safeSortBy]: safeSortOrder })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      User.countDocuments(filters)
    ])

    const payload = {
      employees: employees.map(toEmployeeResponse),
      pagination: buildPaginationMeta(pageNumber, limitNumber, total)
    }

    await setCache(cacheKey, payload)

    return res.status(200).json(payload)
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to fetch employees', error: error.message })
  }
}

/**
 * Get single employee by ID
 * Users can view their own profile or admins/managers can view others
 */
export const getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params
    const requestingUser = req.user

    if (!mongoose.isValidObjectId(employeeId)) {
      return res.status(400).json({ message: 'Invalid employeeId' })
    }

    const cacheKey = [
      'employees:detail',
      employeeId,
      String(requestingUser._id),
      requestingUser.role
    ].join(':')
    const cachedPayload = await getCache(cacheKey)

    if (cachedPayload) {
      return res.status(200).json(cachedPayload)
    }

    const employee = await User.findById(employeeId).select('-password')
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' })
    }

    // User can view their own profile, or manager/admin can view any non-admin
    const isOwnProfile = String(requestingUser._id) === String(employeeId)
    const isAdmin = requestingUser.role === ROLES.ADMIN
    const isManager = requestingUser.role === ROLES.MANAGER
    const isViewingNonAdmin = employee.role !== ROLES.ADMIN

    if (!isOwnProfile && !isAdmin && !isManager) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    if (!isOwnProfile && !isAdmin && isManager && !isViewingNonAdmin) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const payload = { employee: toEmployeeResponse(employee) }
    await setCache(cacheKey, payload)

    return res.status(200).json(payload)
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to fetch employee', error: error.message })
  }
}

/**
 * Get employee's team (for managers)
 * Returns all employees reporting to the authenticated user
 */
export const getEmployeeTeam = async (req, res) => {
  try {
    const requestingUser = req.user
    const {
      page = '1',
      limit = '10',
      search = '',
      department,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query

    if (requestingUser.role === ROLES.ADMIN) {
      return res.status(400).json({
        message: 'Admins should use /users endpoint'
      })
    }

    if (requestingUser.role !== ROLES.MANAGER) {
      return res.status(403).json({
        message: 'Only managers can view their team'
      })
    }

    const { pageNumber, limitNumber } = parsePagination({ page, limit })

    const filters = { managerId: requestingUser._id }

    if (search) {
      const regex = new RegExp(search, 'i')
      filters.$or = [{ name: regex }, { email: regex }, { designation: regex }]
    }

    if (department) {
      filters.department = new RegExp(`^${department}$`, 'i')
    }

    const allowedSortFields = ['name', 'email', 'department', 'designation']
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name'
    const safeSortOrder = sortOrder === 'asc' ? 1 : -1

    const cacheKey = [
      'employees:team',
      String(requestingUser._id),
      pageNumber,
      limitNumber,
      search,
      department || '',
      safeSortBy,
      safeSortOrder
    ].join(':')

    const cachedPayload = await getCache(cacheKey)
    if (cachedPayload) {
      return res.status(200).json(cachedPayload)
    }

    const [teamMembers, total] = await Promise.all([
      User.find(filters)
        .select('-password')
        .sort({ [safeSortBy]: safeSortOrder })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      User.countDocuments(filters)
    ])

    const payload = {
      teamMembers: teamMembers.map(toEmployeeResponse),
      pagination: buildPaginationMeta(pageNumber, limitNumber, total)
    }

    await setCache(cacheKey, payload)

    return res.status(200).json(payload)
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to fetch team', error: error.message })
  }
}
