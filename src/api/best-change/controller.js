const http = require('http')
const fs = require('fs')
const StreamZip = require('node-stream-zip')
const Iconv = require('iconv').Iconv
const {
  formatRates,
  formatCurrencies,
  formatExchangers,
  compileResponse
} = require('./../../services/helpers/formatter')
const { getExmoORders } = require('./../../services/helpers/external-rates')
const exchangersModel = require('./../exchangers/model')
const currenciesModel = require('./../currencies/model')
module.exports = {
  index: (req, res, next) => {
    try {
      const { minBalance, minProfit, chainSubscriptions, ltThreeLinks } = req.query
      http.get('http://api.bestchange.ru/info.zip', (data) => {
        const {
          statusCode
        } = data
        if (statusCode !== 200) {
          res.status(400).send('info.zip not found', data)
          console.error(data)
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
              const iconv = new Iconv('WINDOWS-1251', 'UTF-8')
              const ratesBuffer = iconv.convert(rates).toString()

              // * TO GET CURRENCIES AND EXCHANGERS FROM INFO.ZIP *
              const cy = zip.entryDataSync('bm_cy.dat')
              const cyBuffer = iconv.convert(cy).toString()
              const currencyTypes = await formatCurrencies(cyBuffer.split('\n'))
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

              const {data: exmoRates} = await getExmoORders()
              const exmoRatesUnform = []
              for (const key in exmoRates) {
                if (exmoRates.hasOwnProperty(key)) {
                  const element = exmoRates[key]
                  const frst = currencyTypes.find(curr => curr.currencyTitle.search(key.substring(0, 3)) > 0 && /^[a-zA-Z]/.test(curr.currencyTitle))
                  const scnd = currencyTypes.find(curr => curr.currencyTitle.search(key.substring(key.length - 3, key.length)) > 0 && /^[a-zA-Z]/.test(curr.currencyTitle))
                  console.log(frst, scnd, '63', key)
                  if (frst && scnd) {
                    element.ask.forEach(el => exmoRatesUnform.push(frst.currencyId + ';' + scnd.currencyId + ';' + '899' + ';' + 1 + ';' + el[0] + ';' + el[2]))
                    element.bid.forEach(el => exmoRatesUnform.push(scnd.currencyId + ';' + frst.currencyId + ';' + '899' + ';' + el[0] + ';' + 1 + ';' + el[1]))
                  }
                }
              }
              console.log(exmoRatesUnform, '70')
              console.log(ratesBuffer.split('\n').slice(0, 5), '71')
              await formatRates({
                unformattedList: ratesBuffer.split('\n').concat(exmoRatesUnform),
                minAmount: +minBalance,
                minProfit: +minProfit,
                chainSubscriptions,
                ltThreeLinks: JSON.parse(ltThreeLinks)
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
