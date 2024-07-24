const { addUser } = require('../service/user.service')
const jwt = require('jsonwebtoken')

class User {
  async viewUsers(ctx, next) {
    ctx.body = 'hello users'
  }
  async register(ctx, next) {
    // 获取参数 ctx.request.body
    console.log(ctx.request.body)
    // 添加到数据库 封装到service层
    const res = await addUser(ctx.request.body)
    // 返回结果
    ctx.body = {
      code: 0,
      result: res,
      message: 'succeed'
    }
  }
  async login(ctx, next) {
    console.log(ctx.request.body)
    const { name } = ctx.request.body
    // ...省略从库查询时候有该用户，此处假设为已注册用户
    ctx.body = {
      code: 0,
      result: {
        token: jwt.sign({ name }, 'gaj.S22', { expiresIn: 60 * 1 })
      },
      message: 'succeed'
    }
  }
  async getUsers(ctx, next) {
    ctx.body = {
      code: 0,
      result: {
        users: []
      },
      message: 'succeed'
    }
  }
}

module.exports = new User()