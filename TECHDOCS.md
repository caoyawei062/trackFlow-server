# TrackFlow Server 技术文档

## 项目概述

TrackFlow Server 是一个基于 Koa + TypeScript 构建的 Node.js Web 服务器项目，使用 PM2 进行进程管理，支持开发和生产环境的不同配置。

## 技术栈

- **运行时**: Node.js
- **框架**: Koa.js + @koa/router
- **语言**: TypeScript
- **进程管理**: PM2
- **开发工具**: nodemon, ts-node
- **包管理器**: pnpm

## 项目结构

```
trackFlowServer/
├── src/
│   ├── app.ts                    # 应用入口文件
│   └── config/
│       └── pm2.config.ts         # 旧版PM2配置（已迁移）
├── dist/                         # TypeScript编译输出目录
├── logs/                         # PM2日志目录
├── ecosystem.config.js           # PM2生态系统配置文件
├── tsconfig.json                 # TypeScript配置
├── nodemon.json                  # Nodemon配置
├── package.json                  # 项目依赖和脚本
└── TECHDOCS.md                   # 本技术文档
```

## 配置详解

### 1. TypeScript 配置 (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",              // 编译目标版本
    "module": "commonjs",            // 模块系统
    "rootDir": "./src",              // 源码根目录
    "outDir": "./dist",              // 编译输出目录
    "strict": true,                  // 严格模式
    "esModuleInterop": true,         // ES模块互操作
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",      // 模块解析策略
    "resolveJsonModule": true,       // 允许导入JSON
    "skipLibCheck": true             // 跳过类型库检查
  },
  "include": ["src/**/*"],           // 包含的文件
  "exclude": ["node_modules", "dist"], // 排除的文件
  "ts-node": {
    "compilerOptions": {
      "module": "CommonJS"
    }
  }
}
```

### 2. Nodemon 配置 (nodemon.json)

```json
{
  "watch": ["src"],                  // 监听源码目录
  "ext": "ts,json",                  // 监听文件扩展名
  "ignore": ["src/**/*.spec.ts"],    // 忽略测试文件
  "exec": "ts-node src/app.ts"       // 执行命令
}
```

### 3. PM2 生态系统配置 (ecosystem.config.js)

#### 生产环境配置
```javascript
{
  name: "track_flow-prod",           // 应用名称
  script: "./dist/app.js",           // 执行脚本（编译后的JS）
  instances: "max",                  // 实例数量（使用所有CPU核心）
  exec_mode: "cluster",              // 集群模式
  autorestart: true,                 // 自动重启
  watch: false,                      // 生产环境不监听文件变化
  max_memory_restart: "500M",        // 内存超限重启阈值
  min_uptime: "10s",                 // 最小运行时间
  max_restarts: 10,                  // 最大重启次数
  restart_delay: 4000,               // 重启延迟（毫秒）
  cron_restart: "0 3 * * *",         // 定时重启（每天凌晨3点）
  env: {
    NODE_ENV: "production",
    PORT: 3000
  },
  // 日志配置
  error_file: "./logs/pm2-error.log",
  out_file: "./logs/pm2-out.log",
  log_file: "./logs/pm2-combined.log",
  time: true                         // 日志包含时间戳
}
```

#### 开发环境配置
```javascript
{
  name: "trackflow-dev",             // 应用名称
  script: "./src/app.ts",            // 执行脚本（TypeScript源码）
  interpreter: "ts-node",            // 使用ts-node解释器
  instances: 1,                      // 单实例
  exec_mode: "fork",                 // 分叉模式
  autorestart: true,                 // 自动重启
  watch: true,                       // 监听文件变化
  watch_delay: 1000,                 // 文件变化延迟（毫秒）
  ignore_watch: [                    // 忽略监听的目录/文件
    "node_modules",
    "dist",
    "logs",
    ".git",
    "*.log"
  ],
  max_memory_restart: "200M",        // 内存超限重启阈值
  env: {
    NODE_ENV: "development",
    PORT: 3001
  },
  // 开发环境日志配置
  error_file: "./logs/pm2-dev-error.log",
  out_file: "./logs/pm2-dev-out.log",
  log_file: "./logs/pm2-dev-combined.log",
  time: true
}
```

### 4. Package.json 脚本配置

```json
{
  "scripts": {
    // 基础脚本
    "dev": "nodemon",                              // 开发模式（使用nodemon）
    "start": "node dist/app.js",                   // 生产启动
    "build": "tsc",                                // TypeScript编译
    "clean": "rm -rf dist",                        // 清理构建文件
    
    // PM2 管理脚本
    "pm2:dev": "pm2 start ecosystem.config.js --only track_flow-dev",
    "pm2:prod": "npm run build && pm2 start ecosystem.config.js --only track_flow-prod",
    "pm2:stop": "pm2 stop all",                    // 停止所有进程
    "pm2:restart": "pm2 restart all",              // 重启所有进程
    "pm2:delete": "pm2 delete all",                // 删除所有进程
    
    // PM2 监控脚本
    "pm2:logs": "pm2 logs",                        // 查看日志
    "pm2:status": "pm2 status",                    // 查看状态
    "pm2:monit": "pm2 monit"                       // 实时监控
  }
}
```

## 使用指南

### 开发环境

```bash
# 方式1: 使用 nodemon（推荐开发调试）
pnpm run dev

