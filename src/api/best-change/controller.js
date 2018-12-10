const http = require('http')
const fs = require('fs')
const StreamZip = require('node-stream-zip')
const Iconv = require('iconv').Iconv
const {
  formatRates,
  // formatCurrencies,
  formatExchangers
} = require('./../../services/helpers/formatter')

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
            // let exchangersBase = formatExchangers(excahngersBuffer.split('\n'))
            // response.currencyTypes = formatCurrencies(cyBuffer.split('\n'))

            // currenciesModel.insertMany(response.currencyTypes, (err, val) => {
            //   if (err) console.log(err)
            //   else {
            //     console.log(val, 'success fill')
            //   }
            // })
            // await exchangersModel.collection.drop()
            // await exchangersModel.insertMany(exchangersBase, (err, val) => {
            //   if (err) console.log(err)
            //   else console.log(val[0], 'sadfafsd')
            // })
            await formatRates(ratesBuffer.split('\n')).then(async result => {
              
              const allCurrencies = await currenciesModel.find({}, {currencyId: 1, currencyTitle: 1}, (err, res) => {
                if (err) console.error(err, '--- allCurrencies err')
                else if (res === null) console.error('null currencies found')
              })
              const allChangers = await exchangersModel.find({}, {exchangerId: 1, exchangerTitle: 1}, (err, res) => {
                if (err) console.error(err, '--- allCurrencies err')
                else if (res === null) console.error('null currencies found')
              })
              const response = []
              
              result.forEach(el => {
                const currFromIn = allCurrencies.find(cur => el.in[0] === cur.currencyId)
                const currToIn = allCurrencies.find(cur => el.in[1] === cur.currencyId)
                const changerIn = allChangers.find(exch => el.in[2] === exch.exchangerId)
                const currFromBack = allCurrencies.find(cur => el.back[0] === cur.currencyId)
                const currToBack = allCurrencies.find(cur => el.back[1] === cur.currencyId)
                const changerBack = allChangers.find(exch => el.back[2] === exch.exchangerId)
                response.push({
                  in: {
                    from: el.in[0],
                    fromTitle: currFromIn.currencyTitle,
                    to: el.in[1],
                    toTitle: currToIn.currencyTitle,
                    changer: el.in[2],
                    changerTitle: changerIn.exchangerTitle,
                    give: el.in[3],
                    receive: el.in[4],
                    amount: el.in[5]
                  },
                  back: {
                    from: el.back[0],
                    fromTitle: currFromBack.currencyTitle,
                    to: el.back[1],
                    toTitle: currToBack.currencyTitle,
                    changer: el.back[2],
                    changerTitle: changerBack.exchangerTitle,
                    give: el.back[3],
                    receive: el.back[4],
                    amount: el.back[5]
                  }
                })
              })
              res.status(200).json(response)
              zip.close()
            })
          })
        })
      }
    })
  }
}
