const hideParamsModel = require('./../../api/hide-params/model')

module.exports = {
  formatRates: async (unformattedList) => {
    try {
      const byCurr = []
      const profitArr = []
      const minAmount = 30 // dollars ... to do: editable by User
      const usedCurrencies = []
      const usedExchangers = []
      const profitArray = []
      const omitValues = await hideParamsModel.find({}, (err, res) => {
        if (err) console.error(err, '--- omitValues err')
        else if (res === null) console.error('null hideparams found')
      })
      for (let i = 0; i < unformattedList.length; i++) {
        let rowArray = unformattedList[i].split(';')
        if (!omitValues[0].hiddenCurrencies.every(el => {
          return el !== rowArray[0] && (el !== rowArray[1])
        })) continue
        if (!omitValues[0].hiddenExchangers.every(el => el !== rowArray[2] && rowArray[5] > 0.01)) continue
        let id = rowArray[0]
        if (byCurr[id] !== undefined) {
          byCurr[id].forEach((el, j) => {
            if (rowArray[1] === el[1]) {
              const isProfitable = rowArray[3] <= el[3] && rowArray[4] >= el[4]
              if (isProfitable) {
                byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
              }
            } else if (rowArray[1] !== el[1] && j === byCurr[id].length - 1) {
              byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
            }
          })
        } else {
          byCurr[id] = []
          byCurr[id][rowArray[1]] = rowArray.slice(0, 6)
        }
      }

      // **** three steps ****
      byCurr.forEach(currArr => {
        currArr.forEach(firstEl => {
          if (byCurr[firstEl[1]]) {
            byCurr[firstEl[1]].forEach((secondEl, ind) => {
              if (byCurr[secondEl[1]]) {
                byCurr[secondEl[1]].forEach(thirdEl => {
                  if (thirdEl[1] === firstEl[0]) {
                    const sumOne = +firstEl[4] > 1
                      ? +firstEl[3] * +firstEl[4]
                      : +firstEl[3] / +firstEl[3]
                    const sumTwo = +secondEl[4] > 1
                      ? sumOne * +secondEl[4]
                      : sumOne / +secondEl[3]
                    const sumThree = +thirdEl[4] > 1
                      ? sumTwo * +thirdEl[4]
                      : sumTwo / +thirdEl[3]
                    const profit = sumThree - +firstEl[3]
                    profitArray.push(profit)
                    if (profit > 0) {
                      // *** Chain currencies to dollar compare ***
                      console.log('test', profit)
                      const dolToFirst = byCurr[firstEl[0]][40]
                      const dolToSecond = byCurr[secondEl[0]][40]
                      const dolToThird = byCurr[thirdEl[0]][40]
                      let [amountFirst, amountSecond, amountThird] = [
                        dolToFirst ? +dolToFirst[4] > 1 ? +firstEl[5] * +dolToFirst[4] : +firstEl[5] / +dolToFirst[3] : minAmount,
                        dolToSecond ? +dolToSecond[4] > 1 ? +secondEl[5] * +dolToSecond[4] : +secondEl[5] / +dolToSecond[3] : minAmount,
                        dolToThird ? +dolToThird[4] > 1 ? +thirdEl[5] * +dolToThird[4] : +thirdEl[5] / +dolToThird[3] : minAmount]
                      const exchHaveEnoughMoney = amountFirst > minAmount && amountSecond > minAmount && amountThird > minAmount
                      if (exchHaveEnoughMoney) {
                        profitArr.push([firstEl, secondEl, thirdEl, profit])
                        const isUniqCurr = usedCurrencies.every(el => el !== firstEl[0] && el !== secondEl[0] && el !== thirdEl[0])
                        const isUniqueExch = usedExchangers.every(el => el !== firstEl[2] && el !== secondEl[2] && el !== thirdEl[2])
                        if (isUniqCurr || !usedCurrencies.length) {
                          usedCurrencies.push(firstEl[0], secondEl[0], thirdEl[0])
                        }
                        if (isUniqueExch || !usedExchangers.length) {
                          usedExchangers.push(firstEl[2], secondEl[2], thirdEl[2])
                        }
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
      //                   const sumOne = +firstEl[4] > 1
      //                     ? +firstEl[3] * +firstEl[4]
      //                     : +firstEl[3] / +firstEl[3]
      //                   const sumTwo = +secondEl[4] > 1
      //                     ? sumOne * +secondEl[4]
      //                     : sumOne / +secondEl[3]
      //                   const sumThree = +thirdEl[4] > 1
      //                     ? sumTwo * +thirdEl[4]
      //                     : sumTwo / +thirdEl[3]
      //                   const sumFour = +fourthEl[4] > 1
      //                     ? sumThree * +fourthEl[4]
      //                     : sumThree / +fourthEl[3]
      //                   const profit = sumFour - +firstEl[3]
      //                   if (profit > 0) {
      //                     console.log('test')
      //                     // *** Chain currencies to dollar compare ***
      //                     const dolToFirst = byCurr[firstEl[0]][40]
      //                     const dolToSecond = byCurr[secondEl[0]][40]
      //                     const dolToThird = byCurr[thirdEl[0]][40]
      //                     const dolToFourth = byCurr[fourthEl[0]][40]
      //                     let [amountFirst, amountSecond, amountThird, amountFourth] = [
      //                       dolToFirst ? +dolToFirst[4] > 1 ? +firstEl[5] * +dolToFirst[4] : +firstEl[5] / +dolToFirst[3] : minAmount,
      //                       dolToSecond ? +dolToSecond[4] > 1 ? +secondEl[5] * +dolToSecond[4] : +secondEl[5] / +dolToSecond[3] : minAmount,
      //                       dolToThird ? +dolToThird[4] > 1 ? +thirdEl[5] * +dolToThird[4] : +thirdEl[5] / +dolToThird[3] : minAmount,
      //                       dolToFourth ? +dolToFourth[4] > 1 ? +fourthEl[5] * +dolToFourth[4] : +fourthEl[5] / +dolToFourth[3] : minAmount
      //                     ]
      //                     const exchHaveEnoughMoney = amountFirst > minAmount && amountSecond > minAmount && amountThird > minAmount && amountFourth > minAmount
      //                     if (exchHaveEnoughMoney) {
      //                       profitArr.push([firstEl, secondEl, thirdEl, fourthEl, profit])
      //                       const isUniqCurr = usedCurrencies.every(el => el !== firstEl[0] && el !== secondEl[0] && el !== thirdEl[0] && el !== fourthEl[0])
      //                       const isUniqueExch = usedExchangers.every(el => el !== firstEl[2] && el !== secondEl[2] && el !== thirdEl[2] && el !== fourthEl[2])
      //                       if (isUniqCurr || !usedCurrencies.length) {
      //                         usedCurrencies.push(firstEl[0], secondEl[0], thirdEl[0], fourthEl[0])
      //                       }
      //                       if (isUniqueExch || !usedExchangers.length) {
      //                         usedExchangers.push(firstEl[2], secondEl[2], thirdEl[2], fourthEl[2])
      //                       }
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
      return {profitArr: profitArr.sort((a, b) => +b[3] - +a[3]), usedCurrencies, usedExchangers}
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
