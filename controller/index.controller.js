const axios = require("axios");

class Index {
  async home(ctx, next) {
    ctx.body = "home page";
  }
  async foo(ctx, next) {
    ctx.body = "foo page";
    ctx.redirect("/bar"); // 重定向，只针对同步请求
  }
  async bar(ctx, next) {
    try {
      ctx.body = "bar page";
      const xxx = JSON.parse("");
    } catch (e) {
      throw { code: -2, message: e.message };
    }
  }
  async getRemoteData(ctx, next) {
    await axios
      .get(
        "https://yunmk.feidee.net/cab-market-ws/market/v1/template/home?page_code=accountbook",
      )
      .then((res) => {
        console.log(res.data.data);
        ctx.body = {
          code: 0,
          result: res.data.data,
          message: "succeed",
        };
      });
  }
  async render(ctx, next) {
    await ctx.render("index", {
      name: "张三",
      sex: "male",
      list: ["number1", "number2"],
    });
  }
  async collectCrashReport(ctx, next) {
    const data = ctx.request.body; // 参数结构{crash: 1111}
    ctx.body = {
      code: 0,
      result: data.crash,
      message: "接收crash数据",
    };
  }
  async chatStream(ctx, next) {
    // 1. 设置 SSE 响应头
    ctx.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    ctx.status = 200;

    const text =
      "你好呀，我是用 Koa 模拟的 AI 流式回复，现在正在一个字一个字往外推送给前端 Vue 组件～";

    // 2. 监听客户端断开连接
    ctx.req.on("close", () => {
      ctx.res.end();
    });

    // 3. 逐字推送
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      // 格式：data: 内容\n\n
      ctx.res.write(`data: ${char}\n\n`);
      // 模拟延迟
      await new Promise((r) => setTimeout(r, 80));
    }

    // 4. 结束流
    ctx.res.write("data: [DONE]\n\n");
    ctx.res.end();
  }
  async chatStreamFetch(ctx, next) {
    const sleep = (ms) => {
      return new Promise((r) => setTimeout(r, ms));
    };
    ctx.set({
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    ctx.status = 200;

    // 消息 1: 文本
    ctx.res.write(
      JSON.stringify({
        type: "text",
        content: "这是一条文本消息，",
      }) + "\n",
    );
    await sleep(500);

    // 消息 2: 继续文本
    ctx.res.write(
      JSON.stringify({
        type: "text",
        content: "这是后续内容。",
      }) + "\n",
    );
    await sleep(500);

    // 消息 3: 图片
    ctx.res.write(
      JSON.stringify({
        type: "image",
        url: "https://p3-sign.toutiaoimg.com/tos-cn-i-ezhpy3drpa/53ba8181edf64cdb849c20973c4f43c3~tplv-tt-origin-web:gif.jpeg?_iz=58558&from=article.pc_detail&lk3s=953192f4&x-expires=1774784978&x-signature=nOQEC7YVbBR2XKrMZwUoITj37yE%3D",
        alt: "示例图片",
      }) + "\n",
    );
    await sleep(500);

    // 消息 4: 卡片
    ctx.res.write(
      JSON.stringify({
        type: "card",
        title: "卡片标题",
        description: "卡片描述内容",
        link: "https://www.toutiao.com/article/7617463264179405327",
      }) + "\n",
    );
    await sleep(500);

    // 消息 5: 结束事件
    ctx.res.write(
      JSON.stringify({
        type: "system",
        event: "stream_end",
        data: { timestamp: Date.now() },
      }) + "\n",
    );

    ctx.res.end();
  }
  async upload(ctx, next) {
    try {
      console.log();
      const {
        file,
        file: { mimetype, newFilename },
      } = await ctx.request.files;
      ctx.body = {
        code: 0,
        result: {
          mimetype,
          fileName: newFilename,
          url: `${ctx.request.host}/static/${newFilename} `,
        },
        message: "上传完成",
      };
    } catch (e) {
      console.log(222, e);
    }
  }
}

module.exports = new Index();
