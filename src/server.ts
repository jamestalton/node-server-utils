import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import { Http2SecureServer, Http2ServerRequest, Http2ServerResponse } from 'http2'
import { AddressInfo, Socket } from 'net'
import { logger } from './logger'

export function createAppServer(
    requestHandler: (req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse) => void
) {
    const clientSockets: Socket[] = []

    const server: Server | Http2SecureServer = createServer(requestHandler)

    server
        .on('listening', function serverListening() {
            logger.debug({ message: 'server listening', port: (server.address() as AddressInfo).port })
        })
        .on('request', function(req, res) {
            if (req.socket.activeRequestCount == undefined) {
                req.socket.activeRequestCount = 1
            } else {
                req.socket.activeRequestCount++
            }
            res.on('finish', function() {
                req.socket.activeRequestCount--
                if ((server as any).allSocketsClosedCallback != undefined && req.socket.activeRequestCount === 0) {
                    ;(req.socket as Socket).destroy()
                }
            })
        })
        .on('connection', socket => {
            clientSockets.push(socket)
            logger.silly({ message: `client socket connect`, sockets: clientSockets.length })
            socket
                .on('error', function(err: Error) {
                    logger.error({
                        message: `client socket error`,
                        errorName: err.name,
                        error: err.message
                    })
                })
                .on('close', function() {
                    clientSockets.splice(clientSockets.indexOf(socket), 1)
                    logger.silly({ message: `client socket closed`, sockets: clientSockets.length })
                    if ((server as any).allSocketsClosedCallback != undefined && clientSockets.length === 0) {
                        ;(server as any).allSocketsClosedCallback()
                    }
                })
        })
        .on('error', function serverError(err: Error) {
            logger.error({ message: 'server error', errorName: err.name, error: err.message })
        })
        .on('close', () => {
            logger.debug({ message: 'server closed' })
        })
    ;(server as any).clientSockets = clientSockets

    return server.listen(process.env.PORT)
}

export async function shutdownAppServer(server: Server | Http2SecureServer) {
    if (server == undefined) {
        return
    }

    logger.silly({ message: 'closing client sockets', sockets: (server as any).clientSockets.length })
    await new Promise(async resolve => {
        if ((server as any).clientSockets.length === 0) {
            resolve()
        } else {
            ;(server as any).allSocketsClosedCallback = resolve
            ;(server as any).clientSockets.forEach((clientSocket: Socket) => {
                if ((clientSocket as any).activeRequestCount === 0) {
                    clientSocket.destroy()
                }
            })
        }
        await new Promise(resolveClose => server.close(resolveClose))
    })
}
