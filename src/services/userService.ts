import { prisma } from ".";
/**
 * 获取所有用户
 */
export const getUsers = async () => {
  return await prisma.user.findMany();
}








