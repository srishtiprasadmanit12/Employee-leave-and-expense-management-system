import fs from 'fs'
import path from 'path'

import multer from 'multer'

import { env } from '../config/env.js'

const uploadDirectory = path.resolve(env.uploadsRootDir, 'receipts')
fs.mkdirSync(uploadDirectory, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase()
    const safeExt = ext || '.bin'
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`)
  }
})

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]

  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error('Only JPG, PNG, WEBP and PDF files are allowed'))
    return
  }

  cb(null, true)
}

export const receiptUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter
})
