import { AuditLog } from '../models/AuditLog.js'
import { clearCacheByPrefix } from './cache.js'

export const createAuditLog = async ({
  action,
  performedBy,
  targetId,
  targetType,
  details = {}
}) => {
  if (!action || !performedBy || !targetId || !targetType) {
    return null
  }

  const log = await AuditLog.create({
    action,
    performedBy,
    targetId,
    targetType,
    details,
    timestamp: new Date()
  })

  await clearCacheByPrefix('audit:')

  return log
}
