const hideParamsModel = require('./../../api/hide-params/model')
const bonusesModel = require('./../../api/bonuses/model')
const commissionModel = require('./../../api/commision/model')
module.exports = {
  formatRates: async (unformattedList, minAmount, minProfit, chainSubscriptions) => {
    try {
      const byCurr = []
      const profitArr = []
      const subscriptionsU = chainSubscriptions ? chainSubscriptions.split('n') : null
      const subscriptions = subscriptionsU ? subscriptionsU.map(el => el.split(';')) : null
      // subscriptions.shift()
      
      if (subscriptions) {
        for (let i = 0; i < subscriptions.length; i++) {
          subscriptions[i].forEach((el, j) => {
            subscriptions[i][j] = el.split(',')
          })
        }
      }
      // console.log(subscriptions, 'subs top -----')
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
      // const wrCom = await commissionModel.insertMany(arr, (err, res) => {
      //   if (err) console.error(err, '--- bonuses err')
      //   else if (res === null) console.error('null bonuses found')
      //   console.log(res)
      // })
      const commissions = await commissionModel.find({}, (err, res) => {
        if (err) console.error(err, '--- bonuses err')
        else if (res === null) console.error('null bonuses found')
      })
      const absCommis = commissions.filter(el => el.commissionA[0])
      const calcBonus = (rate, bonus) => {
        const forAll = bonus.from && !bonus.to
        const forOneCurr = !bonus.from && bonus.to && rate[1] === bonus.to
        const forPair = bonus.from && bonus.to && rate[1] === bonus.to && bonus.from === rate[0]
        if (forAll || forOneCurr || forPair) +rate[4] > 1 ? rate[4] = +rate[4] * (+bonus.multi / 10 + 1) : rate[3] = +rate[3] / (+bonus.multi / 10 + 1)
        return rate
      }
      const calcCommission = (rate) => {
        commissions.forEach(com => {
          if ((com.currency === rate[0] && com.inOut === 'IN') || (com.currency === rate[1] && com.inOut === 'OUT')) {
            if (com.changer && rate[2] === com.changer) {
              if (+com.commission) {
                +rate[4] > 1 ? rate[4] = +rate[4] - (+rate[4] * (+com.commission / 10)) : rate[3] = +rate[3] + (+rate[3] * (+com.commission / 10))
              }
            }
            if (!com.changer && +com.commission) {
              +rate[4] > 1 ? rate[4] = +rate[4] - (+rate[4] * (+com.commission / 10)) : rate[3] = +rate[3] + (+rate[3] * (+com.commission / 10))
            }
          }
        })
        return rate
      }
      const calcAbsCommission = (rate, sum) => {
        absCommis.forEach(com => {
          if ((com.currency === rate[0] && com.inOut === 'IN') || (com.currency === rate[1] && com.inOut === 'OUT')) {
            if (com.changer && rate[2] === com.changer) {
              sum = sum - com.commissionA[0]
            }
            if (!com.changer) {
              sum = sum - com.commissionA[0]
            }
          }
        })
        return sum
      }
      const calcSum = (give, receive, sum) => {
        return receive > give ? sum * receive : sum / give
      }
      const calcChain = (chain) => {
        let chainSum = [+chain[0][3]]
        chain.forEach(rate => {
          chainSum.push(calcSum(+rate[3], +rate[4], chainSum[chainSum.length - 1]))
        })
        console.log(chain, ' \n', chainSum[chainSum.length - 1])
        console.log(chainSum[chainSum.length - 1] - chainSum[0])
        return chainSum[chainSum.length - 1] - chainSum[0]
      }
      for (let i = 0; i < unformattedList.length; i++) {
        let rowArray = unformattedList[i].split(';')
        if (!omitValues[0].hiddenCurrencies.every(el => el !== rowArray[0] && (el !== rowArray[1]))) continue
        if (!omitValues[0].hiddenExchangers.every(el => el !== rowArray[2] && +rowArray[5] > 0.01)) continue
        if (subscriptions) {
          // *** pin to top the subscriptions
          const rowId = rowArray[0] + rowArray[1] + rowArray[2]
          subscriptions.forEach((chain, index) => {
            for (let j = 0; j < chain.length; j++) {
              const rateSub = chain[j]
              const subId = rateSub[0] + rateSub[1] + rateSub[2]
              if (subId === rowId) {
                if (!readySubs[index]) readySubs[index] = []
                readySubs[index][j] = rowArray.slice(0, 6)
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
                  // rowArray = calcCommission(rowArray)
                  byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
                }
                break
              } else if (j === byCurr[id].length - 1) {
                const bonus = bonuses.find(bon => bon.changer === rowArray[2])
                if (bonus) rowArray = calcBonus(rowArray, bonus)
                // rowArray = calcCommission(rowArray)
                byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
                break
              }
            }
          }
        } else {
          byCurr[id] = []
          const bonus = bonuses.find(bon => bon.changer === rowArray[2])
          if (bonus) rowArray = calcBonus(rowArray, bonus)
          // rowArray = calcCommission(rowArray)
          byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
        }
      }

      // **** two steps ****
      byCurr.forEach(currArr => {
        currArr.forEach(firstEl => {
          if (byCurr[firstEl[1]]) {
            byCurr[firstEl[1]].forEach(secondEl => {
              if (secondEl[1] === firstEl[0]) {
                let sumOne = calcSum(+firstEl[3], +firstEl[4], +firstEl[3])
                sumOne = calcAbsCommission(firstEl, sumOne)
                let sumTwo = calcSum(+secondEl[3], +secondEl[4], sumOne)
                sumTwo = calcAbsCommission(secondEl, sumTwo)
                const profit = ((sumTwo - +firstEl[3]) * 100) / +firstEl[3]
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
                }
              }
            })
          }
        })
      })
      // // **** three steps ****
      byCurr.forEach(currArr => {
        currArr.forEach(firstEl => {
          if (byCurr[firstEl[1]]) {
            byCurr[firstEl[1]].forEach((secondEl, ind) => {
              if (byCurr[secondEl[1]]) {
                byCurr[secondEl[1]].forEach(thirdEl => {
                  if (thirdEl[1] === firstEl[0]) {
                    let sumOne = calcSum(+firstEl[3], +firstEl[4], +firstEl[3])
                    sumOne = calcAbsCommission(firstEl, sumOne)
                    let sumTwo = calcSum(+secondEl[3], +secondEl[4], sumOne)
                    sumTwo = calcAbsCommission(secondEl, sumTwo)
                    let sumThree = calcSum(+thirdEl[3], +thirdEl[4], sumTwo)
                    sumThree = calcAbsCommission(thirdEl, sumThree)
                    const profit = ((sumThree - +firstEl[3]) * 100) / +firstEl[3]
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
      byCurr.slice(0, 40).forEach(currArr => {
        currArr.forEach(firstEl => {
          if (byCurr[firstEl[1]]) {
            byCurr[firstEl[1]].forEach(secondEl => {
              if (byCurr[secondEl[1]]) {
                byCurr[secondEl[1]].forEach(thirdEl => {
                  if (byCurr[thirdEl[1]]) {
                    byCurr[thirdEl[1]].forEach(fourthEl => {
                      if (fourthEl[1] === firstEl[0]) {
                        let sumOne = calcSum(+firstEl[3], +firstEl[4], +firstEl[3])
                        sumOne = calcAbsCommission(firstEl, sumOne)
                        let sumTwo = calcSum(+secondEl[3], +secondEl[4], sumOne)
                        sumTwo = calcAbsCommission(secondEl, sumTwo)
                        let sumThree = calcSum(+thirdEl[3], +thirdEl[4], sumTwo)
                        sumThree = calcAbsCommission(thirdEl, sumThree)
                        let sumFour = calcSum(+fourthEl[3], +fourthEl[4], sumThree)
                        sumFour = calcAbsCommission(fourthEl, sumFour)
                        const profit = ((sumFour - +firstEl[3]) * 100) / +firstEl[3]
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
      if (subscriptions) {
        readySubs.forEach((chain, i) => {
          if (chain) readySubs[i].push(calcChain(chain), byCurr[40][chain[0][0]])
        })
      }
      // console.log(profitArr.slice(0, 50), '-----slice 50')
      const sorted = profitArr.sort((a, b) => +b[b.length - 2] - +a[a.length - 2])
      const filtered = []
      sorted.forEach((el, i) => {
        const prevElProfit = sorted[i - 1] ? sorted[i - 1][sorted[i - 1].length - 2] : 0
        if (sorted[i - 1] && el[el.length - 2].toFixed(6) !== prevElProfit.toFixed(6)) filtered.push(el)
      })
      return {
        profitArr: readySubs.concat(sorted),
        usedCurrencies,
        usedExchangers,
        subs: subscriptions ? readySubs.length : undefined
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
