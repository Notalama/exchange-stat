const hideParamsModel = require('./../../api/hide-params/model')
const bonusesModel = require('./../../api/bonuses/model')
const commissionModel = require('./../../api/commision/model')
const tempHideModel = require('./../../api/temp-hide/model')
module.exports = {
  formatRates: async (unformattedList, minAmount, minProfit, chainSubscriptions, ltThreeLinks) => {
    try {
      const byCurr = []
      const profitArr = []
      const subscriptionsU = chainSubscriptions ? chainSubscriptions.split('n') : null
      const subscriptions = subscriptionsU ? subscriptionsU.map(el => el.split(';')) : null
      if (subscriptions) {
        // parse pairs to subscribe to
        for (let i = 0; i < subscriptions.length; i++) {
          subscriptions[i].forEach((el, j) => {
            subscriptions[i][j] = el.split(',')
          })
        }
      }
      const readySubs = []
      const usedCurrencies = []
      const usedExchangers = []
      const omitValues = await hideParamsModel.find({}, (err, res) => {
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
      const absCommis = commissions.filter(el => el.commissionA[0])
      for (let i = 0; i < unformattedList.length; i++) {
        let rowArray = unformattedList[i].split(';')
        if (!omitValues[0].hiddenCurrencies.every(el => el !== rowArray[0] && (el !== rowArray[1]))) continue
        if (!omitValues[0].hiddenExchangers.every(el => el !== rowArray[2] && +rowArray[5] > 0.01)) continue
        if (!tempHiddens.every(el => removeTempHidden(el, rowArray))) continue
        if (subscriptions) {
          // *** pin to top the subscriptions
          const rowId = rowArray[0] + rowArray[1] + rowArray[2]
          subscriptions.forEach((chain, index) => {
            for (let j = 0; j < chain.length; j++) {
              const rateSub = chain[j]
              const subId = rateSub[0] + rateSub[1] + rateSub[2]
              if (subId === rowId) {
                if (!readySubs[index]) readySubs[index] = []
                readySubs[index][j] = calcCommission(rowArray, commissions).slice(0, 6)
                continue
              }
            }
          })
        }
        let id = rowArray[0]
        if (byCurr[id] !== undefined) {
          for (let j = 0; j < byCurr[id].length; j++) {
            if (byCurr[id][j]) {
              const el = byCurr[id][j]
              if (rowArray[1] === el[1]) {
                const isProfitable = +rowArray[3] <= +el[3] && +rowArray[4] >= +el[4]
                if (isProfitable) {
                  const bonus = bonuses.find(bon => bon.changer === rowArray[2])
                  if (bonus) rowArray = calcBonus(rowArray, bonus)
                  rowArray = calcCommission(rowArray, commissions)
                  byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
                }
                break
              } else if (j === byCurr[id].length - 1) {
                const bonus = bonuses.find(bon => bon.changer === rowArray[2])
                if (bonus) rowArray = calcBonus(rowArray, bonus)
                rowArray = calcCommission(rowArray, commissions)
                byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
                break
              }
            }
          }
        } else {
          byCurr[id] = []
          const bonus = bonuses.find(bon => bon.changer === rowArray[2])
          if (bonus) rowArray = calcBonus(rowArray, bonus)
          rowArray = calcCommission(rowArray, commissions)
          byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
        }
      }
      const edgeRateDiffs = []
      // **** two steps ****
      // if (!ltThreeLinks) {
      byCurr.forEach(currArr => {
        currArr.forEach((firstEl, ind) => {
          if (firstEl && byCurr[firstEl[1]]) {
            byCurr[firstEl[1]].forEach((secondEl, j) => {
              if (secondEl && secondEl[1] === firstEl[0]) {
                const profit = calcChain([firstEl, secondEl], absCommis)
                edgeRateDiffs.push(profit)
                if (profit > minProfit) {
                  // *** Chain currencies to dollar compare ***
                  const dolToFirst = byCurr[firstEl[1]][40]
                  const dolToSecond = byCurr[secondEl[1]][40]
                  let [amountFirst, amountSecond] = [
                    dolToFirst ? +dolToFirst[4] > 1 ? +firstEl[5] * +dolToFirst[4] : +firstEl[5] / +dolToFirst[3] : minAmount,
                    dolToSecond ? +dolToSecond[4] > 1 ? +secondEl[5] * +dolToSecond[4] : +secondEl[5] / +dolToSecond[3] : minAmount
                  ]
                  const exchHaveEnoughMoney = amountFirst > minAmount && amountSecond > minAmount
                  if (exchHaveEnoughMoney) {
                    const dolToInit = byCurr[40][firstEl[0]]
                    profitArr.push([firstEl, secondEl, profit, dolToInit])
                    usedCurrencies.push(firstEl[0], secondEl[0])
                    usedExchangers.push(firstEl[2], secondEl[2])
                  }
                } else if (profit < -5) {
                  byCurr[ind][j] = undefined
                }
              }
            })
          }
        })
      })
      // **** three steps ****
      byCurr.forEach(currArr => {
        currArr.forEach(firstEl => {
          if (firstEl && byCurr[firstEl[1]]) {
            byCurr[firstEl[1]].forEach(secondEl => {
              if (secondEl && byCurr[secondEl[1]]) {
                byCurr[secondEl[1]].forEach(thirdEl => {
                  if (thirdEl && firstEl && thirdEl[1] === firstEl[0]) {
                    const profit = calcChain([firstEl, secondEl, thirdEl], absCommis)
                    if (profit > minProfit) {
                      // *** Chain currencies to dollar compare ***
                      const dolToFirst = byCurr[firstEl[1]][40]
                      const dolToSecond = byCurr[secondEl[1]][40]
                      const dolToThird = byCurr[thirdEl[1]][40]
                      let [amountFirst, amountSecond, amountThird] = [
                        dolToFirst ? +dolToFirst[4] > 1 ? +firstEl[5] * +dolToFirst[4] : +firstEl[5] / +dolToFirst[3] : +minAmount,
                        dolToSecond ? +dolToSecond[4] > 1 ? +secondEl[5] * +dolToSecond[4] : +secondEl[5] / +dolToSecond[3] : +minAmount,
                        dolToThird ? +dolToThird[4] > 1 ? +thirdEl[5] * +dolToThird[4] : +thirdEl[5] / +dolToThird[3] : +minAmount
                      ]
                      const exchHaveEnoughMoney = amountFirst > minAmount && amountSecond > minAmount && amountThird > minAmount
                      if (exchHaveEnoughMoney) {
                        const dolToInit = byCurr[40][firstEl[0]]
                        profitArr.push([firstEl, secondEl, thirdEl, profit, dolToInit])
                        usedCurrencies.push(firstEl[0], secondEl[0], thirdEl[0])
                        usedExchangers.push(firstEl[2], secondEl[2], thirdEl[2])
                      }
                    }
                  }
                })
              }
            })
          }
        })
      })
      // **** four steps ****
      // } else {
      let n = []
      omitValues[0].fourLinks.forEach(id => {
        if (byCurr[id]) n[id] = byCurr[id]
      })
      n.forEach(currArr => {
        currArr.forEach(firstEl => {
          if (firstEl && byCurr[firstEl[1]]) {
            byCurr[firstEl[1]].forEach(secondEl => {
              if (secondEl && byCurr[secondEl[1]]) {
                //  &&
                // (byCurr[secondEl[0]][firstEl[0]]
                //   ? +calcChain([firstEl, secondEl, byCurr[secondEl[0]][firstEl[0]]], absCommis) > -5
                //   : true))
                byCurr[secondEl[1]].forEach(thirdEl => {
                  if (thirdEl && byCurr[thirdEl[1]]) {
                    byCurr[thirdEl[1]].forEach(fourthEl => {
                      if (fourthEl && fourthEl[1] === firstEl[0]) {
                        const profit = calcChain([firstEl, secondEl, thirdEl, fourthEl], absCommis)
                        if (profit > minProfit) {
                          // *** Chain currencies to dollar compare ***
                          const dolToFirst = byCurr[firstEl[1]][40]
                          const dolToSecond = byCurr[secondEl[1]][40]
                          const dolToThird = byCurr[thirdEl[1]][40]
                          const dolToFourth = byCurr[fourthEl[1]][40]
                          let [amountFirst, amountSecond, amountThird, amountFourth] = [
                            dolToFirst ? +dolToFirst[4] > 1 ? +firstEl[5] * +dolToFirst[4] : +firstEl[5] / +dolToFirst[3] : +minAmount,
                            dolToSecond ? +dolToSecond[4] > 1 ? +secondEl[5] * +dolToSecond[4] : +secondEl[5] / +dolToSecond[3] : +minAmount,
                            dolToThird ? +dolToThird[4] > 1 ? +thirdEl[5] * +dolToThird[4] : +thirdEl[5] / +dolToThird[3] : +minAmount,
                            dolToFourth ? +dolToFourth[4] > 1 ? +fourthEl[5] * +dolToFourth[4] : +fourthEl[5] / +dolToFourth[3] : +minAmount
                          ]
                          const exchHaveEnoughMoney = amountFirst > minAmount && amountSecond > minAmount && amountThird > minAmount && amountFourth > minAmount
                          if (exchHaveEnoughMoney) {
                            const dolToInit = byCurr[40][firstEl[0]]
                            profitArr.push([firstEl, secondEl, thirdEl, fourthEl, profit, dolToInit])
                          }
                        }
                      }
                    })
                  }
                })
              }
            })
          }
        })
      })
      // }
      // calc and format pairs for subscriptions
      if (subscriptions) {
        readySubs.forEach((chain, i) => {
          if (chain) readySubs[i].push(calcChain(chain, absCommis), byCurr[40][chain[0][0]])
        })
      }
      const sorted = profitArr.sort((a, b) => +b[b.length - 2] - +a[a.length - 2])
      const filtered = []
      // hide clone chains
      sorted.forEach((el, i) => {
        const prevElProfit = sorted[i - 1] ? sorted[i - 1][sorted[i - 1].length - 2] : 0
        if (sorted[i - 1] && el[el.length - 2].toFixed(6) !== prevElProfit.toFixed(6)) filtered.push(el)
      })
      return {
        profitArr: readySubs.concat(filtered),
        usedCurrencies,
        usedExchangers,
        subs: subscriptions ? readySubs.length : undefined,
        edgeRateDiffs: edgeRateDiffs
      }
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
function calcAbsCommission (rate, sum, absCommis) {
  absCommis.forEach(com => {
    const isCommissedCurr = (com.currency === rate[0] && com.inOut === 'IN') || (com.currency === rate[1] && com.inOut === 'OUT')
    if (isCommissedCurr) {
      const isRateChangerCommissed = com.changer && rate[2] === com.changer
      if (isRateChangerCommissed) {
        sum = sum - com.commissionA[0]
      }
      if (!com.changer) {
        sum = sum - com.commissionA[0]
      }
    }
  })
  return sum
}

function calcBonus (rate, bonus) {
  const forAll = bonus.from && !bonus.to
  const forOneCurr = !bonus.from && bonus.to && rate[1] === bonus.to
  const forPair = bonus.from && bonus.to && rate[1] === bonus.to && bonus.from === rate[0]
  if (forAll || forOneCurr || forPair) +rate[4] > 1 ? rate[4] = +rate[4] * (+bonus.multi / 100 + 1) : rate[3] = +rate[3] / (+bonus.multi / 100 + 1)
  return rate
}

function calcSum (give, receive, sum, rate, absCommis) {
  const profit = receive > give ? sum * receive : sum / give
  return calcAbsCommission(rate, profit, absCommis)
}
function calcChain (chain, absCommis) {
  let chainSum = [+chain[0][3]]
  for (let i = 0; i < chain.length; i++) {
    const rate = chain[i]
    chainSum.push(calcSum(+rate[3], +rate[4], chainSum[chainSum.length - 1], rate, absCommis))
  }
  const profit = ((chainSum[chainSum.length - 1] - chainSum[0]) * 100) / chainSum[0]
  return profit
}

function removeTempHidden (hideParams, rate) {
  const toRemove = (rate[0] === hideParams.inCurrencyId || rate[1] === hideParams.outCurrencyId) && rate[2] === hideParams.changerId
  return !toRemove
}
