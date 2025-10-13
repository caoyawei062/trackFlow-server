# PM2 使用指南

## PM2 配置说明

项目配置了两种运行模式：

### 开发模式 (trackflow-dev)
- 使用 `ts-node` 直接运行 TypeScript
- 端口：3001
- 单实例
- 文件监听自动重启
- 内存限制：200M

### 生产模式 (trackflow-prod)
- 运行编译后的 JavaScript
- 端口：3000
- 集群模式（使用所有 CPU 核心）
- 内存限制：500M
- 每天凌晨 3 点自动重启

## 可用命令

### 基本命令
```bash
# 开发模式
pnpm run pm2:dev

# 生产模式（自动构建）
pnpm run pm2:prod

# 停止所有进程
pnpm run pm2:stop

# 重启所有进程
pnpm run pm2:restart

# 删除所有进程
pnpm run pm2:delete
```

### 监控命令
```bash
# 查看状态
pnpm run pm2:status

# 查看日志
pnpm run pm2:logs

# 实时监控
pnpm run pm2:monit
```

### 高级命令
```bash
# 查看特定应用日志
npx pm2 logs trackflow-dev
npx pm2 logs trackflow-prod

# 重启特定应用
npx pm2 restart trackflow-dev
npx pm2 restart trackflow-prod

# 停止特定应用
npx pm2 stop trackflow-dev
npx pm2 stop trackflow-prod

# 删除特定应用
npx pm2 delete trackflow-dev
npx pm2 delete trackflow-prod
```

## 日志文件位置

日志文件存储在 `logs/` 目录下：

- `pm2-dev-*.log` - 开发模式日志
- `pm2-error.log` - 生产模式错误日志
- `pm2-out.log` - 生产模式输出日志
- `pm2-combined.log` - 生产模式综合日志

## 配置文件

- `ecosystem.config.js` - PM2 主配置文件
- `src/config/pm2.config.ts` - 旧版配置文件（已更新到根目录）

## 端口说明

- 开发模式：http://localhost:3001
- 生产模式：http://localhost:3000

## 注意事项

1. 生产模式会自动构建项目
2. 开发模式支持文件监听和热重载
3. 所有日志都包含时间戳
4. 内存超限会自动重启
5. 进程异常退出会自动重启