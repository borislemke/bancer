import { TargetServer } from './TargetServer'

let _queuePool = 0

export type BalancingAlgorithm = (servers: TargetServer[]) => [TargetServer, number]

const roundRobin: BalancingAlgorithm = servers => {
  const weightAndKey = servers.map((server, index) => {
    return {
      server: server,
      weight: server.config.weight || 1,
      key: index
    }
  })
  const multipliedByWeight = weightAndKey.reduce((all, curr) => {
    return [...all, ...Array(curr.weight).fill(curr)]
  }, [])
  const index = _queuePool++ % multipliedByWeight.length
  const { server, key } = multipliedByWeight[index]
  return [server, key]
}

const leastConnection: BalancingAlgorithm = servers => {
  const _openConnection = servers.map((server, index) => {
    return {
      key: index,
      value: server.telemetryData.metrics.openConnections,
      weight: server.config.weight || 1
    }
  })

  const sortedConnections = _openConnection.sort((a, b) => {
    return (a.value / a.weight) - (b.value / b.weight)
  })

  const index = sortedConnections[0].key
  return [servers[index], index]
}

const randomAlgorithm: BalancingAlgorithm = servers => {
  const index = Math.floor(Math.random() * servers.length)
  return [servers[index], index]
}

const returnIfOne = (ba: BalancingAlgorithm) => (servers: TargetServer[]): [TargetServer, number] => {
  if (servers.length === 1) {
    return [servers[0], 0]
  }
  return ba(servers)
}

export const BalancingAlgorithmsOptions: { [method: string]: BalancingAlgorithm } = {
  'round-robin': returnIfOne(roundRobin),
  'least-connection': returnIfOne(leastConnection),
  'random': returnIfOne(randomAlgorithm),
  default: returnIfOne(roundRobin)
}