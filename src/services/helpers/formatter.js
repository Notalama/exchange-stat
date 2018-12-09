const currenciesModel = require('./../../api/currencies/model')
const hideParamsModel = require('./../../api/hide-params/model')
const exchangersModel = require('./../../api/exchangers/model')
const ratesModel = require('./../../api/rates/model')
module.exports = {
  formatRates: async (unformattedList) => {
    try {
      const byCurr = []
      const result = []
      const temp = []
      const omitValues = await hideParamsModel.find({}, (err, res) => {
        if (err) console.error(err, '--- omitValues err')
        else if (res === null) console.error('null hideparams found')
      })
      for (let i = 0; i < unformattedList.length; i++) {
        let rowArray = unformattedList[i].split(';')
        const fromTo = omitValues[0].hiddenCurrencies.every(el => { return el !== rowArray[0] || (el !== rowArray[1])})
        const changer = omitValues[0].hiddenExchangers.every(el => el !== rowArray[2])
        const isLow = rowArray[3] === '1'
        if (changer && fromTo && isLow) {
          if (!byCurr[rowArray[0]]) byCurr[rowArray[0]] = []
          byCurr[rowArray[0]].push(rowArray)
        } else if (changer && fromTo && !isLow) {
          if (!byCurr[rowArray[1]]) byCurr[rowArray[1]] = []
          byCurr[rowArray[1]].push(rowArray)
        }
      }
      
      const profitArr = []
      byCurr.forEach(el => result.push(el))
      // const test = result.filter(curr => {
      //   let isProfitable = false
      //   result.forEach(cmpCurr => {
      //     const isPair = cmpRate[0] === rate[1] && cmpRate[1] === rate[0]
      //     if (rate[3] === 1 && isPair) {
      //       // receive more then give
      //       if (rate[4] > cmpRate[3]) {
      //         profitArr.push({
      //           rate,
      //           cmpRate
      //         })
      //         isProfitable = true
      //       }
      //     } else if (rate[4] === 1 && isPair) {
      //       // give less then receive
      //       if (rate[3] < cmpRate[4]) {
      //         profitArr.push({
      //           rate,
      //           cmpRate
      //         })
      //         isProfitable = true
      //       }
      //     }
      //   })
      //   return isProfitable
      // })
      // temp.forEach(el => result.push(el))
      return {byCurr: result, profitArr: profitArr}
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
