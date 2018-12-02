const mongoose = require('mongoose')
const { Schema } = require('mongoose')

// const types = ['country', 'electronic', 'binary']
const currencySchema = new Schema({
  currencyTitle: {
    type: String,
    index: true,
    trim: true
  },
  currencyId: {
    type: String,
    trim: true,
    unique: true
  },
  hide: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const model = mongoose.model('currencies', currencySchema)

module.exports = model
