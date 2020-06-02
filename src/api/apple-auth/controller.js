module.exports = {
  auth: (req, res, next) => {
    try {
      console.log(req, 44444)
      res.status(200).send('success', req)
    } catch (e) {
      console.log(e, 7777777)
    }
  }
}