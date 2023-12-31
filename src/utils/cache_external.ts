import * as r from 'redis'

import config from '@exmpl/config'
import logger from '@exmpl/utils/logger'

const redis: typeof r = config.redisUrl === 'redis-mock' ? require('redis-mock') : require('redis')

class Cache {
  private static _instance: Cache

  private _client?: r.RedisClientType

  private _initialConnection: boolean

  private constructor() {
    this._initialConnection = true
  }

  public static getInstance(): Cache {
    if (!Cache._instance) {
      Cache._instance = new Cache()
    }
    return Cache._instance
  }

  public open(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._client = redis.createClient({ url: config.redisUrl })
      const client = this._client!
      client.on('connect', () => {
        logger.info('Redis: connected')
      })
      client.on('ready', () => {
        if (this._initialConnection) {
          this._initialConnection = false
          resolve()
        }
        logger.info('Redis: ready')
      })
      client.on('reconnecting', () => {
        logger.info('Redis: reconnecting')
      })
      client.on('end', () => {
        logger.info('Redis: end')
      })
      client.on('disconnected', () => {
        logger.error('Redis: disconnected')
      })
      client.on('error', (err) => {
        logger.error(`Redis: error: ${err}`)
      })
      if (config.redisUrl !== 'redis-mock') {
        client.connect()
      }
    })
  }

  public close(): Promise<void> {
    return new Promise(async (resolve) => {
      await this._client!.quit()
      resolve()
    })
  }

  public setProp(key: string, value: string, expireAfter: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this._client!.setEx(key, expireAfter, value)
        if (result) {
          resolve()
        } else {
          reject(new Error('Redis connection error'))
        }
      } catch (err) {
        reject(new Error('Redis connection error'))
      }
    })
  }

  public getProp(key: string): Promise<string | undefined> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this._client!.get(key)
        resolve(result ?? undefined)
      } catch (err) {
        resolve(undefined)
      }
    })
  }
}

export default Cache.getInstance()
