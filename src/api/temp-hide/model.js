const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const tempHideSchema = new Schema({
  inCurrencyTitle: {
    type: String,
    trim: true
  },
  inCurrencyId: {
    type: String,
    trim: true
  },
  outCurrencyTitle: {
    type: String,
    trim: true
  },
  outCurrencyId: {
    type: String,
    trim: true
  },
  changerTitle: {
    type: String,
    trim: true
  },
  changerId: {
    type: String,
    trim: true
  },
  hidePeriod: {
    type: Number,
    default: 3600000
  }
}, {
  timestamps: true
})

const model = mongoose.model('tempHide', tempHideSchema)

module.exports = model
