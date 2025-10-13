import Router from "@koa/router";
import { UserController } from "../controllers";

const router = new Router({prefix:"/user"});

router.post("/getUsers",UserController.getUsers)




export default router;