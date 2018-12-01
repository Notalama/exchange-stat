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
    // const response = {
    //   rates: null,
    //   currencyTypes: null
    // }
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
            const cy = zip.entryDataSync('bm_cy.dat')
            const iconv = new Iconv('WINDOWS-1251', 'UTF-8')
            const buffer = iconv.convert(cy)
            res.status(200).send(buffer)
            zip.close()
          })
        })
      }
    })
  }
}