# 方式2: 使用 PM2 开发模式（适合开发环境部署）
pnpm run pm2:dev
```

### 生产环境

```bash
# 构建并启动生产环境
pnpm run pm2:prod

# 或者分步执行
pnpm run build
pnpm run pm2:prod
```

### PM2 管理命令

```bash
# 查看进程状态
pnpm run pm2:status

# 查看实时日志
pnpm run pm2:logs

# 重启服务
pnpm run pm2:restart

# 停止服务
pnpm run pm2:stop

# 删除进程
pnpm run pm2:delete

# 实时监控
pnpm run pm2:monit
```

### 高级 PM2 命令

```bash
# 查看特定应用日志
npx pm2 logs track_flow-prod
npx pm2 logs trackflow-dev

# 重启特定应用
npx pm2 restart track_flow-prod
npx pm2 restart trackflow-dev

# 停止特定应用
npx pm2 stop track_flow-prod
npx pm2 stop trackflow-dev

# 查看详细信息
npx pm2 describe track_flow-prod

# 监控指定进程
npx pm2 monit track_flow-prod
```

## 端口配置

| 环境 | 端口 | 访问地址 |
|------|------|----------|
| 开发环境 | 3001 | http://localhost:3001 |
| 生产环境 | 3000 | http://localhost:3000 |

## 日志管理

### 日志文件位置
```
logs/
├── pm2-error.log          # 生产环境错误日志
├── pm2-out.log           # 生产环境输出日志
├── pm2-combined.log      # 生产环境综合日志
├── pm2-dev-error.log     # 开发环境错误日志
├── pm2-dev-out.log       # 开发环境输出日志
└── pm2-dev-combined.log  # 开发环境综合日志
```

### 日志特性
- 所有日志包含时间戳
- 按环境分类存储
- 支持实时查看
- 自动轮转（PM2内置）

## 性能优化配置

### 集群模式特性
- 生产环境使用所有CPU核心
- 自动负载均衡
- 零停机重启
- 故障转移

### 内存管理
- 开发环境：200M 限制
- 生产环境：500M 限制
- 超限自动重启
- 内存泄漏保护

### 稳定性保障
- 异常自动重启
- 最大重启次数限制
- 最小运行时间保证
- 定时重启（避免内存泄漏）

## 部署流程

### 开发部署
1. 拉取代码
2. 安装依赖：`pnpm install`
3. 启动开发环境：`pnpm run pm2:dev`

### 生产部署
1. 拉取代码
2. 安装依赖：`pnpm install`
3. 构建项目：`pnpm run build`
4. 启动生产环境：`pnpm run pm2:prod`

### 更新部署
```bash
# 停止当前服务
pnpm run pm2:stop

# 拉取新代码
git pull

# 安装新依赖
pnpm install

# 重新构建和启动
pnpm run pm2:prod
```

## 故障排查

### 常见问题

1. **端口占用**
   ```bash
   # 查看端口占用
   lsof -i :3000
   lsof -i :3001
   ```

2. **PM2 进程异常**
   ```bash
   # 查看进程状态
   pnpm run pm2:status
   
   # 查看错误日志
   tail -f logs/pm2-error.log
   ```

3. **内存泄漏**
   ```bash
   # 实时监控内存使用
   pnpm run pm2:monit
   ```

4. **TypeScript 编译错误**
   ```bash
   # 检查编译错误
   pnpm run build
   ```

### 调试技巧
- 使用 `pnpm run pm2:logs` 查看实时日志
- 使用 `pnpm run pm2:monit` 监控资源使用
- 开发环境使用文件监听，代码变更自动重启
- 生产环境关闭文件监听，提高性能

## 安全考虑

1. **环境变量**: 敏感信息通过环境变量传递
2. **日志安全**: 避免在日志中输出敏感信息
3. **进程隔离**: 使用 PM2 进程隔离
4. **资源限制**: 设置内存和CPU限制

## 扩展性

1. **水平扩展**: 通过增加 instances 数量
2. **负载均衡**: PM2 内置负载均衡
3. **多服务器**: 可配置多个生态系统文件
4. **微服务**: 每个服务独立的 PM2 配置

---

*文档更新时间: 2025年10月13日*