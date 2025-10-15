import { Context, Next} from "koa";
import { ApiResponse, ResponseCode, ResponseMessage } from "../types/response";

// 扩展 Context 类型，为 body 添加类型
interface ResponseContext extends Context {
  body: ApiResponse | any;
}

export default async function (ctx: ResponseContext, next: Next) {
  try {
    await next();
    
    // 如果 controller 已经手动设置了 ctx.body
    if (ctx.body !== undefined) {
      const originalBody = ctx.body;
      
      // 检查是否已经是标准的 API 响应格式（包含 code 和 message 和 data 字段）
      const isApiResponse = originalBody && 
        typeof originalBody === 'object' &&
        'code' in originalBody && 
        'message' in originalBody && 
        'data' in originalBody;
      
      // 如果已经是标准格式，不再包装
      if (isApiResponse) {
        ctx.status = 200;
        return;
      }
      
      // 否则包装为标准响应格式
      ctx.status = 200;
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
    // 捕获未捕获的异常    
    ctx.status = 200; // 依然返回 200
    
    const errorResponse: ApiResponse<null> = {
      code: ResponseCode.INTERNAL_ERROR,
      message: ResponseMessage.INTERNAL_ERROR,
      data: err.message
    };
    
    ctx.body = errorResponse;
  }
};
