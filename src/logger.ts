export enum LogLevel {
    None = 'none',
    Error = 'error',
    Warn = 'warn',
    Info = 'info',
    Debug = 'debug',
    Silly = 'silly'
}

let logLevel: LogLevel = LogLevel.Info
let logSilly = false
let logDebug = false
let logInfo = false
let logWarn = false
let logError = false

export function setLogLevel(newLogLevel: LogLevel) {
    logLevel = newLogLevel

    switch (logLevel) {
        case LogLevel.Silly:
            logSilly = true
            logDebug = true
            logInfo = true
            logWarn = true
            logError = true
            break

        case LogLevel.Debug:
            logSilly = false
            logDebug = true
            logInfo = true
            logWarn = true
            logError = true
            break

        case LogLevel.Info:
            logSilly = false
            logDebug = false
            logInfo = true
            logWarn = true
            logError = true
            break

        case LogLevel.Warn:
            logSilly = false
            logDebug = false
            logInfo = false
            logWarn = true
            logError = true
            break

        case LogLevel.Error:
            logSilly = false
            logDebug = false
            logInfo = false
            logWarn = false
            logError = true
            break

        default:
        case LogLevel.None:
            logSilly = false
            logDebug = false
            logInfo = false
            logWarn = false
            logError = false
            break
    }
}

switch (process.env.LOG_LEVEL) {
    case 'Silly':
    case 'silly':
    case 'SILLY':
        logLevel = LogLevel.Silly
        break
    case 'Debug':
    case 'debug':
    case 'DEBUG':
        logLevel = LogLevel.Debug
        break
    default:
    case 'Info':
    case 'info':
    case 'INFO':
        logLevel = LogLevel.Info
        break
    case 'Warn':
    case 'warn':
    case 'WARN':
    case 'Warning':
    case 'warning':
    case 'WARNING':
        logLevel = LogLevel.Warn
        break
    case 'Error':
    case 'error':
    case 'ERROR':
        logLevel = LogLevel.Error
        break
    case 'None':
    case 'none':
    case 'NONE':
        logLevel = LogLevel.None
        break
}

setLogLevel(logLevel)

export interface ILogObject {
    message: string
    [key: string]: any
}

export interface ILogger {
    silly: (logObject: ILogObject) => void
    debug: (logObject: ILogObject) => void
    info: (logObject: ILogObject) => void
    warn: (logObject: ILogObject) => void
    error: (logObject: ILogObject) => void
}

export let logger: ILogger = {
    silly: (logObject: ILogObject) => {
        if (logSilly && activeLogger != undefined) {
            ;(logObject as any).level = LogLevel.Silly
            if (logObjectTransform != undefined) {
                logObject = logObjectTransform(logObject)
            }
            activeLogger.silly(logObject)
        }
    },
    debug: (logObject: ILogObject) => {
        if (logDebug && activeLogger != undefined) {
            ;(logObject as any).level = LogLevel.Debug
            if (logObjectTransform != undefined) {
                logObject = logObjectTransform(logObject)
            }
            activeLogger.debug(logObject)
        }
    },
    info: (logObject: ILogObject) => {
        if (logInfo && activeLogger != undefined) {
            ;(logObject as any).level = LogLevel.Info
            if (logObjectTransform != undefined) {
                logObject = logObjectTransform(logObject)
            }
            activeLogger.info(logObject)
        }
    },
    warn: (logObject: ILogObject) => {
        if (logWarn && activeLogger != undefined) {
            ;(logObject as any).level = LogLevel.Warn
            if (logObjectTransform != undefined) {
                logObject = logObjectTransform(logObject)
            }
            activeLogger.warn(logObject)
        }
    },
    error: (logObject: ILogObject) => {
        if (logError && activeLogger != undefined) {
            ;(logObject as any).level = LogLevel.Error
            if (logObjectTransform != undefined) {
                logObject = logObjectTransform(logObject)
            }
            activeLogger.error(logObject)
        }
    }
}

let activeLogger: ILogger

export function setLogger(newLogger: ILogger) {
    activeLogger = newLogger
}

let logObjectTransform: (logObject: ILogObject) => ILogObject

export function setLogTransform(transform: (logObject: ILogObject) => ILogObject) {
    logObjectTransform = transform
}
