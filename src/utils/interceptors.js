/**
 * HTTP请求和响应拦截器
 * 提供请求预处理和响应后处理功能
 */

import { TokenManager } from './token-manager.js'
import { ErrorHandler } from './error-handler.js'
import { loadingManager } from './loading-manager.js'
import { API_CONFIG } from '@/config/api-config.js'

/**
 * 请求拦截器集合
 */
export class RequestInterceptors {
  /**
   * 认证拦截器 - 自动添加认证头
   * @param {string} url 请求URL
   * @param {Object} options 请求选项
   * @returns {Object} 处理后的请求参数
   */
  static authInterceptor(url, options) {
    const token = TokenManager.getToken()
    
    if (token && !TokenManager.isTokenExpired()) {
      options.headers = {
        ...options.headers,
        'Authorization': `${API_CONFIG.auth.tokenPrefix}${token}`
      }
    }
    
    return { url, options }
  }

  /**
   * 加载状态拦截器 - 管理加载状态
   * @param {string} url 请求URL
   * @param {Object} options 请求选项
   * @returns {Object} 处理后的请求参数
   */
  static loadingInterceptor(url, options) {
    // 检查是否需要显示全局加载
    const showGlobalLoading = options.showGlobalLoading !== false
    const localLoadingKey = options.localLoadingKey

    if (showGlobalLoading) {
      loadingManager.startGlobalLoading(url)
    }

    if (localLoadingKey) {
      loadingManager.startLocalLoading(localLoadingKey)
    }

    // 在options中保存加载配置，供响应拦截器使用
    options._loadingConfig = {
      showGlobalLoading,
      localLoadingKey,
      url
    }

    return { url, options }
  }

  /**
   * 请求ID拦截器 - 为每个请求添加唯一ID
   * @param {string} url 请求URL
   * @param {Object} options 请求选项
   * @returns {Object} 处理后的请求参数
   */
  static requestIdInterceptor(url, options) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    
    options.headers = {
      ...options.headers,
      'X-Request-ID': requestId
    }

    options._requestId = requestId
    return { url, options }
  }

  /**
   * 内容类型拦截器 - 自动设置Content-Type
   * @param {string} url 请求URL
   * @param {Object} options 请求选项
   * @returns {Object} 处理后的请求参数
   */
  static contentTypeInterceptor(url, options) {
    // 如果是FormData，不设置Content-Type，让浏览器自动设置
    if (options.body instanceof FormData) {
      return { url, options }
    }

    // 如果没有设置Content-Type且有body，设置为JSON
    if (options.body && !options.headers['Content-Type']) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json'
      }
    }

    return { url, options }
  }

  /**
   * 缓存拦截器 - 处理请求缓存
   * @param {string} url 请求URL
   * @param {Object} options 请求选项
   * @returns {Object} 处理后的请求参数
   */
  static cacheInterceptor(url, options) {
    // 对于GET请求，可以添加缓存控制
    if (options.method === 'GET') {
      const cacheControl = options.cache || 'default'
      options.cache = cacheControl
    }

    return { url, options }
  }

  /**
   * 令牌刷新拦截器 - 自动刷新即将过期的令牌
   * @param {string} url 请求URL
   * @param {Object} options 请求选项
   * @returns {Promise<Object>} 处理后的请求参数
   */
  static async tokenRefreshInterceptor(url, options) {
    // 跳过认证相关的请求
    if (url.includes('/auth/')) {
      return { url, options }
    }

    const token = TokenManager.getToken()
    if (token && TokenManager.isTokenExpired(10 * 60 * 1000)) { // 10分钟缓冲时间
      try {
        const refreshSuccess = await TokenManager.refreshToken()
        if (refreshSuccess) {
          // 使用新令牌更新请求头
          const newToken = TokenManager.getToken()
          options.headers = {
            ...options.headers,
            'Authorization': `${API_CONFIG.auth.tokenPrefix}${newToken}`
          }
        }
      } catch (error) {
        console.warn('令牌刷新失败:', error)
      }
    }

    return { url, options }
  }
}

/**
 * 响应拦截器集合
 */
