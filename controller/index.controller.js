class Index {
  async home(ctx, next) {
    ctx.body = 'home page'
  }
  async foo(ctx, next) {
    ctx.body = 'foo page'
    ctx.redirect('/bar') // 重定向，只针对同步请求
  }
  async bar(ctx, next) {
    try {
      ctx.body = 'bar page'
      const xxx = JSON.parse('')
    } catch (e) {
      throw ({ code: -2, message: e.message })
    }
  }
  async render(ctx, next) {
    await ctx.render('index', {
      name: '张三',
      list: ['number1', 'number2']
    })
  }
  async upload(ctx, next) {
    try {
      console.log()
      const { file, file: { mimetype, newFilename } } = await ctx.request.files
      ctx.body = {
        code: 0,
        result: {
          mimetype,
          fileName: newFilename,
          url: `${ctx.request.host}/static/${newFilename} `
        },
        message: '上传完成'
      }
    } catch (e) {
      console.log(222, e)
    }
  }
}

module.exports = new Index()