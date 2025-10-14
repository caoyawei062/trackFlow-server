import { Context } from "koa";
import { UserService } from "../services";
import { ResponseHelper, ApiResponseDecorator } from "../utils/response";
import { ResponseCode } from "../types/response";

// 扩展 Context 类型以支持 request.body
interface ExtendedContext extends Context {
  request: Context['request'] & {
    body?: any;
    files?: any;
  };
}


/**
 * 用户注册
 * 使用 ResponseHelper 进行类型安全的响应处理
 */
const register = async (ctx: ExtendedContext) => {
    try {
        // 现在可以安全地访问 request.body
        const { email, password } = ctx.request.body || {};
        
        // 参数验证
        if (!email || !password) {
            ResponseHelper.invalidParams(ctx, "邮箱和密码不能为空");
            return;
        }

        // 调用服务层处理业务逻辑
        const result = await UserService.register(email, password);
        
        // 成功响应 - 使用 ResponseHelper.success 设置标准格式
        ResponseHelper.success(ctx, result, "注册成功");
        
    } catch (error: any) {
        console.error('Register error:', error);
        
        // 错误响应 - 使用 ResponseHelper.error 设置标准格式
        ResponseHelper.error(
            ctx, 
            error.code || ResponseCode.INTERNAL_ERROR, 
            error.message || "注册失败"
        );
    }
}

/**
 * 用户登录
 * 展示标准的响应处理方式
 */
const login = async (ctx: ExtendedContext) => {
    try {
        const { email, password } = ctx.request.body || {};
        
        if (!email || !password) {
            ResponseHelper.invalidParams(ctx, "邮箱和密码不能为空");
            return;
        }

        // 这里需要实现 UserService.login 方法
        // const result = await UserService.login(email, password);
        
        // 临时响应，展示成功格式
        ResponseHelper.success(ctx, { email, token: "sample_token" }, "登录成功");
        
    } catch (error: any) {
        ResponseHelper.error(ctx, ResponseCode.UNAUTHORIZED, "登录失败");
    }
}

/**
 * 获取用户列表
 * 展示分页响应的使用
 */
const getUsers = async (ctx: ExtendedContext) => {
    try {
        const { page = 1, pageSize = 10, keyword } = ctx.request.body || {};
        
        // 调用现有的服务方法获取用户列表
        const users = await UserService.getUsers();
        
        // 模拟分页处理（实际项目中应该在服务层处理）
        const startIndex = (Number(page) - 1) * Number(pageSize);
        const endIndex = startIndex + Number(pageSize);
        const paginatedUsers = users.slice(startIndex, endIndex);
        
        // 使用分页响应格式
        ResponseHelper.pagination(
            ctx,
            paginatedUsers,
            users.length,
            Number(page),
            Number(pageSize),
            "获取用户列表成功"
        );
        
    } catch (error: any) {
        console.error('Get users error:', error);
        ResponseHelper.databaseError(ctx, "获取用户列表失败");
    }
}

export { register, login, getUsers };