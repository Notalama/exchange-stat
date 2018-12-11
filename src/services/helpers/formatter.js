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
          return el !== rowArray[0] || (el !== rowArray[1])
        })) continue
        if (!omitValues[0].hiddenExchangers.every(el => el !== rowArray[2] && rowArray[5] > 0.01)) continue
        let id = rowArray[0]
        if (byCurr[id] !== undefined) {
          const isPair = byCurr[id].some(el => rowArray[1] === el[1])
          if (isPair) {
            const isProfitable = byCurr[id][3] > 1
              ? (rowArray[3] > 1 && rowArray[3] < byCurr[id][3])
              //  || rowArray[3] === 1 || false
              : (rowArray[4] > 1 && rowArray[4] > byCurr[id][4])
              //  || rowArray[4] === 1 || false
            if (isProfitable) byCurr[id] = rowArray
          } else byCurr[id].push(rowArray)
        } else if (rowArray.length === 8) {
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



      // byCurr.forEach(first => {
      //   if (byCurr[first[1]]) {
      //     byCurr[first[1]].forEach(second => {
      //       if (byCurr[second[1]]) {
      //         byCurr[second[1]].forEach(third => {
      //           if (third[1] === first[0]) {
      //             const sumOne = first[3] > 1
      //               ? +second[4] * +first[3] - +second[3] / +first[4]
      //               : +second[4] / +first[3] - +second[3] * +first[4]
      //             const sumTwo = second[3] > 1
      //               ? +third[4] * +sumOne - +third[3] / +sumOne
      //               : +third[4] / +sumOne - +third[3] * +sumOne
      //             const sumThree = third[3] > 1
      //               ? +first[4] * +sumTwo - +first[3] / +sumTwo
      //               : +first[4] / +sumTwo - +first[3] * +sumTwo

      //             if (third[3] > 1 ? sumThree > 1 : sumThree < 1) profitArr.push([first, second, third])
      //           }
      //         })
      //       }
      //     })
      //   }
      // })

      return byCurr
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
