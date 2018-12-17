const currencyPairModel = require('./model')
module.exports = {
  index: ({
    querymen: {
      query,
      select,
      cursor
    }
  }, res, next) => {
    currencyPairModel.find(query, (err, result) => {
      if (err) res.status(400).send(err)
      else {
        const response = {
          commision: null
        }
        console.log(result)
        response.commision = result
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
    currencyPairModel.findOne(query, (err, result) => {
      if (err) res.status(400).send(err)
      else if (result === null) res.status(404).end()
      else {
        const response = {
          bonus: null
        }
        console.log(result)
        response.commision = result
        res.send(response)
      }
    })
  },
  saveList: (query, res, next) => {
    currencyPairModel.insertMany(query, (err, docs) => {
      if (err) {
        console.error('saveMany err -----> ', err)
        res.status(400).send(err.errmsg)
      } else {
        res.send({message: 'success', value: docs})
      }
    })
  }
}
