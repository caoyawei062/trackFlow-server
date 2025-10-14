import { prisma } from ".";
import bcrytjs from "bcryptjs";
/**
 * 校验密码
 * @param password 明文密码
 * @param hashedPassword 加盐后的密码 
 * @returns 是否匹配
 */
function validatePassword(password: string, hashedPassword: string): boolean {
  return bcrytjs.compareSync(password, hashedPassword);
}
/**
 * 加盐处理密码
 * @param password 明文密码
 * @return 返回加盐后的密码
 */
function hashPassword(password: string): string {
  const salt = bcrytjs.genSaltSync(10);
  return bcrytjs.hashSync(password, salt);
}


/**
 * 获取所有用户
 */
export const getUsers = async () => {
  return await prisma.user.findMany();
}

/**
 * 注册用户
 * @param email 注册邮箱
 * @param password 密码
 */
export const register = async (email: string, password: string) => {
  // 检查邮箱是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  if (existingUser) {
    throw new Error("Email already exists");
  }
}






