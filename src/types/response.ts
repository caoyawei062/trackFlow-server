// API 响应相关的类型定义

/**
 * 标准 API 响应接口
 * @template T - 响应数据类型
 */
export interface ApiResponse<T = any> {
  /** 响应状态码：0表示成功，其他表示错误 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: T;
}

/**
 * 成功响应接口
 * @template T - 响应数据类型
 */
export interface SuccessResponse<T = any> extends ApiResponse<T> {
  code: 0;
  message: string;
  data: T;
}

/**
 * 错误响应接口
 */
export interface ErrorResponse extends ApiResponse<null> {
  code: number; // 非0错误码
  message: string;
  data: null;
}

/**
 * 分页响应数据接口
 * @template T - 列表项类型
 */
export interface PaginationData<T = any> {
  /** 数据列表 */
  list: T[];
  /** 总记录数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页大小 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 分页响应接口
 * @template T - 列表项类型
 */
export interface PaginationResponse<T = any> extends SuccessResponse<PaginationData<T>> {
  data: PaginationData<T>;
}

/**
 * 常用的响应状态码
 */
export enum ResponseCode {
  /** 成功 */
  SUCCESS = 0,
  /** 参数错误 */
  INVALID_PARAMS = 400,
  /** 未授权 */
  UNAUTHORIZED = 401,
  /** 禁止访问 */
  FORBIDDEN = 403,
  /** 资源不存在 */
  NOT_FOUND = 404,
  /** 服务器内部错误 */
  INTERNAL_ERROR = 500,
  /** 数据库错误 */
  DATABASE_ERROR = 501,
  /** 业务逻辑错误 */
  BUSINESS_ERROR = 502,
}

/**
 * 响应消息常量
 */
export const ResponseMessage = {
  SUCCESS: 'success',
  INVALID_PARAMS: '参数错误',
  UNAUTHORIZED: '未授权访问',
  FORBIDDEN: '禁止访问',
  NOT_FOUND: '资源不存在',
  INTERNAL_ERROR: '服务器内部错误',
  DATABASE_ERROR: '数据库操作失败',
  BUSINESS_ERROR: '业务处理失败',
} as const;