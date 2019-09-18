import { BalancerConfig, IBalancerConfig } from './BalancerConfig'
import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import { BalancingAlgorithm, BalancingAlgorithmsOptions } from './BalancingAlgorithms'
import { TargetServer } from './TargetServer'
import * as signale from 'signale'

export class MasterServer {

  /**
   * Total number of incoming connections in all target servers
   */
  get requestsInTargetsCount (): number {
    return this.targetServers.reduce((all, curr) => all + curr.telemetryData.metrics.totalRequests, 0)
  }

  get requestLossCount (): number {
    return this.incomingRequestsCount - this.requestsInTargetsCount
  }

  get requestLossRate (): string {
    if (!this.requestLossCount) {
      return '0%'
    }
    return (this.requestLossCount / this.incomingRequestsCount * 100).toFixed(2) + '%'
  }

  /**
   * Total incoming request before distribution
   */
  incomingRequestsCount = 0

  /**
   * Number of retried requests
   */
  retriedRequestsCount = 0

  masterServer: Server

  targetServers: TargetServer[]

  getTelemetryData = () => {
    return {
      ...BalancerConfig,
      servers: undefined,
      requests: this.incomingRequestsCount,
      requestsInTarget: this.requestsInTargetsCount,
      retriedRequests: this.retriedRequestsCount,
      requestLossCount: this.requestLossCount,
      requestLossRate: this.requestLossRate,
      targetServers: this.targetServers.map(server => server.telemetryData)
    }
  }

  get selectedAlgorithm (): BalancingAlgorithm {
    return BalancingAlgorithmsOptions[BalancerConfig.algorithm]
      || BalancingAlgorithmsOptions.default
  }

  constructor (public config: IBalancerConfig) {
    this.masterServer = createServer(this.incomingMessageHandler)
    this.targetServers = config.servers.map(TargetServer.fromJSON)
  }

  retryQueue = []

  incomingMessageHandler = (request: IncomingMessage, response: ServerResponse, condition = { retry: false, queue: false }) => {
    if (request.url === '/ping') {
      response.writeHead(200, {
        'Content-Type': 'application/json'
      })
      response.write(JSON.stringify(this.getTelemetryData()))
      return void response.end()
    }

    if (condition.retry) {
      this.retriedRequestsCount += 1
    } else {
      this.incomingRequestsCount += 1
    }

    const availableServers = this.targetServers.filter(server => server.health)

    if (!availableServers.length) {
      signale.error('No Servers Available')
      response.writeHead(503, {
        'Content-Type': 'text/html'
      })
      response.write('Server Error')
      return void response.end()
    }

    const [_targetServer] = this.selectedAlgorithm(availableServers)

    _targetServer.proxyRequest(request, response, this.incomingMessageHandler)
  }

  async doLivenessProbeIfPresent () {
    await Promise.all(this.targetServers.map(server => server.doLivenessProbe()))
  }

  static async fromConfig (config: IBalancerConfig): Promise<MasterServer> {
    const masterServer = new MasterServer(config)
    await masterServer.doLivenessProbeIfPresent()
    return masterServer
  }

  listen (port: number, cb: (err?: any) => void) {
    return this.masterServer.listen(port, cb)
  }
}
