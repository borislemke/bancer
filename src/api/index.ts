import { ServerResponse, IncomingMessage } from 'http'
import { MasterServer } from 'src/MasterServer'
import * as express from 'express'

const server = express()

server.use('/api', (request, response) => {
  response.send({ ping: 'pong' })
})

export const apiRouter = (masterServer: MasterServer) => (request: IncomingMessage, response: ServerResponse) => {
  server(request, response)
}
