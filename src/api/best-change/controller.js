const http = require('http')
const fs = require('fs')
const StreamZip = require('node-stream-zip')
const Iconv = require('iconv').Iconv
const { formatExchange, formatCurrencies, formatExchangers } = require('./../../services/helpers/formatter')
const currenciesModel = require('./../currencies/model')
const _exchangers = require('./../exchangers/controller')
module.exports = {
  index: ({
    querymen: {
      query,
      select,
      cursor
    }
  }, res, next) => {
    const response = {
      rates: null,
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
          zip.on('ready', () => {
            const cy = zip.entryDataSync('bm_cy.dat')
            const rates = zip.entryDataSync('bm_rates.dat')
            const excahngers = zip.entryDataSync('bm_exch.dat')
            const iconv = new Iconv('WINDOWS-1251', 'UTF-8')

            const cyBuffer = iconv.convert(cy).toString()
            const ratesBuffer = iconv.convert(rates).toString().substring(0, 9999)
            const excahngersBuffer = iconv.convert(excahngers).toString()

            response.exchangers = formatExchangers(excahngersBuffer.split('\n'))
            response.rates = formatExchange(ratesBuffer.split('\n'))
            response.currencyTypes = formatCurrencies(cyBuffer.split('\n'))

            _exchangers.saveList(response.exchangers)
            res.status(200).json(response)
            zip.close()
          })
        })
      }
    })
  }
}


