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
  morganLogger: boolean
  morganBodyLogger: boolean
  exmplDevLogger: boolean
  loggerLevel: LogLevel
}

const config: Config = {
  morganLogger: parseEnv.MORGAN_LOGGER as boolean,
  morganBodyLogger: parseEnv.MORGAN_BODY_LOGGER as boolean,
  exmplDevLogger: parseEnv.EXMPL_DEV_LOGGER as boolean,
  loggerLevel: parseEnv.LOGGER_LEVEL as LogLevel,
}

export default config
