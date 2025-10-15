import Router from "@koa/router";
import { VerifyTokenMiddleware } from "../middleware/auth";

const authRouter = new Router({prefix:"/auth"});

authRouter.use(VerifyTokenMiddleware);

authRouter.get("/profile", async (ctx) => {
    ctx.body = {
        message: "这是一个受保护的路由，只有通过验证的用户才能访问。",
        user: ctx.state.user, // 假设 VerifyTokenMiddleware 将用户信息存储在 ctx.state.user 中
    };
});

export default authRouter;
