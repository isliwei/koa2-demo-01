const Router = require("@koa/router");
const strongFileController = require("../controller/strongFile.controller");
const { koaBody } = require("koa-body"); // post参数解析
const path = require("path");

const router = new Router({
  prefix: "/api/file", // 统一前缀
});

// 秒传检查
router.post("/checkFile", koaBody(), strongFileController.checkFile);

// 初始化上传
router.post("/initUpload", koaBody(), strongFileController.initUpload);

// 上传分片
router.post(
  "/uploadChunk",
  koaBody({
    multipart: true,
    parsedMethods: ["POST", "PUT", "PATCH"],
    formidable: {
      uploadDir: path.join(__dirname, "../upload/temp"), // 同磁盘分区
      maxFileSize: 200 * 1024 * 1024, // 最大 200MB
      keepExtensions: true,
    },
  }),
  strongFileController.uploadChunk,
);

// 合并文件
router.post("/mergeChunks", koaBody(), strongFileController.mergeChunks);

// 取消/清理
router.post("/deleteFile", koaBody(), strongFileController.deleteFile);

module.exports = router;
