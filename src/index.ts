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

if (process.env.CLUSTER) {
  if (cluster.isMaster) {
    console.log('Cluster Master Up')
    for (let i = 0; i < numCpus; i++) {
      cluster.fork()
    }
  } else {
    start()
  }
} else {
  start()
}
