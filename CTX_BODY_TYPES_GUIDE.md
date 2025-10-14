# ctx.body 类型说明使用指南

## 概述

本文档详细说明了在 TrackFlow Server 项目中如何为 `ctx.body` 添加类型说明，实现类型安全的 API 响应处理。

## 核心组件

### 1. 类型定义 (`src/types/response.ts`)

定义了标准的 API 响应接口：

```typescript
// 基础响应接口
interface ApiResponse<T = any> {
  code: number;    // 状态码：0表示成功，其他表示错误
  message: string; // 响应消息
  data: T;         // 响应数据
}

// 成功响应接口
interface SuccessResponse<T = any> extends ApiResponse<T> {
  code: 0;
  data: T;
}

// 错误响应接口
interface ErrorResponse extends ApiResponse<null> {
  code: number; // 非0错误码
  data: null;
}

// 分页响应接口
interface PaginationResponse<T = any> extends SuccessResponse<PaginationData<T>> {
  data: PaginationData<T>;
}
```

### 2. 响应工具类 (`src/utils/response.ts`)

提供了类型安全的响应处理方法：

```typescript
export class ResponseHelper {
  // 成功响应
  static success<T = any>(ctx: Context, data: T, message?: string): void

  // 错误响应
  static error(ctx: Context, code: ResponseCode, message: string): void

  // 分页响应
  static pagination<T = any>(
    ctx: Context,
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message?: string
  ): void

  // 快捷方法
  static invalidParams(ctx: Context, message?: string): void
  static unauthorized(ctx: Context, message?: string): void
  static notFound(ctx: Context, message?: string): void
  static databaseError(ctx: Context, message?: string): void
  static businessError(ctx: Context, message?: string): void
}
```

### 3. 响应中间件 (`src/middleware/response.ts`)

统一处理响应格式，确保所有响应都符合标准格式：

```typescript
interface ResponseContext extends Context {
  body: ApiResponse | any;
}

export default async function (ctx: ResponseContext, next: Next) {
  try {
    await next();
    
    if (ctx.body !== undefined) {
      const response: ApiResponse = {
        code: ctx.body?.code || ResponseCode.SUCCESS,
        message: ctx.body?.message || ResponseMessage.SUCCESS,
        data: ctx.body?.data || ctx.body || {},
      };
      ctx.body = response;
    }
  } catch (err: any) {
    const errorResponse: ApiResponse<null> = {
      code: err.code || ResponseCode.INTERNAL_ERROR,
      message: err.message || ResponseMessage.INTERNAL_ERROR,
      data: null,
    };
    ctx.body = errorResponse;
  }
}
```

## 使用方法

### 1. 在控制器中使用类型安全的响应

```typescript
import { Context } from "koa";
import { ResponseHelper } from "../utils/response";
import { ResponseCode } from "../types/response";

// 扩展 Context 类型
interface ExtendedContext extends Context {
  request: Context['request'] & {
    body?: any;
    files?: any;
  };
}

const register = async (ctx: ExtendedContext) => {
    try {
        // 类型安全地访问 request.body
        const { email, password } = ctx.request.body || {};
        
        // 参数验证
        if (!email || !password) {
            ResponseHelper.invalidParams(ctx, "邮箱和密码不能为空");
            return;
        }

        // 业务逻辑处理
        const result = await UserService.register(email, password);
        
        // 类型安全的成功响应
        // ctx.body 会被自动设置为 SuccessResponse<typeof result> 类型
        ResponseHelper.success(ctx, result, "注册成功");
        
    } catch (error: any) {
        // 类型安全的错误响应
        // ctx.body 会被自动设置为 ErrorResponse 类型
        ResponseHelper.error(
            ctx, 
            error.code || ResponseCode.INTERNAL_ERROR, 
            error.message || "注册失败"
        );
    }
}
```

### 2. 分页响应示例

