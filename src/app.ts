import logger from '@exmpl/utils/logger'
import { createServer } from './utils/server'

createServer()
  .then((server) => {
    server.listen(3000, () => {
      logger.info('Server listening on port 3000')
    })
  })
  .catch((err) => {
    logger.error(`Error: ${err}`)
  })