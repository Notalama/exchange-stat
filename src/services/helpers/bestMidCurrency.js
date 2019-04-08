const calcChain = require('./calcChain')
const calcAmountToDoll = require('./calcAmountToDoll')
const formatAndFilterRates = require('./formatAndFilterRates')
const hideParamsModel = require('./../../api/hide-params/model')
module.exports = {
  findGoldMiddle: async function ({
    unformattedList = [],
    minAmount,
    idIn,
    idOut
  }) {
    const omitValues = await hideParamsModel.find({}, (err, res) => {
      if (err) console.error(err, '--- omitValues err')
      else if (res === null) console.error('null hideparams found')
    })
    let {
      byCurr,
      absCommis
    } = await formatAndFilterRates({
      unformattedList,
      omitValues,
      minAmount
    })
    let bestMidProfit = -Infinity
    let bestMidRate
    const thirdEl = byCurr[idOut][idIn]
    byCurr.forEach((currArr, a) => {
      currArr.forEach((firstEl, ind) => {
        if (firstEl && byCurr[firstEl[1]]) {
          byCurr[firstEl[1]].forEach(secondEl => {
            if (secondEl && byCurr[secondEl[1]]) {
              const isIdIn = firstEl[0] === idIn
              const isIdMid = firstEl[1] === secondEl[0]
              const isIdOut = secondEl[1] === idOut
              if (isIdIn && isIdMid && isIdOut) {
                const profit = calcChain([firstEl, secondEl, thirdEl], absCommis)
                if (profit > bestMidProfit) {
                  bestMidProfit = profit
                  // *** Chain currencies to dollar compare ***
                  let chain = [firstEl, secondEl, thirdEl]
                  const calcedAmount = calcAmountToDoll(chain, byCurr, minAmount)
                  chain = calcedAmount.chain
                  if (calcedAmount.exchHaveEnoughMoney) {
                    const dolToInit = byCurr[40][firstEl[0]]
                    bestMidRate = chain.concat([profit, dolToInit])
                  }
                }
              }
            }
          })
        } else byCurr[a][ind] = undefined
      })
    })
    return bestMidRate
  }
}
