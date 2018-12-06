const {
    success,
    notFound
  } = require('./../../services/response')
  const exchangersModel = require('./model')
  module.exports = {
    index: ({
      querymen: {
        query,
        select,
        cursor
      }
    }, res, next) => {
      exchangersModel.find(query, (err, result) => {
        if (err) res.status(400).send(err)
        else {
          const response = {
            currencyTypes: null
          }
          response.currencyTypes = result
          res.send(response)
        }
      })
    },
    show: (query, res, next) => {
        exchangersModel.findOne(query, (err, result) => {
        if (err) res.status(400).send(err)
        else if (result === null) res.status(404).end()
        else {
          // const response = {
          //   currencyType: null
          // }
          // response.currencyType = result
          // res.send(response)
          return result
        }
      })
    },
    saveList: (query, res, next) => {
        exchangersModel.insertMany(query, (err, docs) => {
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
  