const mongoose = require('./services/mongoose')
const express = require('./services/express')
const api = require('./api')
const { env, mongo, port, ip, apiRoot } = require('./config')
const path = require('path')
const http = require('http')
const app = express(apiRoot, api)
const server = http.createServer(app)

const distDir = path.join('../exchange-stat-front/dist/')
app.use(express.static(distDir))

mongoose.connect(mongo.uri)
mongoose.Promise = Promise

setImmediate(() => {
  server.listen(port, ip, () => {
    console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env)
  })
})

module.exports = app
