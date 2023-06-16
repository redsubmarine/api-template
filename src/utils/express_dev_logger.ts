/* istanbul ignore file */
import logger from '@exmpl/utils/logger'
import express from 'express'

export const expressDevLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const startHrTime = process.hrtime()

  logger.http(`Request: ${req.method} ${req.url} at ${new Date().toUTCString()}, User-Agent: ${req.get('user-agent')}`)
  logger.http(`Request Body: ${JSON.stringify(req.body)}`)

  const [oldWrite, oldEnd] = [res.write, res.end]
  const chunks: Buffer[] = []
  ;(res.write as unknown) = function (chunk: any) {
    chunks.push(Buffer.from(chunk))
    ;(oldWrite as Function).apply(res, arguments)
  }

  res.end = function (chunk: any) {
    if (chunk) {
      chunks.push(Buffer.from(chunk))
    }

    const elapsedHrTime = process.hrtime(startHrTime)
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6

    logger.http(`Response ${res.statusCode} ${elapsedTimeInMs.toFixed(3)} ms`)

    const body = Buffer.concat(chunks).toString('utf8')
    logger.http(`Response Body: ${body}`)
    ;(oldEnd as Function).apply(res, arguments)
    return this
  }

  next()
}
