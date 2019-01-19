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
  },
  filterOmitValues: ({rowArray = [], hiddenCurrencies = [], hiddenExchangers = [], tempHiddens = []}) => {
    if (!hiddenCurrencies.every(el => el !== rowArray[0] && (el !== rowArray[1]))) return true
    if (!hiddenExchangers.every(el => el !== rowArray[2] && +rowArray[5] > 0.01)) return true
    if (!tempHiddens.every(el => removeTempHidden(el, rowArray))) return true
    return false
  }
}
function removeTempHidden (hideParams, rate) {
  const isInCurrInExch = hideParams.inCurrencyId && !hideParams.outCurrencyId && hideParams.changerId
  const isOutCurrInExch = !hideParams.inCurrencyId && hideParams.outCurrencyId && hideParams.changerId
  const isPairWithoutExch = hideParams.inCurrencyId && hideParams.outCurrencyId && !hideParams.changerId
  const isPairInExchanger = hideParams.inCurrencyId && hideParams.outCurrencyId && hideParams.changerId
  let toRemove = false
  if (isInCurrInExch) toRemove = rate[0] === hideParams.inCurrencyId && rate[2] === hideParams.changerId
  else if (isOutCurrInExch) toRemove = rate[1] === hideParams.outCurrencyId && rate[2] === hideParams.changerId
  else if (isPairWithoutExch) toRemove = rate[0] === hideParams.inCurrencyId && rate[1] === hideParams.outCurrencyId
  else if (isPairInExchanger) toRemove = rate[0] === hideParams.inCurrencyId && rate[1] === hideParams.outCurrencyId && rate[2] === hideParams.changerId
  else {
    toRemove = rate[0] === hideParams.inCurrencyId || rate[1] === hideParams.outCurrencyId || rate[2] === hideParams.changerId
  }
  return !toRemove
}
