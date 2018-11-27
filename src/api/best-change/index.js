const { Router } = require('express')
const { middleware } = require('querymen')
// const { schema } = require('./model')
// const { index } } = require('./controller'
const { index } = require('./controller')
const router = new Router()
// const { test, name, type, id } = schema.tree

/**
 * @api {get} /users Retrieve users
 * @apiName RetrieveUsers
 * @apiGroup User
 * @apiPermission admin
 * @apiParam {String} access_token User access_token.
 * @apiUse listParams
 * @apiSuccess {Object[]} users List of users.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 Admin access only.
 */
router.get('/',
  middleware(),
  index)

// router.get('/:id',
//   query(),
//   show)

module.exports = router
