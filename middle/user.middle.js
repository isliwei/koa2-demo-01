const jwt = require('jsonwebtoken')

const verifyUser = async (ctx, next) => {
  const { name, password } = ctx.request.body
  if (!name || !password) {
    ctx.status = 400
    ctx.body = {
      code: -1,
      result: '',
      message: '账号或密码缺失'
    }
    return
  }
  await next()
}

const auth = async (ctx, next) => {
  try {
    const { authorization } = ctx.request.header || {}
    const { name } = jwt.verify(authorization.replace('Benear ', ''), 'gaj.S22')
    // 将用户信息保存到ctx.state,可跨中间件共享
    ctx.state.user = name
    ctx.body = {
      code: 0,
      result: '',
      message: '登录成功'
    }
    await next()
  } catch (e) {
    const { name, message } = e
    if (name === 'TokenExpiredError') {
      if (message === 'jwt expired') {
        ctx.status = 401
        ctx.body = {
          code: -1,
          result: '',
          message: 'token已过期'
        }
      }
    } else if (name === 'JsonWebTokenError') {
      if (message === 'invalid token') {
        ctx.status = 401
        ctx.body = {
          code: -1,
          result: '',
          message: '无效token'
        }
      }
    }
  }
}

module.exports = {
  verifyUser,
  auth
}