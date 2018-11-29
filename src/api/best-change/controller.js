const http = require('http')
const fs = require('fs')
const StreamZip = require('node-stream-zip')

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
        res.status(400).send('smth went wrong')
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
            const ratesBuffer = zip.entryDataSync('bm_rates.dat')
            // console.log(`Read entry ${ratesBuffer.toString()}`)
            // response.rates = ratesBuffer.toString()
            res.status(200).send(ratesBuffer.toString())
            zip.close()
          })
        })
      }
    })
  }
}
// BestChange.find(query, select, cursor)
//   .then(success(res))
//   .catch(next)
//   }
// export const show = ({ params }, res, next) =>
//   BestChange.findById(params.id)
//     .then(notFound(res))
//     .then((currency) => currency ? currency.view() : null)
//     .then(success(res))
//     .catch(next)
