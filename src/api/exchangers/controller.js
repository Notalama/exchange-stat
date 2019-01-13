const exchangersModel = require('./model')
const filterHidden = require('./../../services/helpers/filter-hidden')
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
        const response = filterHidden.filterExchangers(result)
        response.then(r => res.send(r)).catch(err => {
          console.log(err, 'error on filtering currencies')
          res.status(400).send('something went wrong on filtering currencies')
        })
      }
    }).sort({'exchangerTitle': 1})
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
      } else {
        res.send({
          message: 'success',
          value: docs
        })
      }
    })
  }
}
