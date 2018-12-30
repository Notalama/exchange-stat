const tempHide = require('./model')
module.exports = {
  index: ({
    querymen: {
      query,
      select,
      cursor
    }
  }, res, next) => {
    console.log(query)
    tempHide.find(query, (err, result) => {
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
    tempHide.findOne(query, (err, result) => {
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
  createOne: (query, res) => {
    if (query) {
      // tempHide.insert()
      console.log(query.body, 'createOne doc query')
      tempHide.insertMany([query.body], (err, doc) => {
        if (err) res.status(400).send(err)
        else res.send({message: 'success', value: doc})
      })
    }
  },
  saveList: (query, res, next) => {
    tempHide.insertMany(query, (err, docs) => {
      if (err) {
        console.error('saveMany err -----> ', err)
        res.status(400).send(err.errmsg)
      } else {
        res.send({message: 'success', value: docs})
      }
    })
  }
}
