const axios = require("axios");
let connectionCount = 0;
const FAILURE_THRESHOLD = 3;
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
    const data = ctx.request.body;
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
    const { retry } = ctx.query;
    if (retry) {
      console.log(`重试消息：${retry}`);
    }
    const sleep = (ms) => {
      return new Promise((r) => setTimeout(r, ms));
    };

    const send = (data) => {
      ctx.res.write(JSON.stringify(data) + "\n");
    };

    ctx.set({
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    ctx.status = 200;

    // ============ 模拟前 3 次连接失败 ============
    connectionCount += 1;
    console.log(`第 ${connectionCount} 次连接请求`);

    if (connectionCount <= FAILURE_THRESHOLD) {
      // 前 3 次直接返回错误
      console.log(`模拟连接失败 ${connectionCount}/${FAILURE_THRESHOLD}`);
      ctx.status = 500;
      ctx.res.write(
        JSON.stringify({
          type: "system",
          event: "connection_failed",
          data: {
            attempt: connectionCount,
            message: `连接失败 (${connectionCount}/${FAILURE_THRESHOLD})`,
          },
        }) + "\n",
      );
      ctx.res.end();
      return;
    }

    // ============ 第 4 次及以后正常连接 ============
    console.log("连接成功，开始推送消息");

    // 重置计数器（可选，用于下次测试）
    connectionCount = 0;

    try {
      // ============ 阶段 1: 思考中 ============
      send({
        type: "system",
        event: "status_change",
        data: {
          status: "thinking",
          message: "正在理解您的问题...",
        },
      });
      await sleep(800);

      // ============ 阶段 2: 生成中 - 创建消息 ============
      const messageId = `msg_${Date.now()}`;

      send({
        type: "text",
        id: messageId,
        status: "generating",
        content: "",
      });
      await sleep(500);

      // ============ 阶段 3: 流式追加文本内容 ============
      const textChunks = [
        "这是一条文本消息，",
        "这是后续内容。",
        "支持流式追加显示。",
      ];

      for (const chunk of textChunks) {
        send({
          type: "text",
          id: messageId,
          status: "generating",
          content: chunk,
          append: true,
        });
        await sleep(500);
      }

      // ============ 阶段 4: 消息完成 ============
      send({
        type: "text",
        id: messageId,
        status: "completed",
      });
      await sleep(300);

      // ============ 阶段 5: 图片消息 ============
      const imageId = `msg_${Date.now()}`;

      send({
        type: "image",
        id: imageId,
        status: "generating",
      });
      await sleep(500);

      send({
        type: "image",
        id: imageId,
        status: "completed",
        url: "https://cdn-v1.cnhis.com/esb-bizfile/5545/common/5/20260323/upload-14985979783527892524Snipaste_2025-07-31_10-55-08.png",
        alt: "示例图片",
      });
      await sleep(300);

      // ============ 阶段 6: 卡片消息 ============
      send({
        type: "card",
        id: `msg_${Date.now()}`,
        status: "completed",
        title: "卡片标题",
        description: "卡片描述内容",
        link: "https://www.toutiao.com/article/7617463264179405327",
      });
      await sleep(300);

      // ============ 阶段 7: 流结束 ============
      send({
        type: "system",
        event: "stream_end",
        data: {
          timestamp: Date.now(),
          totalMessages: 4,
        },
      });

      ctx.res.end();
    } catch (err) {
      send({
        type: "system",
        event: "stream_error",
        data: {
          message: err instanceof Error ? err.message : String(err),
        },
      });
      ctx.res.end();
    }
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
