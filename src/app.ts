import Koa from "koa";
import koaBody from "koa-body";
import router from "./router/index";
import logger from 'koa-logger'
import {loggerMiddleware} from './log/index'
import responseHandler from "./middleware/response";
import {VerifyTokenMiddleware} from "./middleware/auth";
const app = new Koa();



// 解析请求体 - 必须在路由之前
app.use(koaBody({
  multipart: true,
  urlencoded: true,
  json: true,
  text: true,
  formidable: {
    uploadDir: './uploads', // 上传文件目录
    keepExtensions: true, // 保持文件扩展名
  }
}));
// 用来记录请求日志
if (process.env.NODE_ENV === 'production') {
  app.use(loggerMiddleware);
}else {
  app.use(logger());
}
// 处理响应格式的中间件
app.use(responseHandler);
// // 验证token中间件
// app.use(VerifyTokenMiddleware);
// 使用路由 allowedMethods 中间件用来处理非法请求
app.use(router.routes()).use(router.allowedMethods());
// 处理
// 应用启动错误处理
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
