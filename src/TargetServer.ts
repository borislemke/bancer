import { ITargetServerConfig } from './typings'
import * as request from 'request'
import * as http from 'http'
import { Agent, IncomingMessage, ServerResponse } from 'http'
import { promisify } from 'util'
import * as signale from 'signale'
import * as url from 'url'

const promisifiedRequest: any = promisify(request.get)

export class TargetServer {

  available = false

  config: ITargetServerConfig

  // Telemetry Data
  totalConnections = 0
  openConnections = 0

  totalEventErrors = 0

  get host (): string {
    return `http://${this.hostname}:${this.port}`
  }

  constructor (public id: string, public hostname: string, public port: number | string) {
  }

  registerNewConnection () {
    this.totalConnections += 1
    this.openConnections += 1
  }

  closeConnection () {
    this.openConnections -= 1
  }

  proxyRequest (request: IncomingMessage, response: ServerResponse, httpAgent: Agent) {
    const options: any = {
      ...url.parse(request.url),
      host: this.host,
      port: this.port,
      hostname: this.hostname,
      headers: {
        ...request.headers,
        'X-From-Node-Balancer': true
      },
      method: request.method,
      agent: httpAgent
    }

    this.registerNewConnection()
    const connector = http.request(options, serverResponse => {
      let data = ''
      serverResponse.on('data', chunk => {
        data += chunk
      })
      serverResponse.on('end', () => {
        this.closeConnection()
        response.end(data)
      })
    })

    request.pipe(connector)
  }

  health = false

  async doHealthCheck () {
    this.health = false
    try {
      await promisifiedRequest(`${this.host}/${this.config.readinessProbe.path}`)
      this.health = true
    } catch (err) {
      signale.error('Health Check Errors', err)
    } finally {
      return this.health
    }
  }

  get telemetryData () {
    const {
      totalConnections,
      openConnections,
      totalEventErrors
    } = this

    return {
      config: this.config,
      metrics: {
        totalConnections,
        openConnections,
        totalEventErrors
      }
    }
  }

  static fromJSON (json: ITargetServerConfig): TargetServer {
    const {
      id,
      host,
      port
    } = json
    const server = new TargetServer(id, host, port)
    server.config = json
    return server
  }
}
