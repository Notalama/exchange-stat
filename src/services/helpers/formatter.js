const currenciesModel = require('./../../api/currencies/model')
module.exports = {
  formatRates: async (unformattedList) => {
    let result = []
    for (let i = 0; i < unformattedList.length; i++) {
      const rowArray = unformattedList[i].split(';')
      result.push({
        givenCurrId: rowArray[0],
        receivedCurrId: rowArray[1],
        changerId: rowArray[2],
        rateToGive: rowArray[3],
        rateToReceive: rowArray[4],
        fullChangerCapital: rowArray[5]
      })
    }
    filterByCurrencies(result).then((res) => {
      result = res
      console.log(result)
      return result
    })
    
  },
  formatCurrencies: (unformattedList) => {
    const result = []
    for (let i = 0; i < unformattedList.length; i++) {
      const rowArray = unformattedList[i].split(';')
      result.push({
        currencyId: rowArray[0],
        currencyTitle: rowArray[2]
      })
    }
    return result
  },
  formatExchangers: (unformattedList) => {
    const result = []
    for (let i = 0; i < unformattedList.length; i++) {
      let rowArray = unformattedList[i].split(';')
      result.push({
        exchangerId: rowArray[0],
        exchangerTitle: rowArray[1]
      })
    }
    return result
  }
}
const filterByCurrencies = async (array) => {
  let omitCurrencies = [];
  await currenciesModel.find({ hide: true }, (err, res) => {
    if (err) console.error(err, '----- err')
    else if (res === null) console.error('null triggered')
    else {
      omitCurrencies = res.map(el => el.currencyId)
    }
  })
  console.log(omitCurrencies)
  return array.filter(el => {
    return omitCurrencies.every(id => el.receivedCurrId !== id && el.givenCurrId !== id)
  })
}
