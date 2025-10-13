import Router from "@koa/router";
import User from "./userRouter"
const router = new Router({prefix:"/api"});

router.use(User.routes())

export default router;