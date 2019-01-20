const http = require('http')
const fs = require('fs')
const StreamZip = require('node-stream-zip')
const Iconv = require('iconv').Iconv
const {
  formatCurrencies,
  formatExchangers,
  compileResponse,
  formatOne
} = require('./../../services/helpers/formatter')

const exchangersModel = require('./../exchangers/model')
const currenciesModel = require('./../currencies/model')
module.exports = {
  buildChain: (req, res, next) => {
    try {
      const {chain, amount} = req.body
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
              const iconv = new Iconv('WINDOWS-1251', 'UTF-8')
              const ratesBuffer = iconv.convert(rates).toString()

              // * TO GET CURRENCIES AND EXCHANGERS FROM INFO.ZIP *
              // const cy = zip.entryDataSync('bm_cy.dat')
              // const cyBuffer = iconv.convert(cy).toString()
              // const currencyTypes = formatCurrencies(cyBuffer.split('\n'))
              // currenciesModel.insertMany(currencyTypes, (err, val) => {
              //   if (err) console.log(err)
              // })
              const excahngers = zip.entryDataSync('bm_exch.dat')
              const excahngersBuffer = iconv.convert(excahngers).toString()
              const exchangersBase = formatExchangers(excahngersBuffer.split('\n'))
              exchangersModel.collection.drop()
              exchangersModel.insertMany(exchangersBase, (err, val) => {
                if (err) console.log('err', err)
              })
              // * TO GET CURRENCIES AND EXCHANGERS FROM INFO.ZIP *

              await formatOne({
                ratesBuffer: ratesBuffer.split('\n'),
                chain,
                amount
              }).then(async (result) => {
                let response
                console.log(result, '60 ctrl')
                if (typeof result !== 'string') {
                  response = await compileResponse(result)
                  res.status(200).json(response)
                  zip.close()
                } else {
                  res.status(400).json(response)
                  zip.close()
                }
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
