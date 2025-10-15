# TrackFlow Server
<div align="center">
  <img src="./src/assets/image/logo3.png" alt="TrackFlow Logo" width="200"/>
</div>
一个使用 Koa + TypeScript 构建的任务分配和追踪服务器。

## 快速开始

### 安装依赖
```bash
pnpm install
```

### 开发模式运行
```bash
pnpm run dev
```
服务器将在 http://localhost:3000 启动

### 构建项目
```bash
pnpm run build
```

### 生产模式运行
```bash
pnpm run start
```

## API 端点

- `GET /` - 主页，返回欢迎信息
- `GET /health` - 健康检查端点

## 项目结构

```
src/
  app.ts          # 应用入口文件
tsconfig.json     # TypeScript 配置
nodemon.json      # Nodemon 配置
package.json      # 项目依赖和脚本
```

## 配置说明

- **TypeScript**: 使用 ES2020 目标版本，CommonJS 模块系统
- **Nodemon**: 监听 src 目录下的 .ts 和 .json 文件变化
- **端口**: 默认 3000，可通过环境变量 PORT 修改

## 开发工具

- TypeScript 编译器
- ts-node 运行时
- nodemon 文件监听
- Koa 框架
- @koa/router 路由

## trackFlow-server
## install dependencies
```bash
pnpm add koa koa-body @koa/router log4js qs jsonwebtoken pm2
pnpm add -D typescript @types/koa @types/koa-body @types/koa__router  @types/qs @types/jsonwebtoken @types/node prettier eslint ts-node
```
## TODO 开发者请按照TODO.md日程进行开发