export class ResponseInterceptors {
  /**
   * 加载状态拦截器 - 结束加载状态
   * @param {Response} response fetch响应对象
   * @param {Object} originalOptions 原始请求选项
   * @returns {Response} 响应对象
   */
  static loadingInterceptor(response, originalOptions) {
    const loadingConfig = originalOptions._loadingConfig

    if (loadingConfig) {
      if (loadingConfig.showGlobalLoading) {
        loadingManager.endGlobalLoading(loadingConfig.url)
      }

      if (loadingConfig.localLoadingKey) {
        loadingManager.endLocalLoading(loadingConfig.localLoadingKey)
      }
    }

    return response
  }

  /**
   * 状态检查拦截器 - 检查HTTP状态码
   * @param {Response} response fetch响应对象
   * @returns {Promise<Response>} 响应对象
   */
  static async statusCheckInterceptor(response) {
    if (!response.ok) {
      // 创建错误对象
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
      error.status = response.status
      error.response = response

      // 尝试解析错误响应体
      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          error.data = await response.clone().json()
        } else {
          error.data = await response.clone().text()
        }
      } catch (parseError) {
        console.warn('解析错误响应失败:', parseError)
      }

      throw error
    }

    return response
  }

  /**
   * 响应格式拦截器 - 统一处理响应格式
   * @param {Response} response fetch响应对象
   * @returns {Promise<any>} 解析后的响应数据
   */
  static async responseFormatInterceptor(response) {
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      
      // 检查是否是统一的Result格式
      if (data && typeof data === 'object' && 'code' in data) {
        // 处理业务错误码
        if (data.code !== 200) {
          const error = new Error(data.message || '业务处理失败')
          error.code = data.code
          error.data = data
          throw error
        }
        
        // 返回实际数据
        return data.data !== undefined ? data.data : data
      }
      
      return data
    } else {
      return await response.text()
    }
  }

  /**
   * 日志拦截器 - 记录响应日志
   * @param {Response} response fetch响应对象
   * @param {Object} originalOptions 原始请求选项
   * @returns {Response} 响应对象
   */
  static logInterceptor(response, originalOptions) {
    if (import.meta.env.DEV) {
      const requestId = originalOptions._requestId
      console.log(`📡 Response [${requestId}]:`, {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      })
    }

    return response
  }

  /**
   * 缓存拦截器 - 处理响应缓存
   * @param {Response} response fetch响应对象
   * @returns {Response} 响应对象
   */
  static cacheInterceptor(response) {
    // 这里可以实现响应缓存逻辑
    // 例如将GET请求的响应缓存到localStorage或内存中
    
    return response
  }

  /**
   * 错误处理拦截器 - 统一错误处理
   * @param {Error} error 错误对象
   * @param {Object} originalOptions 原始请求选项
   */
  static errorInterceptor(error, originalOptions) {
    // 结束加载状态
    const loadingConfig = originalOptions._loadingConfig
    if (loadingConfig) {
      if (loadingConfig.showGlobalLoading) {
        loadingManager.endGlobalLoading(loadingConfig.url)
      }
      if (loadingConfig.localLoadingKey) {
        loadingManager.endLocalLoading(loadingConfig.localLoadingKey)
      }
    }

    // 使用错误处理器处理错误（不进行全局错误提示）
    ErrorHandler.handleError(error, {
      showNotification: false
    })

    throw error
  }
}

/**
 * 默认拦截器配置
 */
export const defaultInterceptors = {
  request: [
    RequestInterceptors.requestIdInterceptor,
    RequestInterceptors.contentTypeInterceptor,
    RequestInterceptors.cacheInterceptor,
    RequestInterceptors.tokenRefreshInterceptor,
    RequestInterceptors.authInterceptor,
    RequestInterceptors.loadingInterceptor
  ],
  response: [
    ResponseInterceptors.loadingInterceptor,
    ResponseInterceptors.logInterceptor,
    ResponseInterceptors.statusCheckInterceptor,
    ResponseInterceptors.responseFormatInterceptor,
    ResponseInterceptors.cacheInterceptor
  ],
  error: [
    ResponseInterceptors.errorInterceptor
  ]
}
