import { Server, STATUS_CODES } from 'http'
import { consoleLogger, createAppServer, logger, shutdownAppServer, startCluster } from '../src'

let server: Server

async function startApp() {
    server = createAppServer((req, res) => {
        logger.info({ message: STATUS_CODES[200], method: req.method, url: req.url })
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.write('OK')
        res.end()
    })
}

async function shutdownApp() {
    shutdownAppServer(server)
}

async function main() {
    await startCluster(startApp, shutdownApp, consoleLogger)
}

void main()
