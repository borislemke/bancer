import { BalancerConfig } from './BalancerConfig'
import * as signale from 'signale'
import { MasterServer } from './MasterServer'
import * as cluster from 'cluster'

const numCpus = require('os').cpus().length

const start = () => {
  MasterServer.fromConfig(BalancerConfig).then(server => {
    server.listen(BalancerConfig.port, () => {
      signale.success('Load Balancer started on port:', BalancerConfig.port)
    })
  }).catch(err => {
    signale.error('Start Up Error', err)
  })
}

if (BalancerConfig.workers) {
  if (cluster.isMaster) {
    signale.info('Master Process Up')

    const { workers } = BalancerConfig

    let workerLimit = typeof workers === 'number'
      ? workers
      : numCpus

    if (typeof workers === 'number' && workers > numCpus) {
      signale.warn('Number of workers is greater than number of available CPUs. Number of CPUs:', numCpus, '. Number of workers requested:', workers)
      workerLimit = numCpus
    }

    for (let i = 0; i < workerLimit; i++) {
      cluster.fork()
    }
  } else {
    start()
    signale.info(`Child Process ${process.pid} Up`)
  }
} else {
  start()
}
