/**
 * 认证服务类
 * 处理用户认证相关的API请求，包括登录、注册、登出、密码重置等
 */

import { httpClient } from '@/utils/http-client.js'

/**
 * 认证服务类
 * 对应后端 /api/auth 接口
 */
export class AuthService {
  
  /**
   * 用户登录
   * @param {Object} loginRequest - 登录请求参数
   * @param {string} loginRequest.username - 用户名或邮箱
   * @param {string} loginRequest.password - 密码
   * @param {boolean} [loginRequest.rememberMe=false] - 记住我
   * @returns {Promise<Object>} 登录响应数据
   */
  static async login(loginRequest) {
    return await httpClient.post('/api/auth/login', loginRequest)
  }

  /**
   * 用户注册
   * @param {Object} registerRequest - 注册请求参数
   * @param {string} registerRequest.username - 用户名
   * @param {string} registerRequest.email - 邮箱
   * @param {string} registerRequest.password - 密码
   * @param {string} registerRequest.confirmPassword - 确认密码
   * @param {string} [registerRequest.nickname] - 昵称
   * @param {string} [registerRequest.phone] - 手机号
   * @param {string} registerRequest.emailCode - 邮箱验证码
   * @returns {Promise<boolean>} 注册结果
   */
  static async register(registerRequest) {
    return await httpClient.post('/api/auth/register', registerRequest)
  }

  /**
   * 用户登出
   * @returns {Promise<boolean>} 登出结果
   */
  static async logout() {
    return await httpClient.post('/api/auth/logout')
  }

  /**
   * 刷新令牌
   * @param {string} refreshToken - 刷新令牌
   * @returns {Promise<Object>} 新的令牌信息
   */
  static async refreshToken(refreshToken) {
    return await httpClient.post('/api/auth/refresh', null, {
      params: { refreshToken }
    })
  }

  /**
   * 发送邮箱验证码
   * @param {Object} sendEmailCodeRequest - 发送验证码请求参数
   * @param {string} sendEmailCodeRequest.email - 邮箱地址
   * @param {string} sendEmailCodeRequest.type - 验证码类型 (register/reset/verify)
   * @returns {Promise<boolean>} 发送结果
   */
  static async sendEmailCode(sendEmailCodeRequest) {
    return await httpClient.post('/api/auth/send-email-code', sendEmailCodeRequest)
  }

  /**
   * 验证邮箱验证码
   * @param {string} email - 邮箱地址
   * @param {string} code - 验证码
   * @param {string} type - 验证码类型
   * @returns {Promise<boolean>} 验证结果
   */
  static async verifyEmailCode(email, code, type) {
    // 构建查询参数
    const params = new URLSearchParams({ email, code, type }).toString()
    return await httpClient.post(`/api/auth/verify-email-code?${params}`)
  }

  /**
   * 重置密码
   * @param {Object} resetPasswordRequest - 重置密码请求参数
   * @param {string} resetPasswordRequest.email - 邮箱
   * @param {string} resetPasswordRequest.code - 验证码
   * @param {string} resetPasswordRequest.newPassword - 新密码
   * @param {string} resetPasswordRequest.confirmPassword - 确认新密码
   * @returns {Promise<boolean>} 重置结果
   */
  static async resetPassword(resetPasswordRequest) {
    return await httpClient.post('/api/auth/reset-password', resetPasswordRequest)
  }

  /**
   * 验证邮箱
   * @param {string} email - 邮箱地址
   * @param {string} code - 验证码
   * @returns {Promise<boolean>} 验证结果
   */
  static async verifyEmail(email, code) {
    // 构建查询参数
    const params = new URLSearchParams({ email, code }).toString()
    return await httpClient.post(`/api/auth/verify-email?${params}`)
  }

  /**
   * 检查用户名是否可用
   * @param {string} username - 用户名
   * @returns {Promise<boolean>} 是否可用
   */
  static async checkUsername(username) {
    return await httpClient.get('/api/auth/check-username', { username })
  }

  /**
   * 检查邮箱是否可用
   * @param {string} email - 邮箱地址
   * @returns {Promise<boolean>} 是否可用
   */
  static async checkEmail(email) {
    return await httpClient.get('/api/auth/check-email', { email })
  }
}