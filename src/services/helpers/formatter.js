const hideParamsModel = require('./../../api/hide-params/model')

module.exports = {
  formatRates: async (unformattedList) => {
    try {
      const byCurr = []
      const result = []
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
      // result.forEach(exchanger => {
      //   let id = exchanger[0]
      //   if (+exchanger[0] > +exchanger[1]) {
      //     id += exchanger[1]
      //   } else {
      //     id = exchanger[1] + exchanger[0]
      //   }
      //   if (byCurr[id] !== undefined) {

      //     if (isProfitable) {
      //       byCurr[id].push(exchanger)
      //     }
      //   } else {
      //     byCurr[id] = [exchanger]
      //   }
      // })

      // byCurr.forEach(exchangers => {
      //   exchangers.forEach(_ => {
      //     let exchangerToCompare = exchangers.pop()
      //     exchangers.forEach(exch => {
      //       const pairProfitable = +exchangerToCompare[0] !== +exch[0] && (+exchangerToCompare[4] > +exch[3] || +exchangerToCompare[3] < +exch[4])
      //       if (pairProfitable) {
      //         let profit = null
      //         if (exch[3] > exchangerToCompare[4]) {
      //           profit = +exchangerToCompare[4] * +exch[3] - +exchangerToCompare[3] / +exch[4]
      //         } else {
      //           profit = +exchangerToCompare[4] / +exch[3] - +exchangerToCompare[3] * +exch[4]
      //         }
      //         const isProfitable = profit > 0.003 && +exch[5] > 0.1
      //         if (isProfitable) {
      //           profitArr.push({
      //             in: exchangerToCompare,
      //             back: exch,
      //             profit: profit
      //           })
      //         }
      //       }
      //     })
      //   })
      // })
      /*
        [
          [
            rate 1-2 ->, rate 1-3 <-, rate 1-4 ->, rate 1-5 <-
          ],
          [
            rate 2-1 ->, rate 2-3 <-, rate 2-4 ->, rate 2-5 <-
          ],
          [
            rate 3-1 ->, rate 3-2 <-, rate 3-4 ->, rate 3-5 <-
          ],
          ...
        ]
        bestEachPairValue = (only 4 best values in array, but Вт 11:30 only the best) determine in first loop

      */



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
                    if ((megaSum - sumOne) > 1.05) profitArr.push([firstEl, secondEl, thirdEl])
                  }
                })
              }
            })
          }
        })
      })
      // byCurr.forEach(el => {
      //   result.push(el)
      // })
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
