const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const currencySchema = new Schema({
  firstCurrencyTitle: {
    type: String,
    index: true,
    trim: true
  },
  firstCurrencyId: {
    type: String,
    trim: true,
    unique: true
  },
  secondCurrencyTitle: {
    type: String,
    index: true,
    trim: true
  },
  secondCurrencyId: {
    type: String,
    trim: true,
    unique: true
  }
}, {
  timestamps: true
})

const model = mongoose.model('currencyPairs', currencySchema)

module.exports = model
