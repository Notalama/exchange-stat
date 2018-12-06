const currenciesModel = require('./../../api/currencies/model')
const hideParamsModel = require('./../../api/hide-params/model')
const exchangersModel = require('./../../api/exchangers/model')
module.exports = {
  formatRates: async (unformattedList) => {
    try {
      const result = []
      const omitValues = await hideParamsModel.find({}, (err, res) => {
        if (err) console.error(err, '--- omitValues err')
        else if (res === null) console.error('null hideparams found')
      })
      const allCurrencies = await currenciesModel.find({currencyId: {$nin: omitValues[0].hiddenCurrencies}},
        {currencyId: 1, currencyTitle: 1}, (err, res) => {
          if (err) console.error(err, '--- allCurrencies err')
          else if (res === null) console.error('null currencies found')
        })
      const allExchangers = await exchangersModel.find({exchangerId: {$nin: omitValues[0].hiddenExchangers}},
        {exchangerId: 1, exchangerTitle: 1}, (err, res) => {
          if (err) console.error(err, '--- allExchangers err')
          else if (res === null) console.error('null currencies found')
        })
      for (let i = 0; i < unformattedList.length; i++) {
        let rowArray = unformattedList[i].split(';')
        const isHidden = omitValues[0].hiddenCurrencies.some(id => rowArray[0] === id || rowArray[1] === id) || omitValues[0].hiddenExchangers.some(id => rowArray[2] === id)
        if (!isHidden) {
          result.push({
            fromCurr: allCurrencies.find(el => el.currencyId === rowArray[0]),
            toCurr: allCurrencies.find(el => el.currencyId === rowArray[1]),
            changer: allExchangers.find(el => el.exchangerId === rowArray[2]),
            give: rowArray[3],
            receive: rowArray[4],
            amount: rowArray[5]
          })
        }
      }
      return result
    } catch (rejectedValue) {
      console.error('formatter err caught ---', rejectedValue)
    }
  },
  formatCurrencies: async (unformattedList) => {
    const result = []
    let omitCurrencies = []
    await hideParamsModel.find({
      hide: true
    }, (err, res) => {
      if (err) console.error(err, '----- err')
      else if (res === null) console.error('null triggered')
      else {
        omitCurrencies = res[0].hiddenCurrencies
      }
    })
    for (let i = 0; i < unformattedList.length; i++) {
      const rowArray = unformattedList[i].split(';')
      const isHidden = omitCurrencies.some(id => rowArray[0] === id)
      result.push({
        currencyId: rowArray[0],
        currencyTitle: rowArray[2],
        hide: isHidden
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
