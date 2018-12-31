const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const tempHideSchema = new Schema({
  inCurrencyTitle: {
    type: String,
    index: true,
    trim: true
  },
  inCurrencyId: {
    type: String,
    trim: true
  },
  outCurrencyTitle: {
    type: String,
    index: true,
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
    trim: true,
    required: true
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
