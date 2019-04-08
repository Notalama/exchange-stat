const http = require('http')
const fs = require('fs')
const StreamZip = require('node-stream-zip')
const Iconv = require('iconv').Iconv
const {
  // formatCurrencies,
  formatExchangers,
  compileResponse
} = require('./../../services/helpers/formatter')
const formatOne = require('../../services/helpers/formatOne')
const {
  findGoldMiddle
} = require('../../services/helpers/bestMidCurrency')
const exchangersModel = require('./../exchangers/model')
// const currenciesModel = require('./../currencies/model')
module.exports = {
  buildChain: (req, res, next) => {
    try {
      const {
        chain,
        amount,
        isGoldMiddle
      } = req.body
      http.get('http://api.bestchange.ru/info.zip', (data) => {
        const {
          statusCode
        } = data
        if (statusCode !== 200) {
          res.status(400).send('info.zip not found', data)
          throw console.error(data)
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
              if (isGoldMiddle) {
                await findGoldMiddle({
                  unformattedList: ratesBuffer.split('\n'),
                  minAmount: amount,
                  idIn: chain[0],
                  idOut: chain[2]
                }).then(async bestSecondStep => {
                  if (bestSecondStep) {
                    // second step currency id
                    chain[1] = bestSecondStep[1][0]
                    await formatOne({
                      ratesBuffer: ratesBuffer.split('\n'),
                      chain,
                      amount
                    }).then(async (resp) => {
                      await SendRes(resp, exchangersBase, res, zip)
                    })
                  } else {
                    res.status(400).json('Ланцюжок не знайдено')
                    zip.close()
                  }
                })
              } else {
                await formatOne({
                  ratesBuffer: ratesBuffer.split('\n'),
                  chain,
                  amount
                }).then(async (resp) => {
                  await SendRes(resp, exchangersBase, res, zip)
                })
              }
            })
          })
        }
      })
    } catch (e) {
      console.error(e, 'bestChange controller error')
    }
  }
}

async function SendRes (result, exchangersBase, res, zip) {
  const response = {
    otherRates: result.otherRates || [],
    chain: null
  }
  if (typeof result !== 'string') {
    response.chain = await compileResponse(result)
    response.otherRates = response.otherRates.map(rateArr => {
      return rateArr.map(rate => {
        return {
          give: rate[3],
          receive: rate[4],
          from: rate[0],
          to: rate[1],
          amount: rate[5],
          dollarAmount: rate[6],
          exch: exchangersBase.find(exch => rate[2] === exch.exchangerId) || ''
        }
      }).sort((a, b) => a.receive > 1 ? b.receive - a.receive : a.give - b.give).slice(0, 5)
    })
    res.status(200).json(response)
    zip.close()
  } else {
    res.status(400).json(response)
    zip.close()
  }
}
