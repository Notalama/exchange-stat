const ratesModel = require('./model')
module.exports = {
  index: ({
    querymen: {
      query,
      select,
      cursor
    }
  }, res) => {
    ratesModel.find(query, select, cursor, (err, result) => {
      if (err) res.status(400).send(err)
      else if (result === null) return null
      else {
        return result
      }
    })
  },
  show: (query, res, next) => {
    ratesModel.findOne(query, (err, result) => {
      if (err) res.status(400).send(err)
      else if (result === null) res.status(404).end()
      else {
        const response = {
          currencyType: null
        }
        response.currencyType = result
        res.send(response)
        return result
      }
    })
  },
  saveList: (query, res) => {
    // if (ratesModel.drop()) {
    ratesModel.insertMany(query, (err, docs) => {
      if (err) {
        console.error('saveMany err -----> ', err)
        res.status(400).send(err.errmsg)
      } else {
        res.send({
          message: 'success',
          value: docs
        })
      }
    })
    // } else {
    //   console.error('rates collection was not dropped')
    // }
  }
}
