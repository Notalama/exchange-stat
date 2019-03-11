module.exports = function calcAmountToDoll (chain, allRates, minAmount) {
  let exchHaveEnoughMoney = true
  chain.forEach(rate => {
    const dollToCurr = allRates[rate[1]][40]
    if (!rate[6]) rate[6] = dollToCurr ? +dollToCurr[4] > 1 ? +rate[5] * +dollToCurr[4] : +rate[5] / +dollToCurr[3] : +minAmount
    if (rate[6] <= +minAmount) exchHaveEnoughMoney = false
  })
  return {
    chain,
    exchHaveEnoughMoney
  }
}
