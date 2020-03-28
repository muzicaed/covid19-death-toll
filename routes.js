const DataProcessor = require('./lib/data-processor')

let data = null

module.exports = {
  attachRoutes: (server) => {

    server.get('/data.json', async (req, res) => {
      try {
        if (!data) {
          data = await DataProcessor.getData()
        }
        res.json(data)
      } catch (e) {
        console.log(e)
        res.status(500).send()
      }
    })
  }
}

setInterval(() => {
  data = null
}, 3600000)