import Router from "@koa/router";
import User from "./userRouter"
import Auth from "./authRouter"
const router = new Router({prefix:"/api"});

router.use(User.routes()).use(User.allowedMethods());
router.use(Auth.routes()).use(Auth.allowedMethods());

export default router;