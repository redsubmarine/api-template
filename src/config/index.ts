import dotenvExtended from 'dotenv-extended'
import dotenvParseVariables from 'dotenv-parse-variables'

const env = dotenvExtended.load({
  path: process.env.ENV_FILE,
  defaults: './config/.env.defaults',
  schema: './config/.env.schema',
  includeProcessEnv: true,
  silent: false,
  errorOnMissing: true,
  errorOnExtra: true,
})

const parseEnv = dotenvParseVariables(env)

type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly'

interface Config {
  privateKeyFile: string
  privateKeyPassphrase: string
  publicKeyFile: string
  mongo: {
    url: string
    useCreateIndex: boolean
    autoIndex: boolean
  }
  morganLogger: boolean
  morganBodyLogger: boolean
  exmplDevLogger: boolean
  loggerLevel: LogLevel
  localCacheTtl: number
  redisUrl: string
}

const config: Config = {
  privateKeyFile: parseEnv.PRIVATE_KEY_FILE as string,
  privateKeyPassphrase: parseEnv.PRIVATE_KEY_PASSPHRASE as string,
  publicKeyFile: parseEnv.PUBLIC_KEY_FILE as string,
  mongo: {
    url: parseEnv.MONGO_URL as string,
    useCreateIndex: parseEnv.MONGO_CREATE_INDEX as boolean,
    autoIndex: parseEnv.MONGO_AUTO_INDEX as boolean,
  },
  morganLogger: parseEnv.MORGAN_LOGGER as boolean,
  morganBodyLogger: parseEnv.MORGAN_BODY_LOGGER as boolean,
  exmplDevLogger: parseEnv.EXMPL_DEV_LOGGER as boolean,
  loggerLevel: parseEnv.LOGGER_LEVEL as LogLevel,
  localCacheTtl: parseEnv.LOCAL_CACHE_TTL as number,
  redisUrl: parseEnv.REDIS_URL as string,
}

export default config
