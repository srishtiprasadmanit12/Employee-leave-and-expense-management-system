import mongoose from 'mongoose'

import { AuditLog } from '../models/AuditLog.js'
import { getCache, setCache } from '../utils/cache.js'
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js'

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

    const { pageNumber, limitNumber } = parsePagination({ page, limit })

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

    const cacheKey = [
      'audit:list',
      pageNumber,
      limitNumber,
      action || '',
      targetType || '',
      performedBy || '',
      targetId || ''
    ].join(':')

    const cachedPayload = await getCache(cacheKey)
    if (cachedPayload) {
      return res.status(200).json(cachedPayload)
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filters)
        .sort({ timestamp: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      AuditLog.countDocuments(filters)
    ])

    const payload = {
      logs: logs.map(toAuditResponse),
      pagination: buildPaginationMeta(pageNumber, limitNumber, total)
    }

    await setCache(cacheKey, payload)

    return res.status(200).json(payload)
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch audit logs',
      error: error.message
    })
  }
}
