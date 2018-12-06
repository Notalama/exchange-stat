const mongoose = require('mongoose')
const { Schema } = require('mongoose')

// const types = ['country', 'electronic', 'binary']
const rateSchema = new Schema({
  // givenCurrency:
  //           receivedCurrency: 
  //           changer: 
  //           rateToGive: 
  //           rateToReceive: 
  //           fullChangerCapital: 
  exchangerTitle: {
    type: String,
    index: true,
    trim: true
  },
  exchangerId: {
    type: String,
    trim: true,
    unique: true
  }
}, {
  timestamps: true
})

const model = mongoose.model('exchangers', exchangerSchema)

module.exports = model
