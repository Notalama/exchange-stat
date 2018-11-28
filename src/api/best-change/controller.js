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
    http.get('http://api.bestchange.ru/info.zip', (data) => {
      const {
        statusCode
      } = data
      if (statusCode !== 200) {
        res.status(400).send('smth went wrong')
        throw console.error(data)
      } else {
        const file = fs.createWriteStream('info.zip')
        data.pipe(file)
        file.on('finish', () => {
          file.close(zipFunc) // close() is async, call cb after close completes.
        })

        const zipFunc = () => {
          const zip = new StreamZip({
            file: 'info.zip',
            storeEntries: true
          })
          for (const entry of Object.values(zip.entries())) {
            const fileArr = []
            zip.stream(entry, (err, stm) => {
              if (err) {
                console.log(err, '-----erro')
              } else {
                console.log(stm)
                fileArr.push(stm)
              }
            })

            console.log('The content of info.zip is: ' + fileArr)
          }
          
          zip.on('ready', () => {
            // Take a look at the files
            // console.log('Entries read: ' + zip.entriesCount)
            // for (const entry of Object.values(zip.entries())) {
            //   const desc = entry.isDirectory ? 'directory' : `${entry.size} bytes`
            //   console.log(`Entry ${entry.name}: ${desc}`)
            //   console.log('entry full------', entry)
            //   // Read a file in memory
            //   let zipDotDatContents = zip.entryDataSync(entry)
            //   console.log(zipDotDatContents)
            //   fileArr.push(zipDotDatContents)
            // }
            res.status(200).json('success')
          })
          zip.on('entry', entry => {
            // you can already stream this entry,
            // without waiting until all entry descriptions are read (suitable for very large archives)
            console.log(entry)
            console.log(`Read entry ${entry.name}`)
          })
          setTimeout(() => {
            console.log('test')
            zip.close()
          }, 5000)
        }

        // zip.close()

        fs.close(0, (err) => {
          if (err) throw console.error(err)
        })

        // zip.on('error', err => {
        //   console.error(err)
        // })
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
