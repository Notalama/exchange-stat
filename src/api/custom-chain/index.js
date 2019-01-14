const { Router } = require('express')
const { middleware } = require('querymen')
// const { schema } = require('./model')
// const { index } } = require('./controller'
const { buildChain } = require('./controller')
const router = new Router()

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

router.post('/',
  middleware(),
  buildChain)

module.exports = router
