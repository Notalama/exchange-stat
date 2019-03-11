const calcAbsCommission = require('./calcAbsCommission')

module.exports = function calcSum (give, receive, sum, rate, absCommis) {
  const profit = receive > give ? sum * receive : sum / give
  return calcAbsCommission(rate, profit, absCommis)
}
