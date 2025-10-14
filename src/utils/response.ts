import { Context } from "koa";
import { 
  ApiResponse, 
  SuccessResponse, 
  ErrorResponse, 
  PaginationResponse,
  PaginationData,
  ResponseCode, 
  ResponseMessage 
} from "../types/response";

/**
 * 响应工具类
 * 提供统一的响应格式处理方法
 */
export class ResponseHelper {
  /**
   * 设置成功响应
   * @param ctx - Koa Context
   * @param data - 响应数据
   * @param message - 响应消息
   */
  static success<T = any>(
    ctx: Context, 
    data: T, 
    message: string = ResponseMessage.SUCCESS
  ): void {
    const response: SuccessResponse<T> = {
      code: ResponseCode.SUCCESS,
      message,
      data,
    };
    ctx.body = response;
  }

  /**
   * 设置错误响应
   * @param ctx - Koa Context
   * @param code - 错误码
   * @param message - 错误消息
   */
  static error(
    ctx: Context,
    code: ResponseCode = ResponseCode.INTERNAL_ERROR,
    message: string = ResponseMessage.INTERNAL_ERROR
  ): void {
    const response: ErrorResponse = {
      code,
      message,
      data: null,
    };
    ctx.body = response;
  }

  /**
   * 设置分页响应
   * @param ctx - Koa Context
   * @param list - 数据列表
   * @param total - 总记录数
   * @param page - 当前页码
   * @param pageSize - 每页大小
   * @param message - 响应消息
   */
  static pagination<T = any>(
    ctx: Context,
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = ResponseMessage.SUCCESS
  ): void {
    const paginationData: PaginationData<T> = {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    const response: PaginationResponse<T> = {
      code: ResponseCode.SUCCESS,
      message,
      data: paginationData,
    };
    
    ctx.body = response;
  }

  /**
   * 参数错误响应
   * @param ctx - Koa Context
   * @param message - 错误消息
   */
  static invalidParams(ctx: Context, message: string = ResponseMessage.INVALID_PARAMS): void {
    this.error(ctx, ResponseCode.INVALID_PARAMS, message);
  }

  /**
   * 未授权响应
   * @param ctx - Koa Context
   * @param message - 错误消息
   */
  static unauthorized(ctx: Context, message: string = ResponseMessage.UNAUTHORIZED): void {
    this.error(ctx, ResponseCode.UNAUTHORIZED, message);
  }

  /**
   * 资源不存在响应
   * @param ctx - Koa Context
   * @param message - 错误消息
   */
  static notFound(ctx: Context, message: string = ResponseMessage.NOT_FOUND): void {
    this.error(ctx, ResponseCode.NOT_FOUND, message);
  }

  /**
   * 数据库错误响应
   * @param ctx - Koa Context
   * @param message - 错误消息
   */
  static databaseError(ctx: Context, message: string = ResponseMessage.DATABASE_ERROR): void {
    this.error(ctx, ResponseCode.DATABASE_ERROR, message);
  }

  /**
   * 业务逻辑错误响应
   * @param ctx - Koa Context
   * @param message - 错误消息
   */
  static businessError(ctx: Context, message: string = ResponseMessage.BUSINESS_ERROR): void {
    this.error(ctx, ResponseCode.BUSINESS_ERROR, message);
  }
}

/**
 * 响应装饰器
 * 用于自动处理控制器方法的响应格式
 */
export function ApiResponseDecorator(
  successMessage: string = ResponseMessage.SUCCESS
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (ctx: Context, ...args: any[]) {
      try {
        const result = await originalMethod.call(this, ctx, ...args);
        
        // 如果控制器方法没有设置 ctx.body，则自动设置成功响应
        if (ctx.body === undefined && result !== undefined) {
          ResponseHelper.success(ctx, result, successMessage);
        }
        
        return result;
      } catch (error: any) {
        console.error(`Controller error in ${propertyKey}:`, error);
        ResponseHelper.error(ctx, error.code || ResponseCode.INTERNAL_ERROR, error.message);
      }
    };

    return descriptor;
  };
}