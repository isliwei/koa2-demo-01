const Router = require('@koa/router') // 路由
const { koaBody } = require('koa-body') // post参数解析
const path = require('path')

const router = new Router({ prefix: '' })
const { home, foo, bar, render, upload } = require('../controller/index.controller')

router.get('/', home)
router.get('/foo', foo)
router.get('/bar', bar)
router.get('/render', render)
router.post('/upload', koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '../file'),
    keepExtensions: true
  }
}), upload)

module.exports = router