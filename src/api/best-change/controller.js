const http = require('http')
const fs = require('fs')
const StreamZip = require('node-stream-zip')
const Iconv = require('iconv').Iconv
const { currencies } = require('./exmo-currencies')
const kunaCurrencies = require('./kuna-currencies')
const exchangersModel = require('./../exchangers/model')

const {
  formatRates,
  formatExchangers,
  compileResponse,
  getExmoOrders,
  getKunaOrders
} = require('./../../services/helpers')
module.exports = {
  index: (req, res, next) => {
    try {
      const { minBalance, minProfit, chainSubscriptions, ltThreeLinks, showExmo, exmoOrdersCount, showKuna } = req.query
      http.get('http://api.bestchange.ru/info.zip', (data) => {
        const {
          statusCode
        } = data
        if (statusCode !== 200) {
          res.status(400).send('info.zip not found', data)
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
                    if (frst && scnd && exmoOrdersCount) {
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
                    } else if (frst && scnd && !exmoOrdersCount) {
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
                    element.forEach(el => {
                      if (el[1] > 0) {
                        const rate = `${scnd.id};${frst.id};1025;${el[0]};1;${el[1]}`
                        kunaRatesUnform.push(rate)
                      } else if (el[1] < 0) {
                        const rate = `${frst.id};${scnd.id};1025;1;${el[0]};${Math.abs(el[1])}`
                        kunaRatesUnform.push(rate)
                      }
                    })
                  }
                }
              }
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
      })
    } catch (e) {
      console.error(e, 'bestChange controller error')
    }
  }
}
