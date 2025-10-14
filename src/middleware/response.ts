import { Context, Next} from "koa";
import { ApiResponse, ResponseCode, ResponseMessage } from "../types/response";

// 扩展 Context 类型，为 body 添加类型
interface ResponseContext extends Context {
  body: ApiResponse | any;
}

export default async function (ctx: ResponseContext, next: Next) {
  try {
    await next();
    
    // 如果 controller 已经手动设置了 ctx.body，则包装为成功响应
    if (ctx.body !== undefined) {
      const originalBody = ctx.body;
      ctx.status = 200; // 强制 200
      
      // 构造标准的 API 响应格式
      const response: ApiResponse = {
        code: originalBody?.code || ResponseCode.SUCCESS,
        message: originalBody?.message || ResponseMessage.SUCCESS,
        data: originalBody?.data || originalBody || {},
      };
      
      ctx.body = response;
    } else {
      // 处理无返回体的情况
      ctx.status = 200;
      const response: ApiResponse<null> = {
        code: (ctx as any).code || ResponseCode.SUCCESS,
        message: ResponseMessage.SUCCESS,
        data: null,
      };
      
      ctx.body = response;
    }
  } catch (err: Error | any) {
    // 捕获所有异常，包括 4xx / 5xx    
    ctx.status = 200; // 依然返回 200
    
    const errorResponse: ApiResponse<null> = {
      code: err.code || err.status || ResponseCode.INTERNAL_ERROR,
      message: err.message || ResponseMessage.INTERNAL_ERROR,
      data: err.data || null,
    };
    
    ctx.body = errorResponse;
  }
};
