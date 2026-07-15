import app from './app.js'
import { connectDB } from './config/db.js'
import { env } from './config/env.js'
import { initRedis } from './utils/cache.js'

const startServer = async () => {
  await connectDB(env.mongoUri)
  await initRedis()

  app.listen(env.port, () => {
    console.log(`Backend server running on http://localhost:${env.port}`)
  })
}

startServer()
