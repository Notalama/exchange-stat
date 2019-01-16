const hideParamsModel = require('./../../api/hide-params/model')
const bonusesModel = require('./../../api/bonuses/model')
const commissionModel = require('./../../api/commision/model')
const tempHideModel = require('./../../api/temp-hide/model')
const {filterOmitValues} = require('./filter-hidden')
module.exports = {
  formatAndFilterRates: async ({unformattedList = [], subscriptions = [], amount = 0}) => {
    const result = {
      byCurr: [],
      readySubs: [],
      absCommis: [],
      omitValues: []
    }
    result.omitValues = await hideParamsModel.find({}, (err, res) => {
      if (err) console.error(err, '--- omitValues err')
      else if (res === null) console.error('null hideparams found')
    })
    const bonuses = await bonusesModel.find({}, (err, res) => {
      if (err) console.error(err, '--- bonuses err')
      else if (res === null) console.error('null bonuses found')
    })
    const tempHiddens = await tempHideModel.find({}, (err, res) => {
      if (err) console.error(err, '--- tempHideModel err')
      else if (res === null) console.error('null tempHiddens found')
    })
    tempHiddens.forEach(el => {
      const isActual = new Date(el.createdAt).getTime() + el.hidePeriod - new Date().getTime()
      if (isActual < 0) tempHideModel.deleteOne({_id: el._id}, (err, doc) => err ? console.error(err, '--- removeTempHidden err') : console.log(doc))
    })
    const commissions = await commissionModel.find({}, (err, res) => {
      if (err) console.error(err, '--- bonuses err')
      else if (res === null) console.error('null bonuses found')
    })
    result.absCommis = commissions.filter(el => el.commissionA[0])

    for (let i = 0; i < unformattedList.length; i++) {
      let rowArray = unformattedList[i].split(';')
      const toRemove = await filterOmitValues({
        rowArray,
        hiddenCurrencies: result.omitValues[0].hiddenCurrencies,
        hiddenExchangers: result.omitValues[0].hiddenExchangers,
        tempHiddens
      })
      if (toRemove) continue
      if (subscriptions) {
        // *** pin to top the subscriptions
        const rowId = rowArray[0] + rowArray[1] + rowArray[2]
        subscriptions.forEach((chain, index) => {
          for (let j = 0; j < chain.length; j++) {
            const rateSub = chain[j]
            const subId = rateSub[0] + rateSub[1] + rateSub[2]
            if (subId === rowId) {
              if (!result.readySubs[index]) result.readySubs[index] = []
              result.readySubs[index][j] = calcCommission(rowArray, commissions).slice(0, 6)
              continue
            }
          }
        })
      }
      let id = rowArray[0]
      if (result.byCurr[id] !== undefined) {
        for (let j = 0; j < result.byCurr[id].length; j++) {
          if (result.byCurr[id][j]) {
            const el = result.byCurr[id][j]
            if (rowArray[1] === el[1]) {
              const isProfitable = +rowArray[3] <= +el[3] && +rowArray[4] >= +el[4]
              if (isProfitable) {
                const bonus = bonuses.find(bon => bon.changer === rowArray[2])
                if (bonus) rowArray = calcBonus(rowArray, bonus)
                rowArray = calcCommission(rowArray, commissions)
                if (!amount) result.byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
                else result.byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
              }
              break
            } else if (j === result.byCurr[id].length - 1) {
              const bonus = bonuses.find(bon => bon.changer === rowArray[2])
              if (bonus) rowArray = calcBonus(rowArray, bonus)
              rowArray = calcCommission(rowArray, commissions)
              if (!amount) result.byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
              else result.byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
              break
            }
          }
        }
      } else {
        result.byCurr[id] = []
        const bonus = bonuses.find(bon => bon.changer === rowArray[2])
        if (bonus) rowArray = calcBonus(rowArray, bonus)
        rowArray = calcCommission(rowArray, commissions)
        !amount ? result.byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
          : result.byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
      }
    }
    console.log(result)
    return result
  }
}

function calcCommission (rate, commissions) {
  commissions.forEach(com => {
    const isCommissedCurr = (com.currency === rate[0] && com.inOut === 'IN') || (com.currency === rate[1] && com.inOut === 'OUT')
    if (isCommissedCurr) {
      const isRateChangerCommissed = com.changer && rate[2] === com.changer
      if (isRateChangerCommissed) {
        if (+com.commission) {
          +rate[4] > 1 ? rate[4] = +rate[4] - +rate[4] * (+com.commission / 100) : rate[3] = +rate[3] + +rate[3] * (+com.commission / 100)
        }
      }
      if (!com.changer && +com.commission) {
        +rate[4] > 1 ? rate[4] = +rate[4] - +rate[4] * (+com.commission / 100) : rate[3] = +rate[3] + +rate[3] * (+com.commission / 100)
      }
    }
  })
  return rate
}

function calcBonus (rate, bonus) {
  const forAll = bonus.from && !bonus.to
  const forOneCurr = !bonus.from && bonus.to && rate[1] === bonus.to
  const forPair = bonus.from && bonus.to && rate[1] === bonus.to && bonus.from === rate[0]
  if (forAll || forOneCurr || forPair) +rate[4] > 1 ? rate[4] = +rate[4] * (+bonus.multi / 100 + 1) : rate[3] = +rate[3] / (+bonus.multi / 100 + 1)
  return rate
}
