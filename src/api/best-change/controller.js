const http = require('http')
const fs = require('fs')
const StreamZip = require('node-stream-zip')
const Iconv = require('iconv').Iconv
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
      currencyTypes: null
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
            // const cy = zip.entryDataSync('bm_cy.dat')
            const rates = zip.entryDataSync('bm_rates.dat')
            const iconv = new Iconv('WINDOWS-1251', 'UTF-8')
            const ratesBuffer = iconv.convert(rates).toString().substring(0, 9999)
            response.rates = formatExchange(ratesBuffer.split('\n'))
            res.status(200).json(response)
            zip.close()
          })
        })
      }
    })
  }
}

const formatExchange = (unformattedList) => {
  const result = []
  for (let i = 0; i < unformattedList.length; i++) {
    const rowArray = unformattedList[i].split(';')
    result.push({
      givenCurrId: rowArray[0],
      receivedCurrId: rowArray[1],
      changerId: rowArray[2],
      rateToGive: rowArray[3],
      rateToReceive: rowArray[4],
      fullChangerCapital: rowArray[5]
    })
  }
  return result
}
