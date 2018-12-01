
module.exports = {
  success: (res, status) => (entity) => {
    console.log('3 success methdo -------', entity)
    if (entity) {
      console.log('success methdo -------', entity)
      res.status(status || 200).send(entity)
    }
    return null
  },
  notFound: (res) => {
    console.log('notfound ---', res)
    res.status(404).send(res)
    return null
  },
  authorOrAdmin: (res, user, userField) => (entity) => {
    if (entity) {
      const isAdmin = user.role === 'admin'
      const isAuthor = entity[userField] && entity[userField].equals(user.id)
      if (isAuthor || isAdmin) {
        return entity
      }
      res.status(401).end()
    }
    return null
  }
}
