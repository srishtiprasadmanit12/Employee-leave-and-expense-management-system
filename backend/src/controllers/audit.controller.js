import mongoose from 'mongoose'

import { AuditLog } from '../models/AuditLog.js'

const toAuditResponse = log => ({
  id: log._id,
  action: log.action,
  performedBy: log.performedBy,
  targetId: log.targetId,
  targetType: log.targetType,
  details: log.details,
  timestamp: log.timestamp
})

export const listAuditLogs = async (req, res) => {
  try {
    const {
      page = '1',
      limit = '10',
      action,
      targetType,
      performedBy,
      targetId
    } = req.query

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1)
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100)

    const filters = {}

    if (action) {
      filters.action = action
    }

    if (targetType) {
      filters.targetType = targetType
    }

    if (performedBy && mongoose.isValidObjectId(performedBy)) {
      filters.performedBy = performedBy
    }

    if (targetId && mongoose.isValidObjectId(targetId)) {
      filters.targetId = targetId
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filters)
        .sort({ timestamp: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      AuditLog.countDocuments(filters)
    ])

    const totalPages = Math.max(Math.ceil(total / limitNumber), 1)

    return res.status(200).json({
      logs: logs.map(toAuditResponse),
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
    return res.status(500).json({
      message: 'Failed to fetch audit logs',
      error: error.message
    })
  }
}
