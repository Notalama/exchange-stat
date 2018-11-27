
module.exports = {
  success: (res, status) => (entity) => {
    console.log('3 success methdo -------', entity)
    if (entity) {
      console.log('success methdo -------', entity)
      res.status(status || 200).send(entity)
    }
    return null
  },
  notFound: (res) => (entity) => {
    if (entity) {
      return entity
    }
    res.status(404).end()
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
