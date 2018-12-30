const hideParamsModel = require('./../../api/hide-params/model')
module.exports = {
  filterCurrencies: async (currencies) => {
    const omitValues = await hideParamsModel.find({}, (err, res) => {
      if (err) console.error(err, '--- omitValues err')
      else if (res === null) console.error('null hideparams found')
    })
    return currencies.filter(currency => omitValues[0].hiddenCurrencies.every(el => el !== currency.currencyId))
  },
  filterExchangers: async (exchangers) => {
    const omitValues = await hideParamsModel.find({}, (err, res) => {
      if (err) console.error(err, '--- omitValues err')
      else if (res === null) console.error('null hideparams found')
    })
    return exchangers.filter(currency => omitValues[0].hiddenExchangers.every(el => el !== currency.exchangerId))
  }
}
