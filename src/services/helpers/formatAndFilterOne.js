const hideParamsModel = require('./../../api/hide-params/model')
const bonusesModel = require('./../../api/bonuses/model')
const commissionModel = require('./../../api/commision/model')
const tempHideModel = require('./../../api/temp-hide/model')
const { filterOmitValues } = require('./filter-hidden')
const calcBonus = require('./calcBonus')
const calcCommission = require('./calcCommission')

module.exports = async function formatAndFilterOne ({
  unformattedList,
  chain,
  amount,
  allRates
}) {
  const profitArr = []
  const otherRates = []
  const omitValues = await hideParamsModel.find({}, (err, res) => {
    if (err) console.error(err, '--- omitValues err')
    else if (res === null) console.error('null hideparams found')
  })
  const commissions = await commissionModel.find({}, (err, res) => {
    if (err) console.error(err, '--- bonuses err')
    else if (res === null) console.error('null bonuses found')
  })
  const absCommis = commissions.filter(el => el.commissionA[0])
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
      tempHideModel.deleteOne({_id: el._id}, (err, doc) => err ? console.error(err, '--- removeTempHidden err') : console.log(doc))
    }
  })
  for (let i = 0; i < unformattedList.length; i++) {
    let rowArray = unformattedList[i].split(';')
    rowArray.splice(6, rowArray.length)
    const toRemove = filterOmitValues({
      rowArray,
      // hiddenCurrencies: omitValues[0].hiddenCurrencies,
      hiddenExchangers: omitValues[0].hiddenExchangers,
      tempHiddens
    })
    if (toRemove) continue
    for (let j = 0; j < chain.length; j++) {
      const currIdTo = (j + 1) < (chain.length) ? j + 1 : 0
      if (chain[j] === rowArray[0] && chain[currIdTo] === rowArray[1]) {
        if (allRates[rowArray[1]]) {
          const dollToCurr = allRates[rowArray[1]][40]
          if (!rowArray[6]) rowArray[6] = dollToCurr ? +dollToCurr[4] > 1 ? +rowArray[5] * +dollToCurr[4] : +rowArray[5] / +dollToCurr[3] : +amount
          if (+rowArray[6] <= +amount) continue
          if (profitArr[j] !== undefined) {
            const bonus = bonuses.find(bon => bon.changer === rowArray[2])
            if (bonus) rowArray = calcBonus(rowArray, bonus)
            rowArray = calcCommission(rowArray, commissions)
            const isProfitable = +rowArray[3] <= +profitArr[j][3] && +rowArray[4] >= +profitArr[j][4]
            if (isProfitable) {
              otherRates[j].push(profitArr[j])
              profitArr[j] = rowArray
            } else {
              otherRates[j].push(rowArray)
            }
          } else {
            otherRates[j] = []
            profitArr[j] = rowArray
          }
        }
      }
    }
  }
  return {
    profitArr,
    absCommis,
    otherRates
  }
}
