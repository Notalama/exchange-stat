const {
  success,
  notFound
} = require('./../../services/response')
const currencyModel = require('./model')
module.exports = {
  index: ({
    querymen: {
      query,
      select,
      cursor
    }
  }, res, next) => {
    console.log(query)
    currencyModel.find(query, (err, result) => {
      if (err) res.status(400).send(err)
      else {
        const response = {
          currencyTypes: null
        }
        console.log(result)
        response.currencyTypes = result
        res.send(response)
      }
    })
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
    currenciesModel.insertMany(query, (err, docs) => {
      if (err) {
        console.error('saveMany err -----> ', err)
        res.status(400).send(err.errmsg)
      }
      else {
        res.send({message: 'success', value: docs})
      }
    })
  }
}
