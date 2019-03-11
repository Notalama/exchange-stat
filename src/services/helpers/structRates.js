module.exports = function (unformattedList) {
  const structuredRates = []
  unformattedList.forEach(rate => {
    rate = rate.split(';')
    console.log(rate, '182')
    const rateId = rate[0] + rate[1]
    if (structuredRates[rateId]) structuredRates[rateId].push(rate)
    else {
      structuredRates[rateId] = []
      structuredRates[rateId].push(rate)
    }
  })
  return structuredRates
}
