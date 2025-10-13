import { Context } from "koa";
import { UserService } from "../services";


const getUsers = async (ctx:Context) => {
  try {
    const users = await UserService.getUsers();
    console.log(ctx.request);
    ctx.body = {
      message: "success",
      code: 200,
      data: users
    };
  } catch (error: any) {
    ctx.body = {
      message: error.message,
      code: 500
    };
  }
}

export { getUsers };