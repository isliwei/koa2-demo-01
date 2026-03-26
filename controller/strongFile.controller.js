const fs = require("fs");
const path = require("path");
const stream = require("stream");
const { promisify } = require("util");
const pipeline = promisify(stream.pipeline);

// 配置上传目录
const UPLOAD_DIR = path.join(__dirname, "../upload");
const TEMP_DIR = path.join(UPLOAD_DIR, "temp");
const STATIC_DIR = path.join(UPLOAD_DIR, "static");

// 确保目录存在
[UPLOAD_DIR, TEMP_DIR, STATIC_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ✅ 辅助方法：获取已上传分片（模块级函数）
async function getUploadedChunks(fileHash) {
  const chunkDir = path.join(TEMP_DIR, fileHash);
  if (!fs.existsSync(chunkDir)) return [];
  const chunks = await fs.promises.readdir(chunkDir);
  return chunks.map((c) => parseInt(c));
}

// ✅ 导出所有方法作为对象
module.exports = {
  // 1. 秒传检查
  async checkFile(ctx, next) {
    const { fileHash } = ctx.request.body;
    const finalPath = path.join(STATIC_DIR, fileHash);

    // 模拟数据库查询：检查文件是否已存在
    const exists = fs.existsSync(finalPath);

    ctx.body = {
      code: 0,
      result: {
        shouldUpload: !exists,
        uploadedChunks: exists ? [] : await getUploadedChunks(fileHash),
      },
      message: exists ? "文件已存在，秒传成功" : "可以继续上传",
    };
  },

  // 2. 初始化上传
  async initUpload(ctx, next) {
    const { fileHash } = ctx.request.body;
    const uploadId = fileHash;
    const chunkDir = path.join(TEMP_DIR, uploadId);

    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    ctx.body = {
      code: 0,
      result: { uploadId, chunkDir },
      message: "初始化成功",
    };
  },

  // 3. 上传分片
  async uploadChunk(ctx, next) {
    const { fileToken, chunkIndex } = ctx.request.body;
    const file = ctx.request.files?.file;

    if (!file) {
      ctx.status = 400;
      ctx.body = { code: -1, message: "未找到文件分片" };
      return;
    }

    const chunkDir = path.join(TEMP_DIR, fileToken);
    const chunkPath = path.join(chunkDir, `${chunkIndex}`);

    // 确保目录存在
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    // 移动分片文件到临时目录 (支持幂等：直接覆盖)
    await fs.promises.rename(file.filepath, chunkPath);

    ctx.body = {
      code: 0,
      result: { chunkIndex, uploaded: true },
      message: `分片 ${chunkIndex} 上传成功`,
    };
  },

  // 4. 合并文件
  async mergeChunks(ctx, next) {
    const { fileToken, fileName } = ctx.request.body;
    const chunkDir = path.join(TEMP_DIR, fileToken);
    const finalPath = path.join(STATIC_DIR, fileToken);

    // 获取所有分片
    const chunks = await fs.promises.readdir(chunkDir);
    chunks.sort((a, b) => parseInt(a) - parseInt(b));

    // 创建写入流
    const writeStream = fs.createWriteStream(finalPath);

    try {
      // 流式合并，避免大文件内存溢出
      for (const chunk of chunks) {
        const chunkPath = path.join(chunkDir, chunk);
        const readStream = fs.createReadStream(chunkPath);
        await pipeline(readStream, writeStream, { end: false });
      }

      // 清理临时目录
      await fs.promises.rm(chunkDir, { recursive: true, force: true });

      ctx.body = {
        code: 0,
        result: {
          url: `/static/${fileToken}`,
          fileName: fileName,
        },
        message: "文件合并成功",
      };
    } catch (err) {
      ctx.body = { code: -2, message: "合并失败", error: err.message };
    }
  },

  // 5. 取消/清理
  async deleteFile(ctx, next) {
    const { fileToken } = ctx.request.body;
    const chunkDir = path.join(TEMP_DIR, fileToken);

    try {
      if (fs.existsSync(chunkDir)) {
        await fs.promises.rm(chunkDir, { recursive: true, force: true });
      }
      ctx.body = { code: 0, message: "清理成功" };
    } catch (e) {
      ctx.body = { code: -1, message: "清理失败" };
    }
  },
};
