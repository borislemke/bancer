import { IJSONConfig } from './typings'
import * as signale from 'signale'

export interface IBalancerConfig extends IJSONConfig {
  hasHealthCheck: boolean
  hasWeightDistribution: boolean
}

export const BalancerConfig: IBalancerConfig = require('../config.json')

BalancerConfig.hasHealthCheck = BalancerConfig.servers.filter(server => server.readinessProbe && server.readinessProbe.path).length > 1
BalancerConfig.hasWeightDistribution = BalancerConfig.servers.filter(server => server.weight).length > 1

if (process.env.DEBUG) {
  const configScope = signale.scope('Config')
  configScope.info('ID', BalancerConfig.id)
  configScope.info('Algorithm', BalancerConfig.algorithm || 'round-robin')
  configScope.info('Port', BalancerConfig.port)
  configScope.info('# of servers', BalancerConfig.servers.length)
}