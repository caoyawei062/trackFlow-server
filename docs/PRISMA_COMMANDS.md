PRISMA 持续开发命令说明

本文档用中文汇总在日常开发与 CI 中常用的 Prisma 命令、示例、注意事项与常见问题排查步骤。基于本仓库的约定：Prisma schema 位于 `prisma/schema.prisma`，generator 输出目录已设置为 `../src/generated/prisma`（见 `prisma/schema.prisma`）。

目录
- 概览
- 本地开发常用命令（pnpm / npm / npx 示例）
- 迁移策略：本地开发 vs CI/生产
- 常用操作示例（Studio、Introspect、Seed）
- Docker / 容器化场景建议
- 常见问题与排查
- 快速命令清单
- 参考链接

概览
- schema：`prisma/schema.prisma`
- client 输出：在 schema 中配置 generator 时使用的 `output`（本仓库为 `../src/generated/prisma`）。每次改动 schema 或 generator 配置后，请运行 `prisma generate` 以更新生成的客户端。
- 包管理器：本仓库使用 pnpm（见 `package.json` 中的 `packageManager`），但也给出 npm / npx 的等价命令。

本地开发常用命令
（建议在项目根目录运行）

1) 安装依赖
- pnpm: pnpm install
- npm: npm install

2) 生成 Prisma Client
- pnpm: pnpm exec prisma generate --schema=prisma/schema.prisma
- npx: npx prisma generate --schema=prisma/schema.prisma
说明：当修改 `schema.prisma` 或 generator 输出设置后必须运行此命令。

3) 启动 Prisma Studio（Web UI，查看/编辑数据）
- pnpm: pnpm exec prisma studio --schema=prisma/schema.prisma
- npx: npx prisma studio --schema=prisma/schema.prisma

4) 开发用迁移（在本地创建并应用迁移）
- pnpm: pnpm exec prisma migrate dev --name <desc> --schema=prisma/schema.prisma
- 示例：pnpm exec prisma migrate dev --name init --schema=prisma/schema.prisma
说明：该命令会
  - 创建 migration 文件夹（prisma/migrations）
  - 尝试将迁移应用到数据库
  - 在本地环境下生成/更新 Prisma Client（等同于在流程结束时自动运行 generate）

5) 将本地 schema 直接推送到数据库（快速原型/非迁移 flow）
- pnpm exec prisma db push --schema=prisma/schema.prisma
说明：不会生成迁移文件，仅同步 schema 到数据库。生产环境慎用，适合快速开发或测试环境。

6) 从现有数据库生成 schema（反向工程）
- pnpm exec prisma db pull --schema=prisma/schema.prisma
说明：用于把已有数据库结构载入到 `schema.prisma`。

7) 重置数据库（本地调试）
- pnpm exec prisma migrate reset --force --schema=prisma/schema.prisma
说明：删除数据并重新应用 migrations。谨慎使用 — 会丢弃数据。

8) 校验与格式化
- 校验 schema：pnpm exec prisma validate --schema=prisma/schema.prisma
- 格式化 schema：pnpm exec prisma format --schema=prisma/schema.prisma

迁移策略：本地开发 vs CI/生产

本地（开发者机器）
- 推荐使用 `prisma migrate dev` 进行增量迁移与验证。
- 在迁移完成后，commit 生成的迁移文件（位于 `prisma/migrations`）到仓库，以便 CI/生产复现。

CI / 生产
- CI/生产 不应运行 `migrate dev`（因为它交互并用于本地开发）。在 CI/生产 使用：
  1. 环境中设置好 `DATABASE_URL`（通常为 secret）
  2. 执行：pnpm exec prisma migrate deploy --schema=prisma/schema.prisma
  3. 生成客户端：pnpm exec prisma generate --schema=prisma/schema.prisma
  4. 构建并启动应用（例如 `pnpm run build && pnpm run start`）

示例 GitHub Actions 片段（简化）
- 目的：在部署流程中应用迁移并生成客户端

```yaml
# 仅示例，需根据真实 CI 环境调整
- name: Install
  run: pnpm install --frozen-lockfile

- name: Apply Prisma migrations
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: pnpm exec prisma migrate deploy --schema=prisma/schema.prisma

- name: Generate Prisma client
  run: pnpm exec prisma generate --schema=prisma/schema.prisma

- name: Build
  run: pnpm run build
```

