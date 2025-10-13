import { PrismaClient } from "../generated/prisma";

// 导入并重新导出各个服务
export * as UserService from "./userService"; 



// 创建并导出 唯一的Prisma 客户端实例
const prisma = new PrismaClient();
export { prisma };