import fs from 'fs'
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken'

import User from '@exmpl/api/models/user'
import config from '@exmpl/config'
import logger from '@exmpl/utils/logger'

export type ErrorResponse = { error: { type: string; message: string } }
export type AuthResponse = ErrorResponse | { userId: string }
export type CreateUserResponse = ErrorResponse | { userId: string }
export type LoginUserResponse = ErrorResponse | { token: string; userId: string; expireAt: Date }

const privateKey = fs.readFileSync(config.privateKeyFile)
const privateSecret = {
  key: privateKey,
  passphrase: config.privateKeyPassphrase,
}
const signOptions: SignOptions = {
  algorithm: 'RS256',
  expiresIn: '14d',
}

const publicKey = fs.readFileSync(config.publicKeyFile)
const verifyOptions: VerifyOptions = {
  algorithms: ['RS256'],
}

function auth(bearerToken: string): Promise<AuthResponse> {
  return new Promise((resolve, reject) => {
    const token = bearerToken.replace('Bearer ', '')
    jwt.verify(token, publicKey, verifyOptions, (err, decoded) => {
      if (err === null && decoded !== undefined) {
        const { userId } = decoded as { userId?: string; exp: number }
        if (userId) {
          resolve({ userId })
          return
        }
      }
      resolve({
        error: {
          type: 'unauthorized',
          message: 'Authentication Failed',
        },
      })
    })
  })
}

function createAuthToken(userId: string): Promise<{ token: string; expireAt: Date }> {
  return new Promise((resolve, reject) => {
    jwt.sign({ userId }, privateSecret, signOptions, (err, encoded) => {
      if (err === null && encoded !== undefined) {
        const expireAfter = 2 * 7 * 24 * 60 * 60 // 2 weeks
        const expireAt = new Date()
        expireAt.setSeconds(expireAt.getSeconds() + expireAfter)

        resolve({ token: encoded, expireAt })
      } else {
        reject(err)
      }
    })
  })
}

async function login(login: string, password: string): Promise<LoginUserResponse> {
  try {
    const user = await User.findOne({ email: login })
    if (!user) {
      return { error: { type: 'invalid_credentials', message: 'Invalid Login/Password' } }
    }

    const passwordMatch = await user.comparePassword(password)
    if (!passwordMatch) {
      return { error: { type: 'invalid_credentials', message: 'Invalid Login/Password' } }
    }

    const { token, expireAt } = await createAuthToken(user._id.toString())
    return { userId: user._id.toString(), token, expireAt }
  } catch (err) {
    logger.error(`login: ${err}`)
    return Promise.reject({ error: { type: 'internal_server_error', message: 'Internal Server Error' } })
  }
}

function createUser(email: string, password: string, name: string): Promise<CreateUserResponse> {
  return new Promise((resolve, reject) => {
    const user = new User({ email, password, name })
    user
      .save()
      .then((u) => {
        resolve({ userId: u._id.toString() })
      })
      .catch((err) => {
        if (err.code === 11000) {
          resolve({
            error: {
              type: 'account_already_exists',
              message: `${email} already exists`,
            },
          })
        } else {
          logger.error(`createUser: ${err}`)
          reject(err)
        }
      })
  })
}

export default { auth, createAuthToken, login, createUser }
