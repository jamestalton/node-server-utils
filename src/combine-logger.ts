import { ILogger, ILogObject } from './logger'

export class CombineLogger implements ILogger {
    public loggers: ILogger[] = []

    constructor(logger1: ILogger, logger2: ILogger) {
        this.loggers.push(logger1)
        this.loggers.push(logger2)
    }

    public silly(logObject: ILogObject): void {
        for (const logger of this.loggers) {
            logger.silly(logObject)
        }
    }

    public debug(logObject: ILogObject): void {
        for (const logger of this.loggers) {
            logger.debug(logObject)
        }
    }

    public info(logObject: ILogObject): void {
        for (const logger of this.loggers) {
            logger.info(logObject)
        }
    }

    public warn(logObject: ILogObject): void {
        for (const logger of this.loggers) {
            logger.warn(logObject)
        }
    }

    public error(logObject: ILogObject): void {
        for (const logger of this.loggers) {
            logger.error(logObject)
        }
    }
}
