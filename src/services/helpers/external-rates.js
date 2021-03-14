const axios = require('axios')
const { binanceCurrenciesMap } = require('../../api/best-change/binance-currencies')
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
      let kunaOrders = {}
      // tslint:disable-next-line:max-line-length
      const kunaCurr = ['btcusdt', 'btcusd', 'btcrub', 'ethbtc', 'eosbtc', 'btcuah']
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < kunaCurr.length; i++) {
        kunaOrders[kunaCurr[i]] = await axios.get(`https://api.kuna.io/v3/book/${kunaCurr[i]}`)
      }
      
      return kunaOrders
    } catch (err) {
      console.error(err, 'kuna orders error')
      return err
    }
  },
  getBinanceOrders: async function () {
    try {
      const binanceUrl = 'https://api1.binance.com/api/v3/ticker/bookTicker';
      const binanceResponse = await axios.get(binanceUrl);
      const result = handleBinanceResponse(binanceResponse);
      return result;
    } catch (err) {
      console.error(err, 'binance orders error')
      return [];
    }
  }
}

function handleBinanceResponse(binanceResponse) {
  const resArr = binanceResponse.data.filter((el) => filterSymbols(el));
  return resArr.reduce((acc, rate, i) => {
    const {give, receive} = binanceCurrenciesMap[rate.symbol] || {};
    if (!give || !receive) {
      return [...acc];
    }
    const giveBid = +rate.askPrice < 1 ? '1' : rate.askPrice;
    const receiveBid = +rate.askPrice < 1 ? 1 / rate.askPrice : '1';
    const receiveAsk = +rate.bidPrice < 1 ? '1' : rate.bidPrice;
    const giveAsk = +rate.bidPrice < 1 ? 1 / rate.bidPrice : '1';
    const bidRate = `${receive};${give};510;${giveBid};${receiveBid};${rate.bidQty}`;
    const askRate = `${give};${receive};510;${giveAsk};${receiveAsk};${rate.askQty}`;
    if (!i || i === 1) return [bidRate, askRate];
    return [...acc, bidRate, askRate];
  });
}

function filterSymbols(rate) {
  const { symbol, askQty, bidQty } = rate;
  const includesUp = symbol.includes('UP');
  const includesDown = symbol.includes('DOWN');
  const hasQuantity = +askQty > 0.00000001 && +bidQty > 0.00000001;
  const isStableCoin = symbol.includes('TUSD') ||
  symbol.includes('USDC') || symbol.includes('PAX') || symbol.includes('DAI') ||
  symbol.includes('BUSD') || symbol.includes('RUB') || symbol.includes('EUR');
  return !(includesUp || includesDown || isStableCoin || !hasQuantity);
}

