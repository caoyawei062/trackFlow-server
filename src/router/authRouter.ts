import Router from "@koa/router";
import { VerifyTokenMiddleware } from "../middleware/auth";
import { UserController } from "../controllers";

const authRouter = new Router({prefix:"/auth"});

authRouter.use(VerifyTokenMiddleware);

authRouter.get("/profile", UserController.getUserInfo);

export default authRouter;
