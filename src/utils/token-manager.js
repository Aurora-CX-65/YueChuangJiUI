/**
 * JWT令牌管理器
 * 负责JWT令牌的存储、获取、验证和刷新
 */

import { API_CONFIG } from '@/config/api-config.js'

class TokenManager {
  /**
   * 获取访问令牌
   * @returns {string|null} 访问令牌
   */
  static getToken() {
    try {
      return localStorage.getItem(API_CONFIG.auth.tokenKey)
    } catch (error) {
      console.error('获取令牌失败:', error)
      return null
    }
  }

  /**
   * 设置访问令牌
   * @param {string} token 访问令牌
   */
  static setToken(token) {
    try {
      if (token) {
        localStorage.setItem(API_CONFIG.auth.tokenKey, token)
      }
    } catch (error) {
      console.error('设置令牌失败:', error)
    }
  }

  /**
   * 获取刷新令牌
   * @returns {string|null} 刷新令牌
   */
  static getRefreshToken() {
    try {
      return localStorage.getItem(API_CONFIG.auth.refreshTokenKey)
    } catch (error) {
      console.error('获取刷新令牌失败:', error)
      return null
    }
  }

  /**
   * 设置刷新令牌
   * @param {string} refreshToken 刷新令牌
   */
  static setRefreshToken(refreshToken) {
    try {
      if (refreshToken) {
        localStorage.setItem(API_CONFIG.auth.refreshTokenKey, refreshToken)
      }
    } catch (error) {
      console.error('设置刷新令牌失败:', error)
    }
  }

  /**
   * 删除所有令牌
   */
  static removeToken() {
    try {
      localStorage.removeItem(API_CONFIG.auth.tokenKey)
      localStorage.removeItem(API_CONFIG.auth.refreshTokenKey)
      // 同时清除令牌过期时间
      localStorage.removeItem('token_expires_at')
    } catch (error) {
      console.error('删除令牌失败:', error)
    }
  }

  /**
   * 删除刷新令牌（兼容旧调用）
   */
  static removeRefreshToken() {
    try {
      localStorage.removeItem(API_CONFIG.auth.refreshTokenKey)
    } catch (error) {
      console.error('删除刷新令牌失败:', error)
    }
  }

  /**
   * 设置令牌过期时间
   * @param {number} expiresIn 过期时间（秒）
   */
  static setTokenExpiration(expiresIn) {
    try {
      const expiresAt = Date.now() + (expiresIn * 1000)
      localStorage.setItem('token_expires_at', expiresAt.toString())
    } catch (error) {
      console.error('设置令牌过期时间失败:', error)
    }
  }

  /**
   * 获取令牌过期时间
   * @returns {number|null} 过期时间戳
   */
  static getTokenExpiration() {
    try {
      const expiresAt = localStorage.getItem('token_expires_at')
      return expiresAt ? parseInt(expiresAt) : null
    } catch (error) {
      console.error('获取令牌过期时间失败:', error)
      return null
    }
  }

  /**
   * 检查令牌是否过期
   * @param {number} bufferTime 缓冲时间（毫秒），默认5分钟
   * @returns {boolean} 是否过期
   */
  static isTokenExpired(bufferTime = 5 * 60 * 1000) {
    const token = this.getToken()
    if (!token) {
      return true
    }

    const expiresAt = this.getTokenExpiration()
    if (!expiresAt) {
      // 如果没有过期时间信息，尝试解析JWT令牌
      return this.isJwtTokenExpired(token, bufferTime)
    }

    // 检查是否在缓冲时间内过期
    return Date.now() >= (expiresAt - bufferTime)
  }

  /**
   * 解析JWT令牌并检查是否过期
   * @param {string} token JWT令牌
   * @param {number} bufferTime 缓冲时间（毫秒）
   * @returns {boolean} 是否过期
   */
  static isJwtTokenExpired(token, bufferTime = 5 * 60 * 1000) {
    try {
      // 解析JWT令牌的payload部分
      const payload = this.parseJwtPayload(token)
      if (!payload || !payload.exp) {
        return true
      }

      // JWT的exp字段是秒级时间戳
      const expirationTime = payload.exp * 1000
      return Date.now() >= (expirationTime - bufferTime)
    } catch (error) {
      console.error('解析JWT令牌失败:', error)
      return true
    }
  }

  /**
   * 解析JWT令牌的payload部分
   * @param {string} token JWT令牌
   * @returns {Object|null} 解析后的payload
   */
  static parseJwtPayload(token) {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return null
      }

      // 解码base64url
      const payload = parts[1]
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(decoded)
    } catch (error) {
      console.error('解析JWT payload失败:', error)
      return null
    }
  }

  /**
   * 获取令牌中的用户信息
   * @returns {Object|null} 用户信息
   */
  static getUserFromToken() {
    const token = this.getToken()
    if (!token) {
      return null
    }

    const payload = this.parseJwtPayload(token)
    if (!payload) {
      return null
    }

    // 返回用户相关信息
    return {
      userId: payload.sub || payload.userId,
      username: payload.username,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat
    }
  }

  /**
   * 检查用户是否已认证
   * @returns {boolean} 是否已认证
   */
  static isAuthenticated() {
    return this.getToken() && !this.isTokenExpired()
  }

  /**
   * 刷新访问令牌
   * @returns {Promise<boolean>} 刷新是否成功
   */
  static async refreshToken() {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      return false
    }

    try {
      // 动态导入避免循环依赖
      const { httpClient } = await import('./http-client.js')
      
      const response = await httpClient.post('/api/auth/refresh', {
        refreshToken: refreshToken
      })

      if (response.code === 200 && response.data) {
        const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data
        
        // 更新令牌
        this.setToken(accessToken)
        if (newRefreshToken) {
          this.setRefreshToken(newRefreshToken)
        }
        if (expiresIn) {
          this.setTokenExpiration(expiresIn)
        }

        return true
      }

      return false
    } catch (error) {
      console.error('刷新令牌失败:', error)
      // 刷新失败，清除所有令牌
      this.removeToken()
      return false
    }
  }

  /**
   * 设置完整的认证信息
   * @param {Object} authData 认证数据
   * @param {string} authData.accessToken 访问令牌
   * @param {string} authData.refreshToken 刷新令牌
   * @param {number} authData.expiresIn 过期时间（秒）
   */
  static setAuthData(authData) {
    const { accessToken, refreshToken, expiresIn } = authData

    if (accessToken) {
      this.setToken(accessToken)
    }

    if (refreshToken) {
      this.setRefreshToken(refreshToken)
    }

    if (expiresIn) {
      this.setTokenExpiration(expiresIn)
    }
  }

  /**
   * 获取认证头
   * @returns {Object|null} 认证头对象
   */
  static getAuthHeader() {
    const token = this.getToken()
    if (!token) {
      return null
    }

    return {
      'Authorization': `${API_CONFIG.auth.tokenPrefix}${token}`
    }
  }

  /**
   * 清除所有认证相关数据
   */
  static clearAuth() {
    this.removeToken()
    // 可以在这里添加其他需要清除的认证相关数据
  }
}

export { TokenManager }
