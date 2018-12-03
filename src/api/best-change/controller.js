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
    const response = {
      rates: [],
      currencyTypes: null,
      exchangers: null
    }
    http.get('http://api.bestchange.ru/info.zip', (data) => {
      const {
        statusCode
      } = data
      if (statusCode !== 200) {
        res.status(400).send('smth went wrong', data)
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
            await formatRates(ratesBuffer.split('\n')).then(res => {
              if (res.length > 100) {
                response.rates = res.slice(0, 99)
              } else {
                response.rates = res
              }
            })
            res.status(200).json(response)
            zip.close()
          })
        })
      }
    })
  }
}
