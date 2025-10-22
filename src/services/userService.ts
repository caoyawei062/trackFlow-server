import { prisma } from '.'
import bcrytjs from 'bcryptjs'
import { createToken } from '../middleware/auth'
/**
 * 校验密码
 * @param password 明文密码
 * @param hashedPassword 加盐后的密码
 * @returns 是否匹配
 */
function validatePassword(password: string, hashedPassword: string): boolean {
  return bcrytjs.compareSync(password, hashedPassword)
}
/**
 * 加盐处理密码
 * @param password 明文密码
 * @return 返回加盐后的密码
 */
function hashPassword(password: string): string {
  const salt = bcrytjs.genSaltSync(10)
  return bcrytjs.hashSync(password, salt)
}


/**
 * 获取所有用户
 */
export const getUsers = async () => {
  return prisma.user.findMany()
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
  })
  if (existingUser) {
    return { success: false, message: '邮箱已被注册' }
  }
  // 创建新用户
  const hashedPassword = hashPassword(password)
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword
    }
  })

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name || '',
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt
  }
}

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email }
  })
  if (!user) {
    return { success: false, message: '用户不存在' }
  }
  const isPasswordValid = validatePassword(password, user.password)
  if (!isPasswordValid) {
    return { success: false, message: '密码错误' }
  }
  return {
    success: true,
    message: '登录成功',
    token: createToken({ id: user.id, email: user.email })
  }
}

export const getUserInfo = async (userId?: number, email?: string) => {
  if (!userId && !email) {
    return { success: false, message: '缺少用户信息' }
  }
  const user = await prisma.user.findUnique({
    where: userId ? { id: userId } : { email: email! },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true
    }
  })
  return {
    success: true,
    userInfo: user
  }
}
