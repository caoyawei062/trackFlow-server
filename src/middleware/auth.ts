import * as Jwt from "jsonwebtoken";
import { Context, Next } from "koa";
import { ResponseHelper } from "../utils/response";
import { ResponseCode } from "../types/response";

export function createToken(payload: object, secret: string = process.env.JWT_SECRET || 'default_secret', options?: Jwt.SignOptions): string {
  const token = Jwt.sign(payload, secret, {
    expiresIn: '7d', // 设置 token 过期时间为 7 天
    ...options,
  });
  return token;
}

export async function VerifyTokenMiddleware(ctx: Context, next: Next) {
  try {
    const token = ctx.headers.authorization?.split(' ')[1]; // 假设 token 在 Authorization header 中
    
    if (!token) {
      ResponseHelper.error(ctx, ResponseCode.UNAUTHORIZED, 'No token provided');
      return;
    }
    
    const secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = Jwt.verify(token, secret);
    
    // 将解码后的信息存储在 ctx.state 中（推荐方式）
    (ctx.state as any).user = decoded;
    
    await next();
  } catch (error: any) {
    console.error('Token verification error:', error);
    
    // 根据错误类型返回不同的响应
    if (error.name === 'TokenExpiredError') {
      ResponseHelper.error(ctx, ResponseCode.UNAUTHORIZED, 'Token 已过期');
    } else if (error.name === 'JsonWebTokenError') {
      ResponseHelper.error(ctx, ResponseCode.UNAUTHORIZED, 'Token 无效');
    } else {
      ResponseHelper.error(ctx, ResponseCode.INTERNAL_ERROR, '服务器异常');
    }
  }
}
