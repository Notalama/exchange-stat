const hideParamsModel = require('./../../api/hide-params/model')
const bonusesModel = require('./../../api/bonuses/model')
const commissionModel = require('./../../api/commision/model')
const tempHideModel = require('./../../api/temp-hide/model')
const { filterOmitValues } = require('./filter-hidden')
const calcBonus = require('./calcBonus')
const calcCommission = require('./calcCommission')
const calcDollAmount = require('./calcDollAmount')

module.exports = async function formatAndFilterRates ({
  unformattedList = [],
  subscriptions = [],
  omitValues = null,
  minAmount = 0,
  exmoRates = []
}) {
  const result = {
    byCurr: [],
    readySubs: [],
    absCommis: []
  }
  if (!omitValues) {
    omitValues = await hideParamsModel.find({}, (err, res) => {
      if (err) console.error(err, '--- omitValues err')
      else if (res === null) console.error('null hideparams found')
    })
  }
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
    if (isActual < 0) {
      tempHideModel.deleteOne({
        _id: el._id
      }, (err, doc) => err ? console.error(err, '--- removeTempHidden err') : console.log(doc))
    }
  })
  const commissions = await commissionModel.find({}, (err, res) => {
    if (err) console.error(err, '--- bonuses err')
    else if (res === null) console.error('null bonuses found')
  })
  result.absCommis = commissions.filter(el => el.commissionA[0])
  // const byCurrExmo = module.exports.structRates(exmoRates)
  // console.log(byCurrExmo, '37')
  try {
    const tempTopRates = []
    for (let i = 0; i < unformattedList.length; i++) {
      let rowArray = unformattedList[i].split(';')
      rowArray.splice(6, rowArray.length)
      const toRemove = filterOmitValues({
        rowArray,
        hiddenCurrencies: omitValues[0].hiddenCurrencies,
        hiddenExchangers: omitValues[0].hiddenExchangers,
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
              const bonus = bonuses.find(bon => (bon.changer === rowArray[2] && (bon.from === rowArray[0] || bon.to === rowArray[1]))) || bonuses.find(bon => bon.changer === rowArray[2])
              if (bonus) rowArray = calcBonus(rowArray, bonus)
              rowArray = calcCommission(rowArray, commissions)
              const isProfitable = +rowArray[3] <= +el[3] && +rowArray[4] >= +el[4]
              const isOverRated = tempTopRates[rowArray[1]] ? Math.abs(+rowArray[3] - +tempTopRates[rowArray[1]][3]) < +tempTopRates[rowArray[1]][3] || Math.abs(+rowArray[4] - +tempTopRates[rowArray[1]][4]) < +tempTopRates[rowArray[1]][4] : false
              if (isProfitable && !isOverRated) {
                if (rowArray[2] === '1025' && el[2] !== '1025') tempTopRates[rowArray[1]] = el
                result.byCurr[id][rowArray[1]] = rowArray
              }
              break
            } else if (j === result.byCurr[id].length - 1) {
              const bonus = bonuses.find(bon => (bon.changer === rowArray[2] && (bon.from === rowArray[0] || bon.to === rowArray[1]))) || bonuses.find(bon => bon.changer === rowArray[2])
              if (bonus) rowArray = calcBonus(rowArray, bonus)
              rowArray = calcCommission(rowArray, commissions)
              result.byCurr[id][rowArray[1]] = rowArray
              break
            }
          }
        }
      } else {
        result.byCurr[id] = []
        const bonus = bonuses.find(bon => (bon.changer === rowArray[2] && (bon.from === rowArray[0] || bon.to === rowArray[1]))) || bonuses.find(bon => bon.changer === rowArray[2])
        if (bonus) rowArray = calcBonus(rowArray, bonus)
        rowArray = calcCommission(rowArray, commissions)
        // to filter by dollar amount of changer
        if (rowArray[1] === '40') {
          result.byCurr.forEach(currArr => {
            let rateAmount
            if (currArr[rowArray[1]]) {
              rateAmount = calcDollAmount(currArr[rowArray[1]][5], rowArray, minAmount)
              if (rateAmount < +minAmount) {
                currArr[rowArray[1]] = undefined
              } else currArr[rowArray[1]][6] = rateAmount
            }
          })
        }
        result.byCurr[id][rowArray[1]] = rowArray
      }
    }
  } catch (e) {
    console.log(e, 'Format and filter err')
  }
  return result
}
