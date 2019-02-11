import { Server } from 'http'
import { consoleLogger, createAppServer, shutdownAppServer, startCluster } from '../src'

let server: Server

async function startApp() {
    server = createAppServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
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
