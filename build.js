const fs = require('fs')
const archiver = require('archiver')

// 创建文件输出流
const output = fs.createWriteStream('koa-demo-01.zip')
const archive = archiver('zip', {
  zlib: { level: 9 } // 压缩级别
})

// 监听输出流关闭事件
output.on('close', function () {
  console.log('压缩完成，文件大小：' + archive.pointer() + ' bytes')
})

// 监听压缩过程中的警告
archive.on('warning', function (err) {
  if (err.code === 'ENOENT') {
    // log warning
  } else {
    // 抛出错误
    throw err
  }
})

// 监听压缩过程中的错误
archive.on('error', function (err) {
  throw err
})

// 将输出流与存档关联起来
archive.pipe(output)

// 添加文件到压缩包中
archive.directory('controller/')
archive.directory('file/')
archive.directory('middle/')
archive.directory('public/')
archive.directory('router/')
archive.directory('service/')
archive.directory('views/')
archive.file('app.js')
archive.file('pnpm-lock.yaml')

// 结束压缩过程
archive.finalize()