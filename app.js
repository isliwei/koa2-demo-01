const Koa = require('koa')
const path = require('path')
const render = require('koa-art-template') // 模板引擎
const static = require('koa-static') // 静态资源
const mount = require('koa-mount') // 虚拟路径
// const compose = require('koa-compose') // 中间件合并处理
// const compose = require('koa-jwt') // jwt鉴权
const indexRouter = require('./router/index.route')
const usersRouter = require('./router/user.route')

const app = new Koa()

render(app, {
  root: path.join(__dirname, 'views'),
  extname: '.html',
  debug: process.env.NODE_ENV !== 'production'
})

// 中间件: 模板引擎
const h = async (ctx) => {
  await ctx.render('user')
}

// 中间件: 全局异常处理
const errorHandler = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500; // 设置响应状态码，默认为 500
    ctx.body = {
      code: err.code || -1,
      message: err.message // 错误消息
    }
  }
}

app
  .use(errorHandler)
  .use(mount('/public', static(path.join(__dirname, './public'))))
  .use(mount('/static', static(path.join(__dirname, './file'))))
  .use(indexRouter.routes()) // 首页路由
  .use(usersRouter.routes()) // 用户路由
  .use(indexRouter.allowedMethods())
  .use(usersRouter.allowedMethods())
  .use(h)

const server = app.listen('3000', () => {
  const { address, port } = server.address()
  const ip = address === '::' ? '127.0.0.1' : address
  console.log(`Server listening at http://${ip}:${port}`)
})