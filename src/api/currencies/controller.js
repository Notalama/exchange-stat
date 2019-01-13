const currencyModel = require('./model')
const filterHidden = require('./../../services/helpers/filter-hidden')
module.exports = {
  index: async ({
    querymen: {
      query,
      select,
      cursor
    }
  }, res, next) => {
    currencyModel.find(query, (err, result) => {
      if (err) res.status(400).send(err)
      else {
        const response = filterHidden.filterCurrencies(result)
        response.then(r => res.send(r)).catch(err => {
          console.log(err, 'error on filtering currencies')
          res.status(400).send('something went wrong on filtering currencies')
        })
      }
    }).sort({'currencyTitle': 1})
  },
  show: ({
    querymen: {
      query,
      select,
      cursor
    }
  }, res, next) => {
    currencyModel.findOne(query, (err, result) => {
      if (err) res.status(400).send(err)
      else if (result === null) res.status(404).end()
      else {
        const response = {
          currencyType: null
        }
        console.log(result)
        response.currencyType = result
        res.send(response)
      }
    })
  },
  saveList: (query, res, next) => {
    currencyModel.insertMany(query, (err, docs) => {
      if (err) {
        console.error('saveMany err -----> ', err)
        res.status(400).send(err.errmsg)
      } else {
        res.send({message: 'success', value: docs})
      }
    })
  }
}
