import * as express from 'express'

import UserService from '@exmpl/api/services/user'
import { writeJsonResponse } from '@exmpl/utils/express'

export function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization!

  UserService.auth(token)
    .then((response) => {
      if (!(response as any).error) {
        res.locals.auth = {
          userId: (response as { userId: string }).userId,
        }
        next()
      } else {
        writeJsonResponse(res, 401, response)
      }
    })
    .catch((err) => {
      writeJsonResponse(res, 500, { error: { type: 'internal_server_error', message: 'Internal Server Error' } })
    })
}
