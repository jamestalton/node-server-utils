import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import { Http2SecureServer, Http2ServerRequest, Http2ServerResponse } from 'http2'
import { AddressInfo, Socket } from 'net'
import { logger } from './logger'

class MyServer extends Server {
    allSocketsClosedCallback: (value?: unknown) => void
    clientSockets: MySocket[]
}

class MySocket extends Socket {
    activeRequestCount: number
}

export function createAppServer(
    requestHandler: (req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse) => void
): Server {
    const clientSockets: MySocket[] = []

    const server: Server | Http2SecureServer = createServer(requestHandler)

    server
        .on('listening', function serverListening() {
            logger.debug({ message: 'server listening', port: (server.address() as AddressInfo).port })
        })
        .on('request', function (req, res) {
            const socket: MySocket = req.socket
            if (socket.activeRequestCount == undefined) {
                socket.activeRequestCount = 1
            } else {
                socket.activeRequestCount++
            }
            res.on('finish', function () {
                socket.activeRequestCount--
                if ((server as MyServer).allSocketsClosedCallback != undefined && socket.activeRequestCount === 0) {
                    socket.destroy()
                }
            })
        })
        .on('connection', (socket: MySocket) => {
            socket.activeRequestCount = 0
            clientSockets.push(socket)
            logger.silly({ message: `client socket connect`, sockets: clientSockets.length })
            socket
                .on('error', function (err: Error) {
                    logger.error({
                        message: `client socket error`,
                        errorName: err.name,
                        error: err.message,
                    })
                })
                .on('close', function () {
                    clientSockets.splice(clientSockets.indexOf(socket), 1)
                    logger.silly({ message: `client socket closed`, sockets: clientSockets.length })
                    if ((server as MyServer).allSocketsClosedCallback != undefined && clientSockets.length === 0) {
                        ;(server as MyServer).allSocketsClosedCallback()
                    }
                })
        })
        .on('error', function serverError(err: Error) {
            logger.error({ message: 'server error', errorName: err.name, error: err.message })
        })
        .on('close', () => {
            logger.debug({ message: 'server closed' })
        })
    ;(server as MyServer).clientSockets = clientSockets

    return server.listen(process.env.PORT)
}

export async function shutdownAppServer(server: Server | Http2SecureServer): Promise<void> {
    if (server == undefined) {
        return
    }

    logger.silly({ message: 'closing client sockets', sockets: (server as MyServer).clientSockets.length })
    await new Promise(
        async (resolve): Promise<void> => {
            ;(server as MyServer).allSocketsClosedCallback = resolve
            ;(server as MyServer).clientSockets.forEach((clientSocket: MySocket) => {
                if (clientSocket.activeRequestCount === 0) {
                    clientSocket.destroy()
                }
            })

            await new Promise((resolveClose): void => {
                server.close(resolveClose)
            })

            if ((server as MyServer).clientSockets.length === 0) {
                resolve()
            }
        }
    )
}
