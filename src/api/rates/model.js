const mongoose = require('mongoose')
const { Schema } = require('mongoose')

// const types = ['country', 'electronic', 'binary']
const rateSchema = new Schema({
  from: String,
  fromTitle: String,
  to: String,
  toTitle: String,
  changer: String,
  changerTitle: String,
  give: Number,
  receive: Number,
  amount: Number
})
const model = mongoose.model('rates', rateSchema)

module.exports = model
