const { mongoose, Schema } = require('mongoose')
const { mongooseKeywords } = require('mongoose-keywords')

const types = ['eur', 'usa', 'btc']
const currencySchema = new Schema({
  test: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    index: true,
    trim: true
  },
  type: {
    type: String,
    enum: types,
    default: 'btc'
  },
  id: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
})

currencySchema.path('type').set((type) => {
  if (!this.name) {
    this.name = type.replace(/^(.+)@.+$/, '$1')
  }
  return type
})

currencySchema.plugin(mongooseKeywords, { paths: ['name', 'type'] })

const model = mongoose.model('BestChange', currencySchema)

export const schema = model.schema
module.exports = model
