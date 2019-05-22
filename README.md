# Node Server Utils

## Status: Beta

[![Build Status](https://travis-ci.com/jamestalton/node-server-utils.svg?branch=master)](https://travis-ci.com/jamestalton/node-server-utils)

Utility functions for creating node server. Handles tracking open sockets and properly shutting down sockets when shutting down the server.

-   Cluster support for running a clustered server. See the node cluster module.

## Example Typescript

```typescript
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
```

## Logger

The logger is setup to push log messages from the cluster workers to the master thread for logging. Register a logger for logging by either passing it into startCluster() or setLogger().
