const express = require('express')
const cors = require('cors')
const compression = require('compression')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const queryman = require('querymen')
const bodymen = require('bodymen')
const { env } = require('../../config')

module.exports = (apiRoot, routes) => {
  const app = express()

  /* istanbul ignore next */
  if (env === 'production' || env === 'development') {
    app.use(cors())
    app.use(compression())
    app.use(morgan('dev'))
  }

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(apiRoot, routes)
  app.use(queryman.errorHandler())
  app.use(bodymen.errorHandler())

  return app
}
