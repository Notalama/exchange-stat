const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const commissionSchema = new Schema({
  currency: String,
  commission: Number,
  commissionA: [Number],
  changer: {
    type: String,
    trim: true,
    default: null
  },
  inOut: {
    type: String,
    default: 'IN'
  }
})

const model = mongoose.model('commission', commissionSchema)

module.exports = model
