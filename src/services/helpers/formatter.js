const hideParamsModel = require('./../../api/hide-params/model')
const { formatAndFilterRates } = require('./format-and-filter')
const exchangersModel = require('./../../api/exchangers/model')
const currenciesModel = require('./../../api/currencies/model')
module.exports = {
  formatRates: async (unformattedList, minAmount, minProfit, chainSubscriptions, ltThreeLinks) => {
    try {
      const profitArr = []
      const subscriptionsU = chainSubscriptions ? chainSubscriptions.split('n') : null
      const subscriptions = subscriptionsU ? subscriptionsU.map(el => el.split(';')) : null // to return
      if (subscriptions) {
        // parse pairs to subscribe to
        for (let i = 0; i < subscriptions.length; i++) {
          subscriptions[i].forEach((el, j) => {
            subscriptions[i][j] = el.split(',')
          })
        }
      }
      const { byCurr, readySubs, absCommis, omitValues } = await formatAndFilterRates({unformattedList, subscriptions})

      // **** two steps ****
      byCurr.forEach((currArr, a) => {
        currArr.forEach((firstEl, ind) => {
          if (firstEl && byCurr[firstEl[1]]) {
            byCurr[firstEl[1]].forEach((secondEl, j) => {
              if (secondEl && secondEl[1] === firstEl[0]) {
                let chain = [firstEl, secondEl]
                const profit = calcChain([firstEl, secondEl], absCommis)
                if (profit > minProfit) {
                  // *** Chain currencies to dollar compare ***
                  const calcedAmount = calcAmountToDoll(chain, byCurr, minAmount)
                  chain = calcedAmount.chain
                  if (calcedAmount.exchHaveEnoughMoney) {
                    const dolToInit = byCurr[40][firstEl[0]]
                    profitArr.push(chain.concat([profit, dolToInit]))
                  }
                } else if (profit < -8) byCurr[ind][j] = undefined
              }
            })
          } else byCurr[a][ind] = undefined
        })
      })
      // **** three steps ****
      byCurr.forEach((currArr, a) => {
        currArr.forEach((firstEl, ind) => {
          if (firstEl && byCurr[firstEl[1]]) {
            byCurr[firstEl[1]].forEach(secondEl => {
              if (secondEl && byCurr[secondEl[1]]) {
                byCurr[secondEl[1]].forEach(thirdEl => {
                  if (thirdEl && thirdEl[1] === firstEl[0]) {
                    let chain = [firstEl, secondEl, thirdEl]
                    const profit = calcChain([firstEl, secondEl, thirdEl], absCommis)
                    if (profit > minProfit) {
                      // *** Chain currencies to dollar compare ***
                      const calcedAmount = calcAmountToDoll(chain, byCurr, minAmount)
                      chain = calcedAmount.chain
                      if (calcedAmount.exchHaveEnoughMoney) {
                        const dolToInit = byCurr[40][firstEl[0]]
                        profitArr.push(chain.concat([profit, dolToInit]))
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
      if (ltThreeLinks) {
        let n = []
        omitValues[0].fourLinks.forEach(id => {
          if (byCurr[id]) n[id] = byCurr[id]
        })
        n.forEach(currArr => {
          currArr.forEach(firstEl => {
            if (firstEl && byCurr[firstEl[1]]) {
              byCurr[firstEl[1]].forEach(secondEl => {
                if (secondEl && byCurr[secondEl[1]]) {
                  byCurr[secondEl[1]].forEach(thirdEl => {
                    if (thirdEl && byCurr[thirdEl[1]]) {
                      byCurr[thirdEl[1]].forEach(fourthEl => {
                        if (fourthEl && fourthEl[1] === firstEl[0]) {
                          let chain = [firstEl, secondEl, thirdEl, fourthEl]
                          const profit = calcChain(chain, absCommis)
                          if (profit > minProfit) {
                            // *** Chain currencies to dollar compare ***
                            const calcedAmount = calcAmountToDoll(chain, byCurr, minAmount)
                            chain = calcedAmount.chain
                            if (calcedAmount.exchHaveEnoughMoney) {
                              const dolToInit = byCurr[40][firstEl[0]]
                              profitArr.push(chain.concat([profit, dolToInit]))
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
      }
      // calc and format pairs for subscriptions
      if (subscriptions) {
        readySubs.forEach(chain => {
          // *** Chain currencies to dollar compare ***
          chain = calcAmountToDoll(chain, byCurr, minAmount).chain
          chain.push(calcChain(chain, absCommis), byCurr[40][chain[0][0]])
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
        subs: subscriptions ? readySubs.length : undefined
      }
    } catch (rejectedValue) {
      console.error('formatter err caught ---', rejectedValue)
    }
  },
  formatOne: async ({unformattedList = [], chain = [], amount = 0}) => {
    const {byCurr, absCommis} = await formatAndFilterRates({unformattedList, amount})
    const builtChain = []
    console.log(chain, 'chain')
    chain.forEach((el, i) => {
      const currFrom = byCurr[el[0]]
      if (currFrom) {
        const currTo = currFrom[el[1]]
        if (currTo) {
          console.log(currTo, 'currTo')
          builtChain[i] = currTo.reduce((prev, curr) => {
            const dollToCurr = byCurr[curr[1]][40] || 0
            console.log(curr)
            const isRateBetter = +curr[3] <= +prev[3] && +curr[4] >= +prev[4]
            const rateAmout = +dollToCurr[4] > 1 ? +curr[5] * +dollToCurr[4] : +curr[5] / +dollToCurr[3]
            curr[6] = rateAmout
            return isRateBetter && rateAmout > amount ? curr : prev
          })
        } else return 'Select other currencies'
      } else return 'Select other currencies'
    })
    console.log(builtChain, 'builtChain')
    const profit = calcChain(builtChain, absCommis)
    const dolToInit = byCurr[40][builtChain[0]]
    return builtChain.concat([profit, dolToInit])
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
          give: el[3],
          receive: el[4],
          amount: {amount: el[5], dollarAmount: el[6]}
        })
      }

      compiled.push(chain[chain.length - 1], chain[chain.length - 2], index < result.subs)
      response.push(compiled)
    })
    return response
  }
}

function calcAmountToDoll (chain, allRates, minAmount) {
  let exchHaveEnoughMoney = true
  chain.forEach(rate => {
    const dollToCurr = allRates[rate[1]][40]
    if (!rate[6]) rate[6] = dollToCurr ? +dollToCurr[4] > 1 ? +rate[5] * +dollToCurr[4] : +rate[5] / +dollToCurr[3] : +minAmount
    if (rate[6] <= +minAmount) exchHaveEnoughMoney = false
  })
  return {chain, exchHaveEnoughMoney}
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
