export interface ILivenessProbe {
  path: string
  initialDelaySeconds?: number // 0
  periodSeconds?: number // 10
}

export interface ITargetServerConfig {
  id: string
  host: string
  port: number | string
  weight?: number
  name?: string
  livenessProbe?: ILivenessProbe

  fixedResponse?: {
    headers?: any
    statusCode?: number
    body?: any
  }
}

export interface IJSONConfig {
  id: string
  port: number
  algorithm: string
  workers?: number

  ssl?: {
    cert: string
    key: string
  }

  servers: ITargetServerConfig[]

  livenessProbe?: ILivenessProbe
}
