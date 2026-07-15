import jwt from 'jsonwebtoken'

export const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn })
}

export const extractTokenFromHeader = authHeader => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.split(' ')[1]
}

export const decodeToken = (token, secret) => {
  try {
    return jwt.verify(token, secret)
  } catch (error) {
    return null
  }
}
