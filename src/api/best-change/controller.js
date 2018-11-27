const http = require('http')
const fs = require('fs')
const StreamZip = require('node-stream-zip')



module.exports = {
  index: ({ querymen: { query, select, cursor } }, res, next) => {
    http.get('http://api.bestchange.ru/info.zip', (data) => {
      const { statusCode } = data
      if (statusCode !== 200) {
        res.status(400).send('smth went wrong')
        throw console.error(data)
      } else {
        fs.writeFileSync('info.zip', data)
        const file = fs.readFileSync('info.zip')
        const zip = new StreamZip({
          file: 'info.zip',
          storeEntries: true
        })
        console.log('Entries read: ' + zip.entriesCount)
        for (const entry of Object.values(zip.entries())) {
          const desc = entry.isDirectory ? 'directory' : `${entry.size} bytes`
          console.log(`Entry ${entry.name}: ${desc}`)
        }
        // console.log(file)
        res.status(200).json('success')
        zip.close()
        fs.close(0, (err) => {
          if (err) throw console.error(err)
        })

        zip.on('error', err => {
          console.error(err)
        })
      }
    })
    // BestChange.find(query, select, cursor)
    //   .then(success(res))
    //   .catch(next)
  }
}
// export const show = ({ params }, res, next) =>
//   BestChange.findById(params.id)
//     .then(notFound(res))
//     .then((currency) => currency ? currency.view() : null)
//     .then(success(res))
//     .catch(next)
