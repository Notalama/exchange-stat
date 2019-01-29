const axios = require('axios')
module.exports = {
  getExmoORders: async function () {
    try {
      // ,DOGE_BTC,DASH_BTC
      const BTC = 'BTC_USD,BTC_EUR,BTC_RUB,LTC_BTC,XRP_BTC,ETH_BTC,ETC_BTC,ZEC_BTC,DASH_BTC,DOGE_BTC'
      const USD = 'ETH_USD,ETC_USD,LTC_USD,ZEC_USD,XRP_USD,USD_RUB,DOGE_USD,DASH_USD'
      const RUB = 'ETH_RUB,ETC_RUB,LTC_RUB,ZEC_RUB,XRP_RUB,DASH_RUB'
      const EUR = 'ETH_EUR,LTC_EUR,ZEC_EUR,XRP_EUR,'
      const ETH = 'ETH_UAH,ETH_LTC,XRP_ETH'
      const exmoOrders = await axios.get(`https://api.exmo.com/v1/order_book/?pair=${BTC + USD + RUB + EUR + ETH}&limit=5`)
      return exmoOrders
    } catch (err) {
      console.error(err)
      return err
    }
  }
}
