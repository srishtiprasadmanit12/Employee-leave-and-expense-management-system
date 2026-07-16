import mongoose from 'mongoose'

export const connectDB = async mongoUri => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('MongoDB connected')
    return mongoose.connection
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    throw error
  }
}
