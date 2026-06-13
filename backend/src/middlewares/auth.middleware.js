import jwt from 'jsonwebtoken'

import { env } from '../config/env.js'
import { User } from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || ''

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, env.jwtSecret)

    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
