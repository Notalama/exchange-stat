const hideParamsModel = require('./../../api/hide-params/model')
const bonusesModel = require('./../../api/bonuses/model')
module.exports = {
  formatRates: async (unformattedList, minAmount, minProfit) => {
    try {
      const byCurr = []
      const profitArr = []
      // const minAmount = 1000 // dollars ... to do: editable by User
      // const minProfit = 0.5 // % ... todo: editable by User
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
      const calcBonus = (rate, bonus) => {
        const forAll = bonus.from && !bonus.to
        const forOneCurr = !bonus.from && bonus.to && rate[1] === bonus.to
        const forPair = bonus.from && bonus.to && rate[1] === bonus.to && bonus.from === rate[0]
        if (forAll || forOneCurr || forPair) +rate[4] > 1 ? rate[4] = +rate[4] * (+bonus.multi / 10 + 1) : rate[3] = +rate[3] / (+bonus.multi / 10 + 1)
        return rate
      }
      for (let i = 0; i < unformattedList.length; i++) {
        if (i === 1) console.log(unformattedList[i])
        let rowArray = unformattedList[i].split(';')
        if (!omitValues[0].hiddenCurrencies.every(el => el !== rowArray[0] && (el !== rowArray[1]))) continue
        if (!omitValues[0].hiddenExchangers.every(el => el !== rowArray[2] && +rowArray[5] > 0.01)) continue
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
                  byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
                }
                break
              } else if (j === byCurr[id].length - 1) {
                const bonus = bonuses.find(bon => bon.changer === rowArray[2])
                if (bonus) rowArray = calcBonus(rowArray, bonus)
                byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
                break
              }
            }
          }
        } else {
          byCurr[id] = []
          const bonus = bonuses.find(bon => bon.changer === rowArray[2])
          if (bonus) rowArray = calcBonus(rowArray, bonus)
          byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
        }
      }

      // **** two steps ****
      byCurr.forEach(currArr => {
        currArr.forEach(firstEl => {
          if (byCurr[firstEl[1]]) {
            byCurr[firstEl[1]].forEach(secondEl => {
              if (secondEl[1] === firstEl[0]) {
                const sumOne = +firstEl[4] > 1 ? +firstEl[3] * +firstEl[4] : +firstEl[3] / +firstEl[3]
                const sumTwo = +secondEl[4] > 1 ? sumOne * +secondEl[4] : sumOne / +secondEl[3]
                const profit = ((sumTwo - +firstEl[3]) * 100) / +firstEl[3]
                if (profit > minProfit) {
                  // *** Chain currencies to dollar compare ***
                  const dolToFirst = byCurr[firstEl[1]][40]
                  const dolToSecond = byCurr[secondEl[1]][40]
                  let [amountFirst, amountSecond] = [
                    dolToFirst ? +dolToFirst[4] > 1 ? +firstEl[5] * +dolToFirst[4] : +firstEl[5] / +dolToFirst[3] : minAmount,
                    dolToSecond ? +dolToSecond[4] > 1 ? +secondEl[5] * +dolToSecond[4] : +secondEl[5] / +dolToSecond[3] : minAmount]
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
                    const sumOne = +firstEl[4] > 1 ? +firstEl[3] * +firstEl[4] : +firstEl[3] / +firstEl[3]
                    const sumTwo = +secondEl[4] > 1 ? sumOne * +secondEl[4] : sumOne / +secondEl[3]
                    const sumThree = +thirdEl[4] > 1 ? sumTwo * +thirdEl[4] : sumTwo / +thirdEl[3]
                    const profit = ((sumThree - +firstEl[3]) * 100) / +firstEl[3]
                    if (profit > minProfit) {
                      // *** Chain currencies to dollar compare ***
                      const dolToFirst = byCurr[firstEl[1]][40]
                      const dolToSecond = byCurr[secondEl[1]][40]
                      const dolToThird = byCurr[thirdEl[1]][40]
                      let [amountFirst, amountSecond, amountThird] = [
                        dolToFirst ? +dolToFirst[4] > 1 ? +firstEl[5] * +dolToFirst[4] : +firstEl[5] / +dolToFirst[3] : minAmount,
                        dolToSecond ? +dolToSecond[4] > 1 ? +secondEl[5] * +dolToSecond[4] : +secondEl[5] / +dolToSecond[3] : minAmount,
                        dolToThird ? +dolToThird[4] > 1 ? +thirdEl[5] * +dolToThird[4] : +thirdEl[5] / +dolToThird[3] : minAmount]
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
      // byCurr.forEach(currArr => {
      //   currArr.forEach(firstEl => {
      //     if (byCurr[firstEl[1]]) {
      //       byCurr[firstEl[1]].forEach(secondEl => {
      //         if (byCurr[secondEl[1]]) {
      //           byCurr[secondEl[1]].forEach(thirdEl => {
      //             if (byCurr[thirdEl[1]]) {
      //               byCurr[thirdEl[1]].forEach(fourthEl => {
      //                 if (fourthEl[1] === firstEl[0]) {
      //                   const sumOne = +firstEl[4] > 1 ? +firstEl[3] * +firstEl[4] : +firstEl[3] / +firstEl[3]
      //                   const sumTwo = +secondEl[4] > 1 ? sumOne * +secondEl[4] : sumOne / +secondEl[3]
      //                   const sumThree = +thirdEl[4] > 1 ? sumTwo * +thirdEl[4] : sumTwo / +thirdEl[3]
      //                   const sumFour = +fourthEl[4] > 1 ? sumThree * +fourthEl[4] : sumThree / +fourthEl[3]
      //                   const profit = ((sumFour - +firstEl[3]) * 100) / +firstEl[3]
      //                   if (profit > minProfit) {
      //                     // *** Chain currencies to dollar compare ***
      //                     const dolToFirst = byCurr[firstEl[1]][40]
      //                     const dolToSecond = byCurr[secondEl[1]][40]
      //                     const dolToThird = byCurr[thirdEl[1]][40]
      //                     const dolToFourth = byCurr[fourthEl[1]][40]
      //                     let [amountFirst, amountSecond, amountThird, amountFourth] = [
      //                       dolToFirst ? +dolToFirst[4] > 1 ? +firstEl[5] * +dolToFirst[4] : +firstEl[5] / +dolToFirst[3] : minAmount,
      //                       dolToSecond ? +dolToSecond[4] > 1 ? +secondEl[5] * +dolToSecond[4] : +secondEl[5] / +dolToSecond[3] : minAmount,
      //                       dolToThird ? +dolToThird[4] > 1 ? +thirdEl[5] * +dolToThird[4] : +thirdEl[5] / +dolToThird[3] : minAmount,
      //                       dolToFourth ? +dolToFourth[4] > 1 ? +fourthEl[5] * +dolToFourth[4] : +fourthEl[5] / +dolToFourth[3] : minAmount
      //                     ]
      //                     const exchHaveEnoughMoney = amountFirst > minAmount && amountSecond > minAmount && amountThird > minAmount && amountFourth > minAmount
      //                     if (exchHaveEnoughMoney) {
      //                       const dolToInit = byCurr[40][firstEl[0]]
      //                       profitArr.push([firstEl, secondEl, thirdEl, fourthEl, profit, dolToInit])
      //                       // usedCurrencies.push(firstEl[0], secondEl[0], thirdEl[0], fourthEl[0])
      //                       // usedExchangers.push(firstEl[2], secondEl[2], thirdEl[2], fourthEl[2])
      //                     }
      //                   }
      //                 }
      //               })
      //             }
      //           })
      //         }
      //       })
      //     }
      //   })
      // })
      const sorted = profitArr.sort((a, b) =>  +b[b.length - 2] - +a[a.length - 2])
      const filtered = []
      sorted.forEach((el, i) => {
        const prevElProfit = sorted[i - 1] ? sorted[i - 1][sorted[i - 1].length - 2] : 0
        if (sorted[i - 1] && el[el.length - 2].toFixed(4) !== prevElProfit.toFixed(4)) filtered.push(el)
      })
      return {profitArr: filtered, usedCurrencies, usedExchangers}
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


