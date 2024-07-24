const Router = require('@koa/router')
const { koaBody } = require('koa-body') // post参数解析

const router = new Router({ prefix: '/users' })
const { viewUsers, register, login, getUsers } = require('../controller/user.controller')
const { verifyUser, auth } = require('../middle/user.middle')

router.get('/', viewUsers)
router.post('/register', koaBody(), verifyUser, register)
router.post('/login', koaBody(), login)
router.get('/getUsers', koaBody(), auth, getUsers)

module.exports = router