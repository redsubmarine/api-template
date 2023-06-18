import db from '@exmpl/utils/db'
import logger from '@exmpl/utils/logger'
import { createServer } from '@exmpl/utils/server'
import cacheExternal from './utils/cache_external'

cacheExternal
  .open()
  .then(() => db.open())
  .then(() => createServer())
  .then((server) => {
    server.listen(3000, () => {
      logger.info('Server listening on port 3000')
    })
  })
  .catch((err) => {
    logger.error(`Error: ${err}`)
  })
