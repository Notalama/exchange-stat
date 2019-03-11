const axios = require('axios')
module.exports = {
  getExmoOrders: async function () {
    try {
      // ,DOGE_BTC,DASH_BTC
      const BTC = 'BTC_USD,BTC_EUR,BTC_RUB,LTC_BTC,XRP_BTC,ETH_BTC,ETC_BTC,ZEC_BTC,' +
      'DASH_BTC,DOGE_BTC,BTC_USDT,XMR_BTC,EOS_BTC,BTG_BTC,BCH_BTC,EOS_BTC,WAVES_BTC,' +
      'XLM_BTC,OMG_BTC,TRX_BTC,ADA_BTC,NEO_BTC,ZRX_BTC,XEM_BTC,BTC_USDT,LSK_BTC,'
      const USD = 'ETH_USD,ETC_USD,LTC_USD,ZEC_USD,XRP_USD,USD_RUB,DOGE_USD,DASH_USD,' +
      'BTG_USD,XMR_USD,BCH_USD,EOS_USD,WAVES_USD,XLM_USD,OMG_USD,TRX_USD,ADA_USD,NEO_USD,' +
      'ZRX_USD,LSK_USD,XEM_USD,'
      const RUB = 'ETH_RUB,ETC_RUB,LTC_RUB,ZEC_RUB,XRP_RUB,DASH_RUB,BCH_RUB,WAVES_RUB,' +
      'XLM_RUB,TRX_RUB,NEO_RUB,LSK_RUB,USDT_RUB,'
      const EUR = 'ETH_EUR,LTC_EUR,ZEC_EUR,XRP_EUR,XMR_EUR,BCH_EUR,EOS_EUR,XEM_EUR,USDT_EUR,'
      const ETH = 'ETH_UAH,ETH_LTC,XRP_ETH,BTG_ETH,XMR_ETH,BCH_ETH,WAVES_ETH,OMG_ETH,ADA_ETH,ZRX_ETH,ETH_USDT,'
      const USDT = 'BCH_USDT,USDT_USD,DASH_USDT,XRP_USDT,'
      const exmoOrders = await axios.get(`https://api.exmo.com/v1/order_book/?pair=${BTC + USD + RUB + EUR + ETH + USDT}&limit=10`)
      return exmoOrders
    } catch (err) {
      console.error(err, 'exmo orders error')
      return err
    }
  },
  getKunaOrders: async function () {
    try {
      const BTC = 'ethbtc'
      const exmoOrders = await axios.get(`https://api.exmo.com/v1/order_book/?pair=${BTC}&limit=5`)
      return exmoOrders
    } catch (err) {
      console.error(err, 'kuna orders error')
      return err
    }
  }
}
