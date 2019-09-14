import { BalancerConfig, IBalancerConfig } from './BalancerConfig'
import { Agent, createServer, IncomingMessage, Server, ServerResponse } from 'http'
import { BalancingAlgorithm, LBAlgorithms } from './algorithms'
import { TargetServer } from './TargetServer'

export class MasterServer {

  totalConnections = 0

  masterServer: Server

  httpAgent = new Agent({ keepAlive: true })

  servers: TargetServer[]

  getTelemetryData = () => {
    return {
      algorithm: BalancerConfig.algorithm,
      totalConnections: this.totalConnections,
      servers: this.servers.map(server => server.telemetryData)
    }
  }

  get selectedAlgorithm (): BalancingAlgorithm {
    return LBAlgorithms[BalancerConfig.algorithm]
      || LBAlgorithms.default
  }

  constructor (public config: IBalancerConfig) {
    this.masterServer = createServer(this.incomingMessageHandler)
    this.servers = config.servers.map(TargetServer.fromJSON)
  }

  incomingMessageHandler = (request: IncomingMessage, response: ServerResponse) => {
    if (request.url === '/ping') {
      response.writeHead(200, {
        'Content-Type': 'application/json'
      })
      response.write(JSON.stringify(this.getTelemetryData()))
      return void response.end()
    }

    this.totalConnections += 1

    const availableServers = this.servers.filter(server => server.available)

    const [_targetServer] = this.selectedAlgorithm(availableServers)

    _targetServer.proxyRequest(request, response, this.httpAgent)
  }

  async prepareHealthCheckIfPresent () {
    const checked = await Promise.all(this.servers.map(server => server.doHealthCheck()))
    this.servers = this.servers.map((server, index) => {
      server.available = checked[index]
      return server
    })
    setTimeout(() => this.prepareHealthCheckIfPresent(), 60000)
  }

  static async fromConfig (config: IBalancerConfig): Promise<MasterServer> {
    const masterServer = new MasterServer(config)
    if (config.hasHealthCheck) {
      await masterServer.prepareHealthCheckIfPresent()
    }
    return masterServer
  }

  listen (port: number, cb: (err?: any) => void) {
    return this.masterServer.listen(port, cb)
  }
}
