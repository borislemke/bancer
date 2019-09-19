import { createServer } from 'http'
import * as cluster from 'cluster'
import { cpus } from 'os'

const numCpus = cpus().length

const server = createServer((req, res) => {
  if (req.url === '/ping') {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    })
    res.write('pong')
    return void res.end()
  }

  res.writeHead(200, {
    'Content-Type': 'application/json'
  })
  res.write('Hello world!')
  res.end()
})

if (cluster.isMaster) {
  for (let i = 0; i < numCpus; i++) {
    cluster.fork()
  }
} else {
  server.listen(process.env.PORT, () => {
    console.log(`Test server ${process.pid} running on port`, process.env.PORT)
  })
}