```typescript
const getUsers = async (ctx: ExtendedContext) => {
    try {
        const { page = 1, pageSize = 10 } = ctx.request.body || {};
        
        const users = await UserService.getUsers();
        const startIndex = (page - 1) * pageSize;
        const paginatedUsers = users.slice(startIndex, startIndex + pageSize);
        
        // 类型安全的分页响应
        // ctx.body 会被自动设置为 PaginationResponse<User> 类型
        ResponseHelper.pagination(
            ctx,
            paginatedUsers,
            users.length,
            page,
            pageSize,
            "获取用户列表成功"
        );
        
    } catch (error: any) {
        ResponseHelper.databaseError(ctx, "获取用户列表失败");
    }
}
```

### 3. 快捷错误响应

```typescript
const deleteUser = async (ctx: ExtendedContext) => {
    const { id } = ctx.request.body || {};
    
    if (!id) {
        // 参数错误响应 (400)
        ResponseHelper.invalidParams(ctx, "用户ID不能为空");
        return;
    }
    
    const user = await UserService.findById(id);
    if (!user) {
        // 资源不存在响应 (404)
        ResponseHelper.notFound(ctx, "用户不存在");
        return;
    }
    
    if (!hasPermission(ctx.user, user)) {
        // 权限不足响应 (403)
        ResponseHelper.unauthorized(ctx, "无权限删除该用户");
        return;
    }
    
    try {
        await UserService.delete(id);
        ResponseHelper.success(ctx, null, "删除成功");
    } catch (error) {
        ResponseHelper.databaseError(ctx, "删除失败");
    }
}
```

## TypeScript 类型处理方案

### 方案一：扩展接口（推荐）

```typescript
// 为 Context 扩展 request.body 类型
interface ExtendedContext extends Context {
  request: Context['request'] & {
    body?: any;
    files?: any;
  };
}

// 使用扩展后的 Context
const controller = async (ctx: ExtendedContext) => {
    // 现在可以安全访问 ctx.request.body
    const data = ctx.request.body;
}
```

### 方案二：类型断言（快速解决）

```typescript
const controller = async (ctx: Context) => {
    // 使用类型断言访问 body
    const data = (ctx.request as any).body;
}
```

## 响应格式示例

### 成功响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "张三"
  }
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "参数错误",
  "data": null
}
```

### 分页响应

```json
{
  "code": 0,
  "message": "获取用户列表成功",
  "data": {
    "list": [
      {
        "id": 1,
        "email": "user1@example.com",
        "name": "张三"
      },
      {
        "id": 2,
        "email": "user2@example.com", 
        "name": "李四"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

## 常用状态码

```typescript
export enum ResponseCode {
  SUCCESS = 0,           // 成功
  INVALID_PARAMS = 400,  // 参数错误
  UNAUTHORIZED = 401,    // 未授权
  FORBIDDEN = 403,       // 禁止访问
  NOT_FOUND = 404,       // 资源不存在
  INTERNAL_ERROR = 500,  // 服务器内部错误
  DATABASE_ERROR = 501,  // 数据库错误
  BUSINESS_ERROR = 502,  // 业务逻辑错误
}
```

## 最佳实践

1. **统一使用 ResponseHelper**：避免直接设置 `ctx.body`，使用响应工具类确保格式一致
2. **类型安全**：使用扩展接口而不是类型断言，提高代码可维护性
3. **错误处理**：在 try-catch 中使用适当的错误响应方法
4. **参数验证**：在业务逻辑前进行参数验证，使用 `invalidParams` 响应
5. **日志记录**：在错误处理中添加日志记录，便于调试和监控

## 配置要求

确保在 `src/app.ts` 中正确配置中间件顺序：

```typescript
// 响应处理中间件必须在路由之前
app.use(responseHandler);
app.use(router.routes()).use(router.allowedMethods());
```

## 总结

通过这套类型系统，你可以：

- ✅ 获得完整的 TypeScript 类型支持
- ✅ 统一的 API 响应格式
- ✅ 类型安全的 `ctx.body` 操作
- ✅ 便捷的错误处理方法
- ✅ 自动的响应格式化
- ✅ 更好的代码可维护性和可读性

所有的 `ctx.body` 设置都会有完整的类型检查和 IntelliSense 支持。