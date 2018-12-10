const hideParamsModel = require('./../../api/hide-params/model')

module.exports = {
  formatRates: async (unformattedList) => {
    try {
      const byCurr = []
      const result = []
      const profitArr = []
      const omitValues = await hideParamsModel.find({}, (err, res) => {
        if (err) console.error(err, '--- omitValues err')
        else if (res === null) console.error('null hideparams found')
      })
      for (let i = 0; i < unformattedList.length; i++) {
        let rowArray = unformattedList[i].split(';')
        if (!omitValues[0].hiddenCurrencies.every(el => {
          return el !== rowArray[0] || (el !== rowArray[1])
        })) continue
        if (!omitValues[0].hiddenExchangers.every(el => el !== rowArray[2])) continue
        result.push(rowArray)
      }
      result.forEach(exchanger => {
        let id = exchanger[0]
        if (+exchanger[0] > +exchanger[1]) {
          id += exchanger[1]
        } else {
          id = exchanger[1] + exchanger[0]
        }
        if (byCurr[id] !== undefined) {
          byCurr[id].push(exchanger)
        } else {
          byCurr[id] = [exchanger]
        }
      })
      byCurr.forEach(exchangers => {
        exchangers.forEach(_ => {
          let exchangerToCompare = exchangers.pop()
          exchangers.forEach(exch => {
            if (+exchangerToCompare[0] !== +exch[0]) {
              if (+exchangerToCompare[4] > +exch[3] || +exchangerToCompare[3] < +exch[4]) {
                profitArr.push({
                  in: exchangerToCompare,
                  back: exch
                })
              }
            }
          })
        })
      })
      return profitArr
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
