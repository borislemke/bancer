import { ITargetServerConfig } from './typings'
import * as http from 'http'
import { Agent, IncomingMessage, ServerResponse } from 'http'
import { promisify } from 'util'
import * as signale from 'signale'
import * as url from 'url'
import { simpleGetRequest } from './simpleGet'

type IRetryRequest = (req: IncomingMessage, res: ServerResponse, condition: { retry?: boolean, queue?: boolean }) => void

export class TargetServer {

  config: ITargetServerConfig

  // Telemetry Data
  totalConnections = 0

  /**
   * Number of open connections this server is handling.
   */
  openConnections = 0

  /**
   * Total number of errors occurred on this server, for whatever reason.
   */
  totalEventErrors = 0

  /**
   * Shared HTTP Agent with keepAlive connections shared between requests.
   */
  httpAgent = new Agent({ keepAlive: true })

  /**
   * Whether the target server is available for processing any request. `true` if available.
   * Used to determine which servers can be used for load balancing.
   */
  health = true

  /**
   * Host address of the assigned target server.
   */
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

  replyWithFixedResponse (response: ServerResponse) {
    const {
      headers = {},
      statusCode = 200,
      body = ''
    } = this.config.fixedResponse

    response.writeHead(statusCode, headers)

    response.end(
      typeof body === 'object'
        ? JSON.stringify(body)
        : `${body}`
    )
  }

  proxyRequest (request: IncomingMessage, response: ServerResponse, retryOnError: IRetryRequest) {
    if (this.config.fixedResponse) {
      return this.replyWithFixedResponse(response)
    }

    if (!this.health) {
      return retryOnError(request, response, { retry: true })
    }

    const options: any = {
      ...url.parse(request.url),
      host: this.host,
      port: this.port,
      hostname: this.hostname,
      headers: {
        ...request.headers,
        'X-From-Node-Balancer': 'true'
      },
      method: request.method,
      agent: this.httpAgent
    }

    this.registerNewConnection()
    const connector = http.request(options, proxyRes => {
      let data = ''
      proxyRes.on('data', chunk => {
        data += chunk
      })
      proxyRes.on('error', proxyError => {
        console.log('proxyError', proxyError)
        this.totalEventErrors += 1
      })
      proxyRes.on('end', () => {
        this.closeConnection()
        response.end(data)
      })
    })

    request.pipe(connector)
      .on('error', err => {
        /**
         * Connection abruptly terminated, i.e when one of the
         * servers dies during request balancing.
         */
        signale.error('Pipe Error', err.message)
        this.health = false
        this.closeConnection()
        request.destroy()
        retryOnError(request, response, { retry: true })
      })
  }

  async doLivenessProbe () {
    if (!this.config.livenessProbe || !this.config.livenessProbe.path) {
      return
    }
    const _previousValue = this.health

    let _probeError: any

    try {
      await simpleGetRequest(`${this.host}/${this.config.livenessProbe.path}`)
      this.health = true
    } catch (error) {
      _probeError = error
      this.health = false
    } finally {
      if (_previousValue !== this.health) {
        this.health
          ? signale.success(`Server ${this.id} health-check is OK`)
          : signale.error(`Server ${this.id} health-check is NOK! Error:`, _probeError.message)
      }

      setTimeout(async () => {
        await this.doLivenessProbe()
      }, (this.config.livenessProbe.periodSeconds || 5) * 1000)
    }
  }

  get telemetryData () {
    return {
      config: this.config,
      metrics: {
        totalRequests: this.totalConnections,
        openConnections: this.openConnections,
        totalEventErrors: this.totalEventErrors
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
