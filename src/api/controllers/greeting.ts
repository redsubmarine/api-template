import { writeJsonResponse } from '@exmpl/utils/express'
import * as express from 'express'

export function hello(req: express.Request, res: express.Response) {
  const name = req.query.name || 'Stranger'
  const message = `Hello, ${name}!`

  res.json({ message })
}

export function goodbye(req: express.Request, res: express.Response) {
  const userId = res.locals.auth.userId
  writeJsonResponse(res, 200, { message: `Goodbye, ${userId}!` })
}
