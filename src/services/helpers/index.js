const formatRates = require('./formatRates')
const {getExmoOrders} = require('./external-rates')
const {
  formatExchangers,
  compileResponse,
  formatCurrencies
} = require('./formatter')

module.exports = {
  formatRates,
  formatExchangers,
  compileResponse,
  formatCurrencies,
  getExmoOrders
}
