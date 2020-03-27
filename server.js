const BodyParser = require('body-parser')
const Express = require('express')
const Cors = require('cors')
const CacheControl = require('express-cache-controller')
const Routes = require('./routes')

const server = Express()
addMiddleware(server)
Routes.attachRoutes(server)
startServer(server, 3000)

function addMiddleware(server) {
  server.use(Cors())
  server.use(CacheControl({
    noCache: true
  }))
  server.use(Express.static('public'))
  server.use(BodyParser.json())
  server.use(BodyParser.urlencoded({
    extended: false
  }))
}

function startServer(server, port) {
  if (process.env.NODE_ENV != 'test') {
    server.listen(port)
    console.info(`\n\nServer started on port: ${port}`)
  }
}