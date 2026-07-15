import { createClient } from 'redis'

import { env } from '../config/env.js'

let redisClient = null
let redisReady = false

export const initRedis = async () => {
  if (!env.redisUrl || redisClient) {
    return redisClient
  }

  redisClient = createClient({
    url: env.redisUrl
  })

  redisClient.on('error', error => {
    redisReady = false
    console.error('Redis error:', error.message)
  })

  redisClient.on('ready', () => {
    redisReady = true
    console.log('Redis connected')
  })

  try {
    await redisClient.connect()
  } catch (error) {
    redisReady = false
    console.warn('Redis unavailable, continuing without cache:', error.message)
  }

  return redisClient
}

export const isRedisReady = () => redisReady && !!redisClient

export const getCache = async key => {
  if (!isRedisReady()) {
    return null
  }

  const value = await redisClient.get(key)
  if (!value) {
    return null
  }

  return JSON.parse(value)
}

export const setCache = async (
  key,
  value,
  ttlSeconds = env.cacheTtlSeconds
) => {
  if (!isRedisReady()) {
    return
  }

  await redisClient.set(key, JSON.stringify(value), {
    EX: ttlSeconds
  })
}

export const clearCacheByPrefix = async prefix => {
  if (!isRedisReady()) {
    return
  }

  const keys = []
  for await (const key of redisClient.scanIterator({ MATCH: `${prefix}*` })) {
    keys.push(key)
  }

  if (keys.length > 0) {
    await redisClient.del(keys)
  }
}
