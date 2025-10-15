# 响应双层嵌套问题修复文档

## 问题描述

使用 `ResponseHelper.error()` 等方法时，返回的响应被包装了两层：

```json
{
    "code": 401,
    "message": "No token provided",
    "data": {
        "code": 401,
        "message": "No token provided",
        "data": null
    }
}
```

期望的正确格式应该是：

```json
{
    "code": 401,
    "message": "No token provided",
    "data": null
}
```

## 问题原因

1. `ResponseHelper.error()` 设置了标准的 API 响应格式到 `ctx.body`
2. 响应中间件 `response.ts` 检测到 `ctx.body` 有值
3. 响应中间件再次包装响应，导致双层嵌套

## 解决方案

### 修改响应中间件，检测已格式化的响应

在 `src/middleware/response.ts` 中添加检测逻辑：

```typescript
export default async function (ctx: ResponseContext, next: Next) {
  try {
    await next();
    
    if (ctx.body !== undefined) {
      const originalBody = ctx.body;
      
      // ✅ 关键修复：检查是否已经是标准的 API 响应格式
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
    }
    // ... 其他逻辑
  } catch (err) {
    // ... 错误处理
  }
}
```

## 工作原理

### 检测逻辑

```typescript
const isApiResponse = originalBody && 
  typeof originalBody === 'object' &&
  'code' in originalBody && 
  'message' in originalBody && 
  'data' in originalBody;
```

这段代码检查响应体是否：
1. 不为空
2. 是一个对象
3. 包含 `code` 字段
4. 包含 `message` 字段
5. 包含 `data` 字段

如果满足以上条件，说明已经是标准格式，直接返回，不再包装。

### 两种响应方式对比

#### 方式一：使用 ResponseHelper（推荐）

```typescript
// 在控制器中使用 ResponseHelper
export async function VerifyTokenMiddleware(ctx: Context, next: Next) {
  if (!token) {
    // ResponseHelper 会设置标准格式
    ResponseHelper.error(ctx, ResponseCode.UNAUTHORIZED, 'No token provided');
    return; // ✅ 响应中间件检测到标准格式，不会再次包装
  }
  await next();
}
```

**输出：**
```json
{
  "code": 401,
  "message": "No token provided",
  "data": null
}
```

#### 方式二：直接设置 ctx.body

```typescript
// 直接设置 ctx.body（不推荐）
const controller = async (ctx: Context) => {
  const user = await getUserById(id);
  ctx.body = user; // ⚠️ 不是标准格式
};
```

**输出（会被中间件包装）：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "张三"
  }
}
```

## 其他改进

### 1. auth 中间件优化

```typescript
// ✅ 改进前
export function VerifyTokenMiddleware(ctx: Context, next: Next) {
  // 缺少 async/await
  // 使用 (ctx as any).user
  // 错误处理不完善
}

// ✅ 改进后
export async function VerifyTokenMiddleware(ctx: Context, next: Next) {
  try {
    const token = ctx.headers.authorization?.split(' ')[1];
    
    if (!token) {
      ResponseHelper.error(ctx, ResponseCode.UNAUTHORIZED, 'No token provided');
      return;
    }
    
    const secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = Jwt.verify(token, secret);
    
    // 使用 ctx.state.user 而不是 (ctx as any).user
    ctx.state.user = decoded;
    
    await next(); // 添加 await
  } catch (error: any) {
    // 更详细的错误处理
    if (error.name === 'TokenExpiredError') {
      ResponseHelper.error(ctx, ResponseCode.UNAUTHORIZED, 'Token 已过期');
    } else if (error.name === 'JsonWebTokenError') {
      ResponseHelper.error(ctx, ResponseCode.UNAUTHORIZED, 'Token 无效');
    } else {
      ResponseHelper.error(ctx, ResponseCode.INTERNAL_ERROR, '服务器异常');
    }
  }
}
```

### 2. 添加类型支持

创建 `src/types/koa-extend.d.ts`：

```typescript
declare module 'koa' {
  interface DefaultState {
    user?: {
      id: number;
      email: string;
      role?: string;
      [key: string]: any;
    };
  }
  
  interface Request {
    body?: any;
    files?: any;
  }
}
```

现在可以类型安全地访问 `ctx.state.user`：

```typescript
const controller = async (ctx: Context) => {
  // ✅ 有类型提示和检查
  const user = ctx.state.user;
  
  if (user) {
    console.log(user.id);    // 类型安全
    console.log(user.email); // 类型安全
  }
}
```

## 使用示例

### 场景一：身份验证失败

```typescript
// 代码
export async function VerifyTokenMiddleware(ctx: Context, next: Next) {
  if (!token) {
    ResponseHelper.error(ctx, ResponseCode.UNAUTHORIZED, 'No token provided');
    return;
  }
}

// 响应
{
  "code": 401,
  "message": "No token provided",
  "data": null
}
```

### 场景二：Token 过期

```typescript
// 代码
catch (error: any) {
  if (error.name === 'TokenExpiredError') {
    ResponseHelper.error(ctx, ResponseCode.UNAUTHORIZED, 'Token 已过期');
  }
}

// 响应
{
  "code": 401,
  "message": "Token 已过期",
  "data": null
}
```

### 场景三：正常业务响应

```typescript
// 代码
const getUser = async (ctx: Context) => {
  const user = await UserService.getUser(id);
  ResponseHelper.success(ctx, user, "获取成功");
}

// 响应
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

## 测试验证

### 1. 测试无 Token 的请求

```bash
curl http://localhost:3000/api/protected-route \
  -H "Content-Type: application/json"
```

**预期响应：**
```json
{
  "code": 401,
  "message": "No token provided",
  "data": null
}
```

### 2. 测试过期的 Token

```bash
curl http://localhost:3000/api/protected-route \
  -H "Authorization: Bearer expired_token" \
  -H "Content-Type: application/json"
```

**预期响应：**
```json
{
  "code": 401,
  "message": "Token 已过期",
  "data": null
}
```

### 3. 测试有效的 Token

```bash
curl http://localhost:3000/api/protected-route \
  -H "Authorization: Bearer valid_token" \
  -H "Content-Type: application/json"
```

**预期响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": { /* 实际数据 */ }
}
```

## 注意事项

1. **使用 ResponseHelper**：始终使用 `ResponseHelper` 的方法设置响应，确保格式统一
2. **避免直接设置**：避免直接设置已格式化的对象到 `ctx.body`
3. **中间件顺序**：确保响应中间件在路由之前注册
4. **类型安全**：使用 `ctx.state.user` 而不是 `(ctx as any).user`
5. **async/await**：中间件函数需要使用 `async/await`

## 总结

通过在响应中间件中添加检测逻辑，现在系统可以：

- ✅ 自动识别已格式化的响应
- ✅ 避免双层嵌套问题
- ✅ 保持响应格式的一致性
- ✅ 支持混合使用 ResponseHelper 和直接设置 ctx.body
- ✅ 提供完整的 TypeScript 类型支持

修复后的响应始终是单层的标准格式，无论使用哪种方式设置响应。