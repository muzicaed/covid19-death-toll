module.exports = {
  attachRoutes: (server) => {

    server.get('/data.json', async (req, res) => {
      res.send('Hello World')
    })

  }
}