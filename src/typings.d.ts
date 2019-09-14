export interface IReadinessProbe {
  path: string
  waitUntilSeconds?: number // 0
  retryAfterSeconds?: number // 10
  stopRetryAfterAttempts?: number // 2
}

export interface ITargetServerConfig {
  id: string
  host: string
  port: number | string
  weight?: number
  name?: string
  readinessProbe?: IReadinessProbe
}

export interface IJSONConfig {
  id: string
  port: number
  algorithm: string

  servers: ITargetServerConfig[]

  readinessProbe?: IReadinessProbe
}
