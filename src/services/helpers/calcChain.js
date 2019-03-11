const calcSum = require('./calcSum')

module.exports = function calcChain (chain, absCommis) {
  let chainSum = [+chain[0][3]]
  for (let i = 0; i < chain.length; i++) {
    const rate = chain[i]
    chainSum.push(calcSum(+rate[3], +rate[4], chainSum[chainSum.length - 1], rate, absCommis))
  }
  const profit = ((chainSum[chainSum.length - 1] - chainSum[0]) * 100) / chainSum[0]
  return profit
}
