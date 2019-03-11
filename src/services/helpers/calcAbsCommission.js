module.exports = function calcAbsCommission (rate, sum, absCommis) {
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
