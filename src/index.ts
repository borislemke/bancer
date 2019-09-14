import { BalancerConfig } from './BalancerConfig'
import * as signale from 'signale'
import { MasterServer } from './MasterServer'

MasterServer.fromConfig(BalancerConfig).then(server => {
  server.listen(BalancerConfig.port, () => {
    signale.success('Load Balancer started on port:', BalancerConfig.port)
  })
}).catch(err => {
  signale.error('Start Up Error', err)
})
