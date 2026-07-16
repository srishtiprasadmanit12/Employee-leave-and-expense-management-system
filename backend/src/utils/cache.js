import { createClient } from 'redis'

import { env } from '../config/env.js'

let redisClient = null
let redisReady = false
let redisDisabled = false

export const initRedis = async () => {
  if (!env.redisUrl || redisClient || redisDisabled) {
    return redisClient
  }

  redisClient = createClient({
    url: env.redisUrl,
    socket: {
      connectTimeout: 2000,
      reconnectStrategy: () => false
    }
  })

  redisClient.on('error', error => {
    redisReady = false
    console.warn('Redis unavailable, continuing without cache:', error.message)
  })

  redisClient.on('ready', () => {
    redisReady = true
    console.log('Redis connected')
  })

  try {
    await redisClient.connect()
  } catch (error) {
    redisReady = false
    redisDisabled = true
    redisClient = null
    console.warn('Redis unavailable, continuing without cache:', error.message)
  }

  return redisClient
}

export const isRedisReady = () => redisReady && !!redisClient

export const getCache = async key => {
  if (!isRedisReady()) {
    return null
  }

  try {
    const value = await redisClient.get(key)
    if (!value) {
      return null
    }

    return JSON.parse(value)
  } catch {
    redisReady = false
    return null
  }
}

export const setCache = async (
  key,
  value,
  ttlSeconds = env.cacheTtlSeconds
) => {
  if (!isRedisReady()) {
    return
  }

  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttlSeconds
    })
  } catch {
    redisReady = false
  }
}

export const clearCacheByPrefix = async prefix => {
  if (!isRedisReady()) {
    return
  }

  try {
    const keys = []
    for await (const key of redisClient.scanIterator({ MATCH: `${prefix}*` })) {
      keys.push(key)
    }

    if (keys.length > 0) {
      await redisClient.del(keys)
    }
  } catch {
    redisReady = false
  }
}
