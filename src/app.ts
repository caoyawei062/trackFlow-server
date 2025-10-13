import Koa from "koa";
import Router from "@koa/router";

const app = new Koa();
const router = new Router();

// 简单的路由
router.get("/", (ctx) => {
  ctx.body = {
    message: "Hello Koa with TypeScript!",
    timestamp: new Date().toISOString(),
  };
});

router.get("/health", (ctx) => {
  ctx.body = {
    status: "OK",
    service: "trackFlow-server",
  };
});

// 使用路由
app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📍 Health check: http://localhost:${port}/health`);
});
