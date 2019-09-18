import { createServer } from 'http'

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
  res.write('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed mollis dictum ligula, ut sagittis nisl malesuada nec. Fusce hendrerit leo augue, nec pretium dolor porta sodales. Sed consequat sed purus eu aliquet. Etiam laoreet nibh vel ex sodales, non egestas lorem tempor. Pellentesque placerat facilisis felis, nec bibendum metus finibus quis. Donec lobortis, sapien at tristique placerat, nibh libero volutpat eros, eget mollis nibh elit et enim. Vestibulum consequat ut lorem sed eleifend. Ut eu dolor ut lectus faucibus rhoncus. Nam vestibulum vitae massa vel congue. Nam ac odio lacus. Nam condimentum ante eget mollis vestibulum. Cras nisi sapien, tempor nec diam at, vulputate cursus odio. Maecenas vitae tellus efficitur arcu mollis ultrices id vitae ex. Suspendisse potenti. Duis nec vestibulum dui. Donec ultricies sit amet lorem eu feugiat. Ut pretium vitae lectus at tempor. Curabitur condimentum arcu varius nulla ultricies, id feugiat odio dictum. Vivamus sollicitudin consectetur nullam.')
  res.end()
})

server.listen(process.env.PORT, () => {
  console.log(`Test server ${process.env.ID} running on port`, process.env.PORT)
})
