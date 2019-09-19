const hideParamsModel = require('./../../api/hide-params/model')
const exchangersModel = require('./../../api/exchangers/model')
const currenciesModel = require('./../../api/currencies/model')
module.exports = {
  formatCurrencies: async (unformattedList) => {
    const result = []
    let omitCurrencies = []
    await hideParamsModel.find({
      hide: true
    }, (err, res) => {
      if (err) console.error(err, '----- err')
      else if (res === null) console.error('null triggered')
      else {
        console.log(res)
        res[0] ? omitCurrencies = res[0].hiddenCurrencies : omitCurrencies = []
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
    // custom exmo
    result.push({
      exchangerId: '1024',
      exchangerTitle: 'Exmo Trade'
    },
    {
      exchangerId: '1025',
      exchangerTitle: 'Kuna Trade'
    })
    return result
  },
  compileResponse: async (result) => {
    const response = []
    const allCurrencies = await currenciesModel.find({}, {
      currencyId: 1,
      currencyTitle: 1
    }, (err, res) => {
      if (err) console.error(err, '--- allCurrencies err')
      else if (res === null) console.error('null currencies found')
    })
    const allChangers = await exchangersModel.find({}, {
      exchangerId: 1,
      exchangerTitle: 1
    }, (err, res) => {
      if (err) console.error(err, '--- allCurrencies err')
      else if (res === null) console.error('null currencies found')
    })
    result.profitArr.forEach((chain, index) => {
      const compiled = []
      for (let i = 0; i < chain.length - 2; i++) {
        const el = chain[i]
        const fromT = allCurrencies.find(cur => el[0] === cur.currencyId)
        const toT = allCurrencies.find(cur => el[1] === cur.currencyId)
        const chan = allChangers.find(exch => el[2] === exch.exchangerId)
        compiled.push({
          from: el[0],
          fromTitle: fromT ? fromT.currencyTitle : '',
          to: el[1],
          toTitle: toT ? toT.currencyTitle : '',
          changer: el[2],
          changerTitle: chan ? chan.exchangerTitle : '',
          give: +el[3],
          receive: +el[4],
          amount: {
            amount: +el[5],
            dollarAmount: el[6]
          }
        })
      }
      const profitPercent = chain[chain.length - 2].toFixed(2)
      if (profitPercent > 500) return
      compiled.push(chain[chain.length - 1], chain[chain.length - 2], index < result.subs)
      response.push(compiled)
    })
    return response
  }
}
