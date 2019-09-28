const http = require('http')
const fs = require('fs')
const StreamZip = require('node-stream-zip')
const Iconv = require('iconv').Iconv
const { currencies } = require('./exmo-currencies')
const kunaCurrencies = require('./kuna-currencies')
const exchangersModel = require('./../exchangers/model')
const axios = require('axios')
const {
  formatRates,
  formatExchangers,
  compileResponse,
  getExmoOrders,
  getKunaOrders
} = require('./../../services/helpers')
module.exports = {
  index: async (req, res, next) => {
    try {
      const { minBalance, minProfit, chainSubscriptions, ltThreeLinks, showExmo, exmoOrdersCount, showKuna } = req.query
      console.log('new request')
      await axios({method: 'get', url: 'http://api.bestchange.ru/info.zip', responseType: 'stream'}).then(function (axiosResponse) {
        const { data } = axiosResponse
        if (!data) {
          res.status(400).send({message: 'info.zip not found', data})
          console.log(data, 'api bestchange failed')
        } else {
          const zipWriteBuffer = fs.createWriteStream('info/info.zip')
          data.pipe(zipWriteBuffer)
          zipWriteBuffer.on('finish', () => {
            const zip = new StreamZip({
              file: 'info/info.zip',
              storeEntries: true
            })
            zip.on('ready', async () => {
              let rates = zip.entryDataSync('bm_rates.dat')
              const iconv = new Iconv('WINDOWS-1251', 'UTF-8')
              const ratesBuffer = iconv.convert(rates).toString()

              // * TO GET CURRENCIES AND EXCHANGERS FROM INFO.ZIP *
              // const cy = zip.entryDataSync('bm_cy.dat')
              // const cyBuffer = iconv.convert(cy).toString()
              // const currencyTypes = await formatCurrencies(cyBuffer.split('\n'))
              // currenciesModel.insertMany(currencyTypes, (err, val) => {
              //   if (err) console.log(err)
              //   else console.log(val[0], 'success fill curr')
              // })
              const excahngers = zip.entryDataSync('bm_exch.dat')
              const excahngersBuffer = iconv.convert(excahngers).toString()
              const exchangersBase = formatExchangers(excahngersBuffer.split('\n'))
              exchangersModel.collection.drop()
              exchangersModel.insertMany(exchangersBase, (err, val) => {
                if (err) console.log('err', err)
              })
              // * TO GET CURRENCIES AND EXCHANGERS FROM INFO.ZIP *

              const exmoRatesUnform = []
              if (showExmo == 'true') {
                const { data: exmoRates } = await getExmoOrders({ exmoOrdersCount })
                for (const key in exmoRates) {
                  if (exmoRates.hasOwnProperty(key)) {
                    const element = exmoRates[key]
                    const divIndex = key.search('_')
                    const frst = currencies.find(curr => curr.title === key.substring(0, divIndex))
                    const scnd = currencies.find(curr => curr.title === key.substring(divIndex + 1, key.length))
                    if (frst && scnd && +exmoOrdersCount) {
                      let giveAccum = 0
                      let receiveAccum = 0
                      let balanceAccum = 0
                      element.ask.forEach(el => {
                        giveAccum += (+el[0] < 1) ? 1 : +el[0]
                        receiveAccum += (+el[0] < 1) ? (1 / +el[0]) : 1
                        balanceAccum += +el[1]
                      })
                      giveAccum = (giveAccum / element.ask.length).toFixed(6)
                      receiveAccum = (receiveAccum / element.ask.length).toFixed(6)
                      let rateAsk = `${scnd.id};${frst.id};1024;${giveAccum};${receiveAccum};${balanceAccum}`
                      exmoRatesUnform.push(rateAsk)

                      let giveAcc = 0
                      let receiveAcc = 0
                      let balanceAcc = 0
                      element.bid.forEach(el => {
                        giveAcc += (+el[0] < 1) ? (1 / +el[0]) : 1
                        receiveAcc += (+el[0] < 1) ? 1 : +el[0]
                        balanceAcc += +el[2]
                      })
                      giveAcc = (giveAcc / element.bid.length).toFixed(6)
                      receiveAcc = (receiveAcc / element.bid.length).toFixed(6)
                      let rateBid = `${frst.id};${scnd.id};1024;${giveAcc};${receiveAcc};${balanceAcc}`
                      exmoRatesUnform.push(rateBid)
                    } else if (frst && scnd && !+exmoOrdersCount) {
                      element.ask.forEach(el => {
                        const give = +el[0] < 1 ? '1' : +el[0]
                        const receive = +el[0] < 1 ? (1 / +el[0]) : '1'
                        const rate = `${scnd.id};${frst.id};1024;${give};${receive};${el[1]}`
                        exmoRatesUnform.push(rate)
                      })
                      element.bid.forEach(el => {
                        const give = +el[0] < 1 ? 1 / +el[0] : '1'
                        const receive = +el[0] < 1 ? '1' : +el[0]
                        const rate = `${frst.id};${scnd.id};1024;${give};${receive};${el[2]}`
                        exmoRatesUnform.push(rate)
                      })
                    }
                  }
                }
              }
              const kunaRatesUnform = []
              if (showKuna == 'true') {
                const kunaRate = await getKunaOrders()
                // tslint:disable-next-line:forin
                for (const key in kunaRate) {
                  if (kunaRate.hasOwnProperty(key)) {
                    const bkey = key.toUpperCase()
                    const element = Object.values(kunaRate[key].data)
                    const frst = kunaCurrencies.currencies.find(curr => curr.title === bkey.substring(0, 3))
                    const scnd = kunaCurrencies.currencies.find(curr => curr.title === bkey.substring(3, bkey.length))
                    let sumBalance = 0
                    let bid = ''
                    let ask = ''
                    let bidRate = 0
                    let askRate = 0
                    console.log(frst, scnd, ' : first - scnd')
                    const askIndex = element.findIndex(e => +e[1] < 0)
                    const bidRatesCount = +element[exmoOrdersCount][1] && +element[exmoOrdersCount][1] > 0 ? +exmoOrdersCount : askIndex
                    const askRatesCount = element[askIndex + +exmoOrdersCount] ? askIndex + +exmoOrdersCount : element.length
                    const bidRates = element.slice(0, bidRatesCount)
                    const askRates = element.slice(askIndex, askRatesCount)
                    bidRates.forEach((rate, i) => {
                      const calcBalance = +rate[1] * +rate[0]
                      let balance = calcBalance + sumBalance
                      bidRate = bidRate + +rate[0]
                      sumBalance = sumBalance + +balance
                      if (i === bidRates.length - 1) {
                        const rateCalc = bidRate / bidRates.length
                        const give = rateCalc < 1 ? 1 / rateCalc : '1'
                        const receive = rateCalc < 1 ? '1' : rateCalc
                        bid = `${frst.id};${scnd.id};1025;${give};${receive};${balance}`
                        sumBalance = 0
                        balance = 0
                      }
                    })
                    askRates.forEach((rate, i) => {
                      const calcBalance = Math.abs(+rate[1]) * +rate[0]
                      let balance = calcBalance + sumBalance
                      askRate = askRate + +rate[0]
                      sumBalance = sumBalance + +balance
                      if (i === askRates.length - 1) {
                        const rateCalc = askRate / askRates.length
                        const give = rateCalc < 1 ? '1' : rateCalc
                        const receive = rateCalc < 1 ? (1 / rateCalc) : '1'
                        ask = `${scnd.id};${frst.id};1025;${give};${receive};${balance}`
                      }
                    })
                    kunaRatesUnform.push(bid)
                    kunaRatesUnform.push(ask)
                  }
                }
              }
              console.log(exmoRatesUnform.slice(0, 2), ' - exmo kuna next')
              console.log(kunaRatesUnform)
              // console.log(`${+minBalance}  ${+minProfit} s-- minb and minprof`)
              const unformattedList = [...ratesBuffer.split('\n'), ...exmoRatesUnform, ...kunaRatesUnform]
              await formatRates({
                unformattedList,
                minAmount: +minBalance,
                minProfit: +minProfit,
                chainSubscriptions,
                ltThreeLinks: JSON.parse(ltThreeLinks),
                exmoRates: exmoRatesUnform
              }).then(async result => {
                const response = await compileResponse(result)
                res.status(200).json(response)
                zip.close()
              })
            })
          })
        }
      }).catch(error => {
        console.log(error, ' - 179')
        res.status(500).json({message: 'Bestchange request error'})
      })
    } catch (e) {
      console.log(e, 'bestChange controller error')
      res.status(500).json({message: 'Bestchange request error'})
    }
  }
}
