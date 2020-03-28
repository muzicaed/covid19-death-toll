const DataProcessor = require('./lib/data-processor')

module.exports = {
  attachRoutes: (server) => {

    server.get('/data.json', async (req, res) => {
      try {
        const data = await DataProcessor.getData()
        res.json(formatFrontend(data))
      } catch (e) {
        console.log(e)
        res.status(500).send()
      }
    })
  }
}

function formatFrontend(data) {
  return data
}