Docker / 容器化场景建议
- 在容器启动时自动应用迁移需要谨慎，建议在部署 job（CI）或独立的 init job 中运行 `prisma migrate deploy`，而不是在每个应用容器入口点运行。
- 如果确实需要在容器中执行迁移，确保使用有序启动（leader election）或仅在 init 容器/sidecar 中运行：
  ENTRYPOINT 示例（仅作参考）
  - 在 entrypoint 脚本中先运行：pnpm exec prisma migrate deploy --schema=prisma/schema.prisma
  - 若失败，脚本应能重试并且在严重错误时终止应用进程，避免不一致启动。

种子数据（seed）示例
- 推荐将种子脚本放在 `prisma/seed.ts` 或 `prisma/seed.js`，并在 package.json 中添加脚本：

  "prisma:seed": "pnpm exec ts-node prisma/seed.ts"

- 运行：pnpm run prisma:seed

- 注意：Prisma 也允许在 `package.json` 的 `prisma` 字段中声明 `seed`（参考 Prisma 文档），但简单脚本方式更通用。

常见问题与排查

1) Prisma Client 运行时报错："Please run prisma generate"
- 原因：生成的客户端与 schema 不匹配或没有生成。
- 解决：运行 `pnpm exec prisma generate --schema=prisma/schema.prisma`，并重新构建应用。

2) 查询时报错有关 query engine / binary target
- 说明：在某些平台（例如 CI 的 x64 vs 本地 M1/M2 ARM）会出现二进制不兼容。解决办法：
  - 在 schema 的 generator 中设置 `binaryTargets` 或在生成时指定 `PRISMA_CLI_QUERY_ENGINE_TYPE` 等（参考 Prisma 文档）。
  - 常用做法是在 CI 中重新运行 `prisma generate`（CI 会在目标平台生成合适的 engine）。

3) 迁移无法应用 / 冲突
- 说明：如果迁移文件与数据库当前状态冲突（例如手动改过 DB），可能需要：
  - 备份数据库
  - 使用 `prisma migrate resolve` 标记某个 migration 为已应用
  - 或在安全环境下使用 `prisma migrate reset`（会清空数据）

4) 想把现有数据库导入到 schema（反向工程）
- 使用：pnpm exec prisma db pull --schema=prisma/schema.prisma
- 然后检查 `schema.prisma` 并适当微调字段/模型。

备份与风险
- 在运行 `migrate deploy` 或 `migrate reset` 之前，请始终备份生产数据库。
- 不要在生产环境运行 `db push`（会跳过迁移历史），避免 schema 与 migration 历史不同步导致不可逆问题。

快速命令清单（摘录）
- pnpm install
- pnpm exec prisma generate --schema=prisma/schema.prisma
- pnpm exec prisma studio --schema=prisma/schema.prisma
- pnpm exec prisma migrate dev --name <desc> --schema=prisma/schema.prisma
- pnpm exec prisma migrate deploy --schema=prisma/schema.prisma
- pnpm exec prisma db push --schema=prisma/schema.prisma
- pnpm exec prisma db pull --schema=prisma/schema.prisma
- pnpm exec prisma migrate reset --force --schema=prisma/schema.prisma
- pnpm exec prisma validate --schema=prisma/schema.prisma
- pnpm exec prisma format --schema=prisma/schema.prisma

参考链接（官方）
- Prisma 文档（英文）：https://www.prisma.io/docs

附：对本仓库的特别说明
- schema 路径：`prisma/schema.prisma`
- generator 输出目录：见 schema 中的 `output = "../src/generated/prisma"` — 确保 TypeScript 编译与运行时可访问该目录（构建／部署时要包含或重新生成）。
- package.json 中已安装 `prisma` 与 `@prisma/client`（版本：6.17.1），使用 `pnpm exec prisma` 可以调用本地依赖的 prisma CLI。

如果你希望，我可以：
- 1) 在 `package.json` 中添加示例脚本（例如 `prisma:generate`, `prisma:migrate:dev`, `prisma:migrate:deploy`, `prisma:seed`）并提交为 PR；
- 2) 创建 `prisma/seed.ts` 的示例文件；
- 3) 或生成 CI（GitHub Actions）完整工作流模板供团队直接复用。

---
文件生成于本仓库，供开发/部署参考。若需把某些命令加入项目脚本中或自动化到 CI，请告诉我你偏好的 CI 平台或需要的脚本细节。


## 扩展完字段
```bash
npx prisma migrate dev --name add-post-and-age
npx prisma push db # 跳过生成迁移文件
```
## 生成client 会自动执行 migrate 和push 都会执行
```bash
npx prisma generate
```
