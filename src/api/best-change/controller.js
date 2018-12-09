const http = require('http')
const fs = require('fs')
const StreamZip = require('node-stream-zip')
const Iconv = require('iconv').Iconv
const {
  formatRates
  // formatCurrencies,
  // formatExchangers
} = require('./../../services/helpers/formatter')
const hideParamsModel = require('./../hide-params/model')

const exchangersModel = require('./../exchangers/model')
const currenciesModel = require('./../currencies/model')
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
            const omitValues = await hideParamsModel.find({}, (err, res) => {
              if (err) console.error(err, '--- omitValues err')
              else if (res === null) console.error('null hideparams found')
            })

            await formatRates(ratesBuffer.split('\n'), omitValues).then(async result => {
              const allCurrencies = await currenciesModel.find({})
              const allChangers = await exchangersModel.find({})
              result = result.map(el => {
                const currFrom = allCurrencies.find(cur => el[0] === cur.currencyId)
                const currTo = allCurrencies.find(cur => el[1] === cur.currencyId)
                const changer = allChangers.find(exch => el[2] === exch)
                return {
                  from: el[0],
                  fromTitle: currFrom.currencyTitle,
                  to: el[1],
                  toTitle: currTo.currencyTitle,
                  changer: el[2],
                  changerTitle: changer.exchangerTitle,
                  give: el[3],
                  receive: el[4],
                  amount: el[5]
                }
              })
              res.status(200).json(result)
              zip.close()
            })
          })
        })
      }
    })
  }
}
