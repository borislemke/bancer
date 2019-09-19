import { ServerResponse, IncomingMessage } from 'http'
import { TargetServer } from 'src/TargetServer'
import { MasterServer } from 'src/MasterServer'

export const apiRouter = (request: IncomingMessage, response: ServerResponse, masterServer: MasterServer) => {
  response.writeHead(200, {
    'Content-Type': 'application/json'
  })
  response.end(JSON.stringify(masterServer.telemetryData))
}
