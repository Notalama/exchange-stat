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
        // const isHidden = omitValues[0].hiddenCurrencies.some(id => rowArray[0] === id || rowArray[1] === id) || omitValues[0].hiddenExchangers.some(id => rowArray[2] === id)
        let from = allCurrencies.find(el => el.currencyId === rowArray[0])
        let to = allCurrencies.find(el => el.currencyId === rowArray[1])
        let changer = allExchangers.find(el => el.exchangerId === rowArray[2])
        if (!!from && !!to && !!changer) {
          result.push({
            from: from.currencyId,
            fromTitle: from.currencyTitle,
            to: to.currencyId,
            toTitle: to.currencyTitle,
            changer: changer.exchangerId,
            changerTitle: changer.exchangerTitle,
            give: +rowArray[3],
            receive: +rowArray[4],
            amount: +rowArray[5]
          })
        }
      }
      const refillRates = await ratesModel.collection.drop().then(async res => {
        await ratesModel.insertMany(result, (err, doc) => {
          if (err) console.error(err, '--- insert rates err')
          // else if (res === null) console.error('null currencies found')
          else {
            console.log(doc.slice(0, 1), 'formatter: 48')
          }
        })
      }, rejected => console.error('rejected refill', rejected))
      return result
    } catch (rejectedValue) {
      console.error('formatter err caught ---', rejectedValue)
    }
  },
  getChains: async (result) => {
    let chain = []
    // const currIds = allCurrencies.map(el => el.currencyId)
    for (let i = 0; i < result.length; i++) {
      let bestRates = await ratesModel.aggregate([
        {
          $match: {
            'from': result[i].to,
            'to': result[i].from,
          }
        },
        {
          $project: {
            giveOne: {
              $filter: {
                input: result,
                cond: {
                  $and: [
                    {$eq: ['this.give', 1]},
                    {$gt: ['this.receive', '$give']}
                  ]
                }
              }
            },
            receiveOne: {
              $filter: {
                input: result,
                cond: {
                  $and: [
                    {$eq: ['this.receive', 1]},
                    {$lt: ['this.give', '$receive']}
                  ]
                }
              }
            }
          }
        }
      ])
      chain.push(bestRates)
    }
    return chain
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
