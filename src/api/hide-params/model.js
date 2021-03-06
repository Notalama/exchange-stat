const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const hideParamsSchema = new Schema({
  hiddenCurrencies: {
    type: Array
  },
  hiddenExchangers: {
    type: Array
  },
  fourLinks: {
    type: Array
  }
}, {
  timestamps: true
})

const model = mongoose.model('hideparams', hideParamsSchema)

module.exports = model
