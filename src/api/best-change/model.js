const { mongoose, Schema } = require('mongoose')
const { mongooseKeywords } = require('mongoose-keywords')

// const types = ['country', 'electronic', 'binary']
const currencySchema = new Schema({
  title: {
    type: String,
    index: true,
    trim: true
  },
  type: {
    type: String,
    trim: true,
    // enum: types,
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

currencySchema.path('type').set((type) => {
  if (!this.name) {
    this.name = type.replace(/^(.+)@.+$/, '$1')
  }
  return type
})

currencySchema.plugin(mongooseKeywords, { paths: ['title', 'type'] })

const model = mongoose.model('currencies', currencySchema)

export const schema = model.schema
module.exports = model
