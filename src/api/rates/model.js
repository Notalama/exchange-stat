const mongoose = require('mongoose')
const { Schema } = require('mongoose')

// const types = ['country', 'electronic', 'binary']
const rateSchema = new Schema({
  fromCurr: {
    currencyTitle: String,
    currencyId: String
  },
  toCurr: {
    currencyTitle: String,
    currencyId: String
  },
  changer: {
    exchangerTitle: String,
    exchangerId: String
  },
  give: Number,
  receive: Number,
  amount: Number
})
const model = mongoose.model('rates', rateSchema)

module.exports = model
