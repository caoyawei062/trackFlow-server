import {Context,Next} from 'koa'
import log4js from 'log4js'
import { getClientIpAddress } from '../utils/Log'

log4js.configure({
  pm2: true,
  appenders: {
    everything: {
      type: 'dateFile',
      filename: __dirname + '/all-the-logs.log',
      maxLogSize: '10M',
      backups: 20
    }
  },
  categories: {
    default: { appenders: ['everything'], level: 'debug' }
  }
})
export const logger = log4js.getLogger()
export const loggerMiddleware = async (ctx: Context, next: Next) => {
  // 请求开始时间
  const start = new Date()
  await next()
  // 结束时间
  const ms = Number(new Date()) - Number(start)
  // 打印出请求相关参数
  const requestBody = (ctx.request as any).body;
  console.log('Request body:', requestBody);
  console.log('Request method:', ctx.method);
  
  const remoteAddress = getClientIpAddress(ctx)
  let logText = `${ctx.method} ${ctx.status} ${ctx.url} 请求参数： ${JSON.stringify(
    requestBody || {}
  )} 响应参数： ${JSON.stringify(ctx.body)} - ${remoteAddress} - ${ms}ms`
  logger.info(logText)

}
