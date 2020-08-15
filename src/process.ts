import { isMaster, worker } from 'cluster'
import { cpus, totalmem } from 'os'
import { ILogger } from './logger'

const processName = isMaster ? 'process' : 'worker thread'

export function initializeProcess(shutdownCallback: () => Promise<void>, logger: ILogger): void {
    let exiting = false
    const shutdown = async (): Promise<void> => {
        if (exiting) {
            return
        }
        exiting = true
        setTimeout(() => {
            logger.error({ message: 'shutdown timeout' })
            process.exit(1)
        }, 20 * 1000).unref()

        await shutdownCallback()
    }

    const logInfo = isMaster ? logger.info : logger.silly

    if (isMaster) {
        logInfo({
            message: `${processName} start`,
            env: process.env.NODE_ENV,
            cpus: Object.keys(cpus()).length,
            mem: (totalmem() / (1024 * 1024 * 1024)).toPrecision(2).toString() + 'GB',
            node: process.versions.node,
            version: process.env.VERSION,
        })
    } else {
        logInfo({ message: `${processName} start`, version: process.env.VERSION })
    }

    process.on('uncaughtException', (err) => {
        logger.error({
            message: `${processName} uncaughtException`,
            errorName: err.name,
            error: err.message,
            stack: err.stack,
            version: process.env.VERSION,
        })
        void shutdown()
    })

    process.on('exit', (code) => {
        if (code !== 0) {
            logger.error({ message: `${processName} exit`, code, version: process.env.VERSION })
        } else {
            logInfo({ message: `${processName} exit`, code, version: process.env.VERSION })
        }
    })

    process.on('SIGTERM', async () => {
        if (exiting) {
            return
        }
        logInfo({ message: `${processName} SIGTERM`, version: process.env.VERSION })
        await shutdown()
    })

    process.on('SIGINT', async () => {
        if (exiting) {
            return
        }
        logInfo({ message: `${processName} SIGINT`, version: process.env.VERSION })
        await shutdown()
    })

    process.on('SIGILL', async () => {
        logger.error({ message: `${processName} SIGILL`, version: process.env.VERSION })
        await shutdown()
    })

    process.on('SIGBUS', async () => {
        logger.error({ message: `${processName} SIGBUS`, version: process.env.VERSION })
        await shutdown()
    })

    process.on('SIGFPE', async () => {
        logger.error({ message: `${processName} SIGFPE`, version: process.env.VERSION })
        await shutdown()
    })

    process.on('SIGSEGV', async () => {
        logger.error({ message: `${processName} SIGSEGV`, version: process.env.VERSION })
        await shutdown()
    })

    if (worker != undefined) {
        worker.on('disconnect', async () => {
            logger.silly({ message: 'worker thread disconnect', version: process.env.VERSION })
            await shutdown()
        })
    }
}
