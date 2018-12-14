const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const bonusSchema = new Schema({
  changer: {
    type: String,
    index: true,
    trim: true,
    required: true
  },
  multi: {
    type: Number,
    required: true
  },
  from: {
    type: String
  },
  to: {
    type: String
  }
}, {
  timestamps: true
})

const model = mongoose.model('bonuses', bonusSchema)

module.exports = model
