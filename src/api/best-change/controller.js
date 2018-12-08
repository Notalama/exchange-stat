const http = require('http')
const fs = require('fs')
const StreamZip = require('node-stream-zip')
const Iconv = require('iconv').Iconv
const {
  formatRates
  // formatCurrencies,
  // formatExchangers
} = require('./../../services/helpers/formatter')
// const exchangersModel = require('./../exchangers/model')
// const currenciesModel = require('./../currencies/model')
module.exports = {
  index: ({
    querymen: {
      query,
      select,
      cursor
    }
  }, res, next) => {
    http.get('http://api.bestchange.ru/info.zip', (data) => {
      const {
        statusCode
      } = data
      if (statusCode !== 200) {
        res.status(400).send('info.zip not found', data)
        throw console.error(data)
      } else {
        const zipWriteBuffer = fs.createWriteStream('info.zip')
        data.pipe(zipWriteBuffer)
        zipWriteBuffer.on('finish', () => {
          const zip = new StreamZip({
            file: 'info.zip',
            storeEntries: true
          })
          zip.on('ready', async () => {
            let rates = zip.entryDataSync('bm_rates.dat')
            // const cy = zip.entryDataSync('bm_cy.dat')
            // const excahngers = zip.entryDataSync('bm_exch.dat')
            const iconv = new Iconv('WINDOWS-1251', 'UTF-8')

            const ratesBuffer = iconv.convert(rates).toString()

            // * TO GET CURRENCIES AND EXCHANGERS FROM INFO.ZIP *
            // const cyBuffer = iconv.convert(cy).toString()
            // const excahngersBuffer = iconv.convert(excahngers).toString()
            // response.exchangers = formatExchangers(excahngersBuffer.split('\n'))
            // response.currencyTypes = formatCurrencies(cyBuffer.split('\n'))

            // currenciesModel.insertMany(response.currencyTypes, (err, val) => {
            //   if (err) console.log(err)
            //   else {
            //     console.log(val, 'success fill')
            //   }
            // })
            // exchangersModel.insertMany(response.exchangers, (err, val) => {
            //   if (err) console.log(err)
            //   else {
            //     console.log(val, 'sadfafsd')
            //   }
            // })
            await formatRates(ratesBuffer.split('\n')).then(async result => {
              // if (result.length > 100) {
              //   response.rates = result.slice(0, 99)
              // } else {
              //   response.rates = result
              // }

              // fromCurr: allCurrencies.find(el => el.currencyId === rowArray[0]),
              // toCurr: allCurrencies.find(el => el.currencyId === rowArray[1]),
              // changer: allExchangers.find(el => el.exchangerId === rowArray[2]),
              // give: +rowArray[3],
              // receive: +rowArray[4],
              // amount: +rowArray[5]
              const profitArr = []
              const test = result.slice(0, 100).filter(rate => {
                let isProfitable = false
                result.forEach(cmpRate => {
                  const isPair = cmpRate.fromCurr.currencyId === rate.toCurr.currencyId && cmpRate.toCurr.currencyId === rate.fromCurr.currencyId
                  if (rate.give === 1 && isPair) {
                    // receive more then give
                    if (rate.receive > cmpRate.give) {
                      const r = {
                        from: rate.fromCurr.currencyId,
                        fromTitle: rate.fromCurr.currencyTitle,
                        to: rate.toCurr.currencyId,
                        toTitle: rate.toCurr.currencyTitle,
                        give: rate.give,
                        receive: rate.receive,
                        changer: rate.changer,
                        amount: rate.amount
                      }
                      const c = {
                        from: cmpRate.fromCurr.currencyId,
                        fromTitle: cmpRate.fromCurr.currencyTitle,
                        to: cmpRate.toCurr.currencyId,
                        toTitle: cmpRate.fromCurr.currencyTitle,
                        give: cmpRate.give,
                        receive: cmpRate.receive,
                        changer: cmpRate.changer,
                        amount: cmpRate.amount
                      }
                      profitArr.push({
                        rate: r,
                        cmpRate: c
                      })
                      isProfitable = true
                    }
                  } else if (rate.receive === 1 && isPair) {
                    // give less then receive
                    if (rate.give < cmpRate.receive) {
                      const r = {
                        from: rate.fromCurr.currencyId,
                        fromTitle: rate.fromCurr.currencyTitle,
                        to: rate.toCurr.currencyId,
                        toTitle: rate.toCurr.currencyTitle,
                        give: rate.give,
                        receive: rate.receive,
                        changer: rate.changer,
                        amount: rate.amount
                      }
                      const c = {
                        from: cmpRate.fromCurr.currencyId,
                        fromTitle: cmpRate.fromCurr.currencyTitle,
                        to: cmpRate.toCurr.currencyId,
                        toTitle: cmpRate.toCurr.currencyTitle,
                        give: cmpRate.give,
                        receive: cmpRate.receive,
                        changer: cmpRate.changer,
                        amount: cmpRate.amount
                      }
                      profitArr.push({
                        rate: r,
                        cmpRate: c
                      })
                      isProfitable = true
                    }
                  }
                })
                return isProfitable
              })
              // const refillRates = await ratesModel.collection.drop().then(async res => {
              //   await ratesModel.insertMany(result, (err, doc) => {
              //     if (err) console.error(err, '--- insert rates err')
              //     // else if (res === null) console.error('null currencies found')
              //     else {
              //       console.log(doc.slice(0, 1))
              //     }
              //   })
              // }, rejected => console.error('rejected refill', rejected))
              // const chain = await getChains()
              // response.rates = getChains()
              res.status(200).json({introCurrencies: test, profitablesForIntro: profitArr})
              zip.close()
            })
          })
        })
      }
    })
  }
}
