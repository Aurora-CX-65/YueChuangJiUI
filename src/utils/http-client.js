/**
 * HTTP客户端类
 * 基于fetch API实现的HTTP请求客户端，支持请求拦截器、响应拦截器和统一错误处理
 */

import { API_CONFIG } from '@/config/api-config.js'
import { TokenManager } from './token-manager.js'
import { ErrorHandler } from './error-handler.js'
import { defaultInterceptors } from './interceptors.js'

class HttpClient {
  constructor(baseURL = API_CONFIG.baseURL) {
    this.baseURL = baseURL
    this.timeout = API_CONFIG.timeout
    this.defaultHeaders = { ...API_CONFIG.headers }
    
    // 请求拦截器列表
    this.requestInterceptors = [...defaultInterceptors.request]
    // 响应拦截器列表
    this.responseInterceptors = [...defaultInterceptors.response]
    // 错误拦截器列表
    this.errorInterceptors = [...defaultInterceptors.error]
  }

  /**
   * 添加请求拦截器
   * @param {Function} interceptor 拦截器函数
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * 添加响应拦截器
   * @param {Function} interceptor 拦截器函数
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * 添加错误拦截器
   * @param {Function} interceptor 拦截器函数
   */
  addErrorInterceptor(interceptor) {
    this.errorInterceptors.push(interceptor)
  }



  /**
   * 执行请求拦截器
   * @param {string} url 请求URL
   * @param {Object} options 请求选项
   * @returns {Object} 处理后的请求参数
   */
  async executeRequestInterceptors(url, options) {
    let result = { url, options }
    
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result.url, result.options)
    }
    
    return result
  }

  /**
   * 执行响应拦截器
   * @param {Response} response fetch响应对象
   * @param {Object} originalOptions 原始请求选项
   * @returns {Response} 处理后的响应
   */
  async executeResponseInterceptors(response, originalOptions) {
    let result = response
    
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result, originalOptions)
    }
    
    return result
  }

  /**
   * 执行错误拦截器
   * @param {Error} error 错误对象
   * @param {Object} originalOptions 原始请求选项
   */
  async executeErrorInterceptors(error, originalOptions) {
    for (const interceptor of this.errorInterceptors) {
      await interceptor(error, originalOptions)
    }
  }

  /**
   * 构建完整的请求URL
   * @param {string} url 相对或绝对URL
   * @returns {string} 完整的URL
   */
  buildUrl(url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    const baseUrl = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL
    const path = url.startsWith('/') ? url : `/${url}`
    
    return `${baseUrl}${path}`
  }

  /**
   * 创建带超时的fetch请求
   * @param {string} url 请求URL
   * @param {Object} options fetch选项
   * @returns {Promise} fetch Promise
   */
  createTimeoutFetch(url, options) {
    // 默认超时时间
    let timeout = this.timeout
    
    // 针对AI接口延长超时时间（例如延长到120秒）
    if (url.includes('/api/ai/')) {
      timeout = 120000 
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`请求超时: ${timeout}ms`))
      }, timeout)

      fetch(url, options)
        .then(response => {
          clearTimeout(timeoutId)
          resolve(response)
        })
        .catch(error => {
          clearTimeout(timeoutId)
          reject(error)
        })
    })
  }

  /**
   * 核心请求方法
   * @param {string} url 请求URL
   * @param {Object} options 请求选项
   * @returns {Promise} 响应数据
   */
  async request(url, options = {}) {
    const originalOptions = { ...options }
    
    try {
      // 合并默认选项
      const isFormData = options && options.body instanceof FormData
      const baseHeaders = { ...this.defaultHeaders }
      if (isFormData) {
        delete baseHeaders['Content-Type']
      }
      const mergedOptions = {
        headers: { ...baseHeaders },
        ...options
      }

      // 执行请求拦截器
      const { url: interceptedUrl, options: interceptedOptions } = 
        await this.executeRequestInterceptors(url, mergedOptions)

      // 构建完整URL
      const fullUrl = this.buildUrl(interceptedUrl)

      // 发送请求
      let response = await this.createTimeoutFetch(fullUrl, interceptedOptions)

      // 执行响应拦截器（包含数据解析）
      const data = await this.executeResponseInterceptors(response, interceptedOptions)

      return data
    } catch (error) {
      // 执行错误拦截器
      await this.executeErrorInterceptors(error, originalOptions)
      throw error
    }
  }

  /**
   * GET请求
   * @param {string} url 请求URL
   * @param {Object} params 查询参数
   * @param {Object} options 额外选项
   * @returns {Promise} 响应数据
   */
  async get(url, params = {}, options = {}) {
    // 构建查询字符串
    const queryString = new URLSearchParams(params).toString()
    const fullUrl = queryString ? `${url}?${queryString}` : url

    return this.request(fullUrl, {
      method: 'GET',
      ...options
    })
  }

  /**
   * POST请求
   * @param {string} url 请求URL
   * @param {Object} data 请求数据
   * @param {Object} options 额外选项
   * @returns {Promise} 响应数据
   */
  async post(url, data = {}, options = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    })
  }

  /**
   * PUT请求
   * @param {string} url 请求URL
   * @param {Object} data 请求数据
   * @param {Object} options 额外选项 (如 { params: {} })
   * @returns {Promise} 响应数据
   */
  async put(url, data = {}, options = {}) {
    const originalOptions = { ...options }
    let requestUrl = url

    // 如果有查询参数，拼接到URL
    if (originalOptions.params) {
      const queryString = new URLSearchParams(originalOptions.params).toString()
      if (queryString) {
        requestUrl = `${url}?${queryString}`
      }
      delete originalOptions.params
    }

    return this.request(requestUrl, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined, // data 为 null 时不传 body
      ...originalOptions
    })
  }

  /**
   * DELETE请求
   * @param {string} url 请求URL
   * @param {Object} options 额外选项
   * @returns {Promise} 响应数据
   */
  async delete(url, options = {}) {
    return this.request(url, {
      method: 'DELETE',
      ...options
    })
  }

  /**
   * PATCH请求
   * @param {string} url 请求URL
   * @param {Object} data 请求数据
   * @param {Object} options 额外选项
   * @returns {Promise} 响应数据
   */
  async patch(url, data = {}, options = {}) {
    return this.request(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options
    })
  }

  /**
   * 文件上传请求
   * @param {string} url 请求URL
   * @param {FormData} formData 表单数据
   * @param {Object} options 额外选项
   * @returns {Promise} 响应数据
   */
  async upload(url, formData, options = {}) {
    // 文件上传不设置Content-Type，让浏览器自动设置 (fetch API 会自动处理 multipart/form-data boundary)
    const uploadOptions = { ...options }
    
    // 如果 options 中有 headers，复制一份并删除 Content-Type
    // 确保 this.defaultHeaders 中的 Content-Type 也被覆盖/移除
    // 在 fetch 中，如果 body 是 FormData，浏览器会自动设置 Content-Type: multipart/form-data; boundary=...
    // 如果我们手动设置了 Content-Type，会覆盖浏览器的行为，导致 boundary 丢失，从而报错 "no multipart boundary was found"
    
    const headers = { ...this.defaultHeaders, ...uploadOptions.headers }
    delete headers['Content-Type']
    
    return this.request(url, {
      method: 'POST',
      body: formData,
      headers: headers,
      ...uploadOptions
    })
  }
}

// 创建默认的HTTP客户端实例
export const httpClient = new HttpClient()

// 导出类供其他地方使用
export { HttpClient }
