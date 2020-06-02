const { mongoose, Schema } = require('mongoose')

const customChainSchema = new Schema({
  title: {
    type: String,
    index: true,
    trim: true
  },
  type: {
    type: String,
    trim: true,
    default: ''
  },
  id: {
    type: String,
    default: '',
    trim: true,
    unique: true
  }
}, {
  timestamps: true
})

const model = mongoose.model('currencies', customChainSchema)

export const schema = model.schema
module.exports = model
