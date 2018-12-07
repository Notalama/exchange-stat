const currenciesModel = require('./../../api/currencies/model')
const hideParamsModel = require('./../../api/hide-params/model')
const exchangersModel = require('./../../api/exchangers/model')
const ratesModel = require('./../../api/rates/model')
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
            give: +rowArray[3],
            receive: +rowArray[4],
            amount: +rowArray[5]
          })
        }
      }
      return result
    } catch (rejectedValue) {
      console.error('formatter err caught ---', rejectedValue)
    }
  },
  getChains: async () => {
    let result = []
    const omitValues = await hideParamsModel.find({}, (err, res) => {
      if (err) console.error(err, '--- omitValues err')
      else if (res === null) console.error('null hideparams found')
    })
    const allCurrencies = await currenciesModel.find({ currencyId: { $nin: omitValues[0].hiddenCurrencies } },
      { currencyId: 1, currencyTitle: 1 }, (err, res) => {
        if (err) console.error(err, '--- allCurrencies err')
        else if (res === null) console.error('null currencies found')
      })
    const currIds = allCurrencies.map(el => el.currencyId)
    for (let i = 0; i < allCurrencies.length; i++) {
      let bestRates = await ratesModel.aggregate([
        {
          $match: {
            'fromCurr.currencyId': allCurrencies[i].currencyId,
            'toCurr.currencyId': {$in: currIds}
          }
        },
        {
          $group: {
            _id: {$concat: ['$fromCurr.currencyTitle', ' -> ', '$toCurr.currencyTitle']},
            fromCurr: {$push: '$fromCurr.currencyId'},
            toCurId: {$push: '$toCurr.currencyTitle'},
            minGive: {$min: '$give'},
            maxGive: {$max: '$give'},
            minReceive: {$min: '$receive'},
            maxReceive: {$max: '$receive'},
            allGave: {$push: '$give'},
            allReceived: {$push: '$receive'},
            allChangers: {$push: '$changer.exchangerTitle'}
          }
        }
      ])
      result.push(bestRates)
    }
    const test = []
    result = result.filter((bestRates) => {
      let profitable = false
      bestRates.forEach(bestRate => {
        if (bestRate.minGive === 1) {
          // find the most profitable rate of all bestRates
          let maxProfit = []
          
          const porfitRates = bestRates.filter(val => {
            const isPair = val.fromCurr[0] === bestRate.toCurId[0] && val.toCurId[0] === bestRate.fromCurr[0]
            const isProf = val.maxGive < bestRate.minGive
            if (isPair && isProf) {
              maxProfit.push({
                changer: val.allChangers,
                bestRate: bestRate,
                val: val
              })
              return true
            }
          })
          if (maxProfit.length) {
            test.push({maxReceive: maxProfit, bestRate}, porfitRates)
            profitable = true
          }
        } else {
          let maxProfit = []
          const porfitRates = bestRates.filter(val => {
            const isPair = val.fromCurr[0] === bestRate.toCurId[0] && val.toCurId[0] === bestRate.fromCurr[0]
            const isProf = val.maxReceive > bestRate.minReceive
            if (isPair && isProf) {
              maxProfit.push({
                changer: val.allChangers,
                bestRate: bestRate,
                val: val
              })
              return true
            }
          })
          if (maxProfit.length) {
            test.push({maxReceive: maxProfit, bestRate}, porfitRates)
            profitable = true
          }
        }
      })
      return profitable
    })
    result.push(test)
    return result
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
