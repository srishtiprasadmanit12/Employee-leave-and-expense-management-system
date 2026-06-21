import { AuditLog } from '../models/AuditLog.js'

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

  return AuditLog.create({
    action,
    performedBy,
    targetId,
    targetType,
    details,
    timestamp: new Date()
  })
}
