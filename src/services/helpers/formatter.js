const hideParamsModel = require('./../../api/hide-params/model')

module.exports = {
  formatRates: async (unformattedList) => {
    try {
      const byCurr = []
      const profitArr = []
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
          for (let j = 0; j < byCurr[id].length; j++) {
            const el = byCurr[id][j]
            if (rowArray[1] === el[1]) {
              const isProfitable = el[3] > 1
                ? (rowArray[3] > 1 && rowArray[3] < el[3])
                : (rowArray[4] > 1 && rowArray[4] > el[4])
              if (isProfitable) {
                byCurr[id][j] = rowArray
              }
              break
            } else if (j === byCurr[id].length - 1) {
              byCurr[id].push(rowArray)
              break
            }
          }
        } else {
          byCurr[id] = [rowArray]
        }
      }

      // **** three steps ****
      byCurr.forEach(currArr => {
        currArr.forEach(firstEl => {
          if (byCurr[firstEl[1]]) {
            byCurr[firstEl[1]].forEach(secondEl => {
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
                    const megaSum = +firstEl[4] > 1
                      ? sumThree * +firstEl[4]
                      : sumThree / +firstEl[3]
                    const profit = megaSum - sumOne
                    if (profit > 0.05 && profit < 0.5) profitArr.push([firstEl, secondEl, thirdEl, profit])
                  }
                })
              }
            })
          }
        })
      })

      // **** four steps ****
      byCurr.forEach(currArr => {
        currArr.forEach(firstEl => {
          if (byCurr[firstEl[1]]) {
            byCurr[firstEl[1]].forEach(secondEl => {
              if (byCurr[secondEl[1]]) {
                byCurr[secondEl[1]].forEach(thirdEl => {
                  if (byCurr[thirdEl[1]]) {
                    byCurr[thirdEl[1]].forEach(fourthEl => {
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
                        const sumFour = +fourthEl[4] > 1
                          ? sumThree * +fourthEl[4]
                          : sumThree / +fourthEl[3]
                        const megaSum = +firstEl[4] > 1
                          ? sumFour * +firstEl[4]
                          : sumFour / +firstEl[3]
                        const profit = megaSum - sumOne
                        if (profit > 0.1 && profit < 0.3) profitArr.push([firstEl, secondEl, thirdEl, firstEl, profit])
                      }
                    })
                  }
                })
              }
            })
          }
        })
      })
      return profitArr
      // return profitArr.sort((a, b) => b.profit - a.profit)
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
