import app from './app.js'
import { connectDB } from './config/db.js'
import { env } from './config/env.js'
import { initRedis } from './utils/cache.js'
let isConnected = false

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('MongoDB already connected')
    return
  }
  try {
    await connectDB(env.mongoUri)
    isConnected = true
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
  }
}
const startServer = async () => {
  await connectDB(env.mongoUri)
  await initRedis()

 app.listen(env.port, () => {
    console.log(`Backend server running on http://localhost:${env.port}`)
  }) 
}

startServer()
