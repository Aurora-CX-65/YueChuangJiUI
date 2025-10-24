/**
 * API配置文件
 * 根据环境变量配置API基础设置
 */

export const API_CONFIG = {
  // 基础URL
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  // 请求超时时间（毫秒）
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  
  // 请求头配置
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // 认证相关配置
  auth: {
    tokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
    tokenPrefix: 'Bearer '
  },
  
  // 错误码映射
  errorCodes: {
    0: '网络连接失败',
    200: '操作成功',
    201: '未授权访问',
    400: '请求参数错误',
    401: '身份验证失败',
    403: '权限不足',
    404: '资源不存在',
    408: '请求超时',
    409: '资源冲突',
    422: '数据验证失败',
    429: '请求频率过高',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时'
  }
}

// 导出环境信息
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  appTitle: import.meta.env.VITE_APP_TITLE || '阅创集',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
}