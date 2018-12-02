module.exports = {
  formatRates: (unformattedList) => {
    const result = []
    for (let i = 0; i < unformattedList.length; i++) {
      const rowArray = unformattedList[i].split(';')
      result.push({
        givenCurrId: rowArray[0],
        receivedCurrId: rowArray[1],
        changerId: rowArray[2],
        rateToGive: rowArray[3],
        rateToReceive: rowArray[4],
        fullChangerCapital: rowArray[5]
      })
    }
    return result
  },
  formatCurrencies: (unformattedList) => {
    const result = []
    for (let i = 0; i < unformattedList.length; i++) {
      const rowArray = unformattedList[i].split(';')
      result.push({
        currencyId: rowArray[0],
        currencyTitle: rowArray[2]
      })
    }
    return result
  },
  formatExchangers: (unformattedList) => {
    const result = []
    for (let i = 0; i < unformattedList.length; i++) {
      const rowArray = unformattedList[i].split(';')
      result.push({
        exchangerId: rowArray[0],
        exchangerTitle: rowArray[1]
      })
    }
    return result
  },
  // filterRates: (rates) => {
  //   return rates.filter((el) => {
  //     const matchToGiven = el.givenCurrId === 
      
  //     el.receivedCurrId) === 
  //   })
  // }
}
