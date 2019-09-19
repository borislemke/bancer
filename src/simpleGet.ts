import * as http from 'http'

export const simpleGetRequest = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    http.get(url, response => {
      let data = ''

      response.on('data', chunk => {
        data += chunk
      })

      response.on('end', () => {
        resolve(data)
      })
    }).on('error', error => {
      reject(error.message)
    })
  })
}
