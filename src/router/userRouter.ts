import Router from "@koa/router";
import { UserController } from "../controllers";

const router = new Router({prefix:"/user"});


router.post("/register",UserController.register)
router.post("/login",UserController.login)



export default router;