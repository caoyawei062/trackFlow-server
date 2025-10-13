import Koa from "koa";
import koaBody from "koa-body";
import router from "./router/index";
import logger from 'koa-logger'
import {loggerMiddleware} from './log/index'
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


// 使用路由 allowedMethods 中间件用来处理非法请求
app.use(router.routes()).use(router.allowedMethods());
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
