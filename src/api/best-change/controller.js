const http = require('http')
const fs = require('fs')
const StreamZip = require('node-stream-zip')
const Iconv = require('iconv').Iconv
const {
  formatRates,
  formatCurrencies,
  formatExchangers
} = require('./../../services/helpers/formatter')

const exchangersModel = require('./../exchangers/model')
const currenciesModel = require('./../currencies/model')
module.exports = {
  index: (req, res, next) => {
    const { minBalance, minProfit, chainSubscriptions, ltThreeLinks } = req.query
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
            //   const cy = zip.entryDataSync('bm_cy.dat')
            //   const cyBuffer = iconv.convert(cy).toString()
            //   const currencyTypes = formatCurrencies(cyBuffer.split('\n'))
            //   currenciesModel.insertMany(currencyTypes, (err, val) => {
            //     if (err) console.log(err)
            //     else console.log(val[0], 'success fill curr')
            //   })
            //   const excahngers = zip.entryDataSync('bm_exch.dat')
            //   const excahngersBuffer = iconv.convert(excahngers).toString()
            //   const exchangersBase = formatExchangers(excahngersBuffer.split('\n'))
            //   exchangersModel.collection.drop()
            //   exchangersModel.insertMany(exchangersBase, (err, val) => {
            //     if (err) console.log(err)
            //     else console.log(val[0], 'success fill exch')
            //   })
            // * TO GET CURRENCIES AND EXCHANGERS FROM INFO.ZIP *

            await formatRates(ratesBuffer.split('\n'), +minBalance, +minProfit, chainSubscriptions, ltThreeLinks).then(async result => {
              const response = []
              const allCurrencies = await currenciesModel.find({}, {
                currencyId: 1,
                currencyTitle: 1
              }, (err, res) => {
                if (err) console.error(err, '--- allCurrencies err')
                else if (res === null) console.error('null currencies found')
              })
              const allChangers = await exchangersModel.find({}, {
                exchangerId: 1,
                exchangerTitle: 1
              }, (err, res) => {
                if (err) console.error(err, '--- allCurrencies err')
                else if (res === null) console.error('null currencies found')
              })
              result.profitArr.forEach((chain, index) => {
                const compiled = []
                for (let i = 0; i < chain.length - 2; i++) {
                  const el = chain[i]
                  const fromT = allCurrencies.find(cur => el[0] === cur.currencyId)
                  const toT = allCurrencies.find(cur => el[1] === cur.currencyId)
                  const chan = allChangers.find(exch => el[2] === exch.exchangerId)
                  compiled.push({
                    from: el[0],
                    fromTitle: fromT ? fromT.currencyTitle : '',
                    to: el[1],
                    toTitle: toT ? toT.currencyTitle : '',
                    changer: el[2],
                    changerTitle: chan ? chan.exchangerTitle : '',
                    give: el[3],
                    receive: el[4],
                    amount: el[5]
                  })
                }
                compiled.push(chain[chain.length - 1], chain[chain.length - 2], index < result.subs)
                response.push(compiled)
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
