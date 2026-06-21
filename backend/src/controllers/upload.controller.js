import path from 'path'

import { env } from '../config/env.js'

const toPublicReceiptUrl = filename => {
  const baseUrl = env.apiBaseUrl || `http://localhost:${env.port}`
  return `${baseUrl}/uploads/receipts/${filename}`
}

export const attachUploadedReceiptUrl = (req, _res, next) => {
  if (req.file) {
    req.body.receiptUrl = toPublicReceiptUrl(path.basename(req.file.path))
  }

  next()
}
