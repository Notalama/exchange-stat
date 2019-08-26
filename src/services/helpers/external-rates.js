const axios = require('axios')
module.exports = {
  getExmoOrders: async function ({
    exmoOrdersCount = null
  }) {
    try {
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
      const exmoOrders = await axios.get(`https://api.exmo.com/v1/order_book/?pair=${BTC + USD + RUB + EUR + ETH + USDT}&limit=${exmoOrdersCount || 5}`)
      return exmoOrders
    } catch (err) {
      console.error(err, 'exmo orders error')
      return err
    }
  },
  getKunaOrders: async function () {
    try {
      // tslint:disable-next-line:prefer-const
      let kunaOrders = {};
      // tslint:disable-next-line:max-line-length
      const kunaCurr = ['btcusdt', 'btcusd', 'btcrub', 'ethbtc', 'eosbtc'];
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < kunaCurr.length; i++) {
        kunaOrders[kunaCurr[i]] = await axios.get(`https://api.kuna.io/v3/book/${kunaCurr[i]}`)
      }
      return kunaOrders;
    } catch (err) {
      console.error(err, 'kuna orders error');
      return err;
    }
  },
  buildStringRates: function ({
    ask,
    bid,
    element,
    exmoOrdersCount,
    currencies,
    divIndex
  }) {
    // const frst = currencies.find(curr => curr.title === key.substring(0, divIndex))
    // const scnd = currencies.find(curr => curr.title === key.substring(divIndex + 1, key.length))
    // if (frst && scnd) {
    //   let giveAccum = 0
    //   let receiveAccum = 0
    //   let balanceAccum = 0
    //   element.ask.forEach(el => {
    //     giveAccum += (+el[0] < 1) ? 1 : +el[0]
    //     receiveAccum += (+el[0] < 1) ? (1 / +el[0]) : 1
    //     balanceAccum += +el[1]
    //   })
    //   giveAccum = (giveAccum / element.ask.length).toFixed(6)
    //   receiveAccum = (receiveAccum / element.ask.length).toFixed(6)
    //   let rateAsk = `${scnd.id};${frst.id};899;${giveAccum};${receiveAccum};${balanceAccum}`
    //   exmoRatesUnform.push(rateAsk)

    //   let giveAcc = 0
    //   let receiveAcc = 0
    //   let balanceAcc = 0
    //   element.bid.forEach(el => {
    //     giveAcc += (+el[0] < 1) ? (1 / +el[0]) : 1
    //     receiveAcc += (+el[0] < 1) ? 1 : +el[0]
    //     balanceAcc += +el[2]
    //   })

    //   giveAcc = (giveAcc / element.bid.length).toFixed(6)
    //   receiveAcc = (receiveAcc / element.bid.length).toFixed(6)
    //   let a = receiveAcc !== 1 ? (giveAcc !== 1 ? console.log(giveAcc, receiveAcc, 84) : null) : null
    //   let rateBid = `${frst.id};${scnd.id};899;${giveAcc};${receiveAcc};${balanceAcc}`
    //   exmoRatesUnform.push(rateBid)
    //   }
  }
}
