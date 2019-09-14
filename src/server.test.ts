import { createServer } from 'http'

const server = createServer((req, res) => {
  if (req.url === '/ping') {
    res.writeHead(200, {
      'Content-Type': 'text/html'
    })
    res.write('pong')
    return void res.end()
  }

  // console.log('Request in server:', process.env.ID)
  res.writeHead(200, {
    'Content-Type': 'application/json'
  })
  res.write('Hello World! ' + process.env.ID + ' ' + req.headers['x-from-node-balancer'])
  res.end()
})

server.listen(process.env.PORT, () => {
  console.log(`Test server ${process.env.ID} running on port`, process.env.PORT)
})
