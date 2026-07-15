import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { ROLES } from '../middlewares/auth.middleware.js'
import { clearCacheByPrefix } from '../utils/cache.js'
import { generateToken } from '../utils/jwt.js'

const createAuthResponse = user => {
  const token = generateToken(
    { userId: user._id, role: user.role },
    env.jwtSecret,
    env.jwtExpiresIn
  )

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      managerId: user.managerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
}

export const register = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, managerId } =
      req.body

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are required' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' })
    }

    if (role && role !== ROLES.EMPLOYEE) {
      return res.status(403).json({
        message: 'You cannot self-assign privileged roles during registration'
      })
    }

    const user = await User.create({
      name,
      email,
      password,
      role: ROLES.EMPLOYEE,
      department,
      designation,
      managerId
    })

    await Promise.all([
      clearCacheByPrefix('users:'),
      clearCacheByPrefix('employees:'),
      clearCacheByPrefix('dashboard:')
    ])

    return res.status(201).json(createAuthResponse(user))
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to register user', error: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    )
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    return res.status(200).json(createAuthResponse(user))
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to login', error: error.message })
  }
}

export const logout = async (_req, res) => {
  return res.status(200).json({ message: 'Logout successful' })
}

export const getProfile = async (req, res) => {
  return res.status(200).json({ user: req.user })
}

export const approveLeaveSample = async (req, res) => {
  return res.status(200).json({
    message: `Leave ${req.params.leaveId} approved by ${req.user.role}`
  })
}
