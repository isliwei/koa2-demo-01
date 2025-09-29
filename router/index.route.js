const Router = require("@koa/router"); // 路由
const { koaBody } = require("koa-body"); // post参数解析
const path = require("path");

const router = new Router({ prefix: "" });
const {
  home,
  getRemoteData,
  foo,
  bar,
  render,
  upload,
} = require("../controller/index.controller");

router.get("/", home);
router.get("/getRemoteData", getRemoteData);
router.get("/foo", foo);
router.get("/bar", bar);
router.get("/render", render);
router.post(
  "/upload",
  koaBody({
    multipart: true, // 允许处理文件上传请求
    formidable: {
      uploadDir: path.join(__dirname, "../file"), // 上传文件存放的目录
      keepExtensions: true, // 保留上传文件的原始扩展名
    },
  }),
  upload
);

module.exports = router;
