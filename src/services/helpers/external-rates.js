const axios = require('axios')
module.exports = {
  getExmoORders: async function () {
    try {
      const currencies = 'BTC_USD,BTC_EUR,BTC_RUB,BTC_UAH'
      const exmoOrders = await axios.get(`https://api.exmo.com/v1/order_book/?pair=${currencies}&limit=5`)
      return exmoOrders
    } catch (err) {
      console.error(err)
      return err
    }
  }
}
