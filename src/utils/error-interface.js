/**
 * 错误处理统一接口
 * 提供简化的错误处理方法，供应用程序各部分使用
 */

import { ErrorHandler } from './error-handler.js'
import { notificationManager } from './notification-manager.js'

/**
 * 处理API错误的简化接口
 * @param {Error} error 错误对象
 * @param {Object} options 选项
 */
export function handleApiError(error, options = {}) {
  return ErrorHandler.handleError(error, {
    showNotification: true,
    ...options
  })
}

/**
 * 处理业务错误的简化接口
 * @param {string} message 错误消息
 * @param {Object} options 选项
 */
export function handleBusinessError(message, options = {}) {
  const error = new Error(message)
  error.type = 'business'
  
  return ErrorHandler.handleError(error, {
    showNotification: true,
    ...options
  })
}

/**
 * 显示成功消息
 * @param {string} message 消息内容
 * @param {Object} options 选项
 */
export function showSuccess(message, options = {}) {
  notificationManager.success(message, options)
}

/**
 * 显示警告消息
 * @param {string} message 消息内容
 * @param {Object} options 选项
 */
export function showWarning(message, options = {}) {
  notificationManager.warning(message, options)
}

/**
 * 显示信息消息
 * @param {string} message 消息内容
 * @param {Object} options 选项
 */
export function showInfo(message, options = {}) {
  notificationManager.info(message, options)
}

/**
 * 创建带错误处理的异步函数包装器
 * @param {Function} asyncFn 异步函数
 * @param {Object} options 错误处理选项
 * @returns {Function} 包装后的函数
 */
export function withErrorHandling(asyncFn, options = {}) {
  return async function(...args) {
    try {
      const result = await asyncFn.apply(this, args)
      
      // 如果有成功消息，显示它
      if (options.successMessage) {
        showSuccess(options.successMessage)
      }
      
      return result
    } catch (error) {
      // 处理错误
      handleApiError(error, {
        customMessage: options.errorMessage,
        showNotification: options.showNotification !== false
      })
      
      // 根据选项决定是否重新抛出错误
      if (options.rethrow !== false) {
        throw error
      }
      
      return options.fallbackValue
    }
  }
}

/**
 * 创建带重试的异步函数包装器
 * @param {Function} asyncFn 异步函数
 * @param {Object} options 重试选项
 * @returns {Function} 包装后的函数
 */
export function withRetry(asyncFn, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    shouldRetry = (error) => !ErrorHandler.shouldNotRetry(error)
  } = options

  return async function(...args) {
    let lastError
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await asyncFn.apply(this, args)
      } catch (error) {
        lastError = error
        
        // 如果是最后一次尝试，或者不应该重试，直接抛出错误
        if (attempt === maxRetries || !shouldRetry(error)) {
          throw error
        }
        
        // 计算延迟时间
        const currentDelay = backoff ? delay * Math.pow(2, attempt) : delay
        
        // 在开发环境下输出重试信息
        if (import.meta.env.DEV) {
          console.warn(`请求重试 ${attempt + 1}/${maxRetries}`, {
            error: error.message,
            delay: currentDelay
          })
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, currentDelay))
      }
    }
    
    throw lastError
  }
}

/**
 * 创建防抖函数包装器
 * @param {Function} fn 要防抖的函数
 * @param {number} delay 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let timeoutId
  
  return function(...args) {
    clearTimeout(timeoutId)
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 创建节流函数包装器
 * @param {Function} fn 要节流的函数
 * @param {number} delay 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, delay = 300) {
  let lastCall = 0
  
  return function(...args) {
    const now = Date.now()
    
    if (now - lastCall >= delay) {
      lastCall = now
      fn.apply(this, args)
    }
  }
}

/**
 * 安全执行函数，捕获所有错误
 * @param {Function} fn 要执行的函数
 * @param {any} fallbackValue 出错时的回退值
 * @returns {any} 函数结果或回退值
 */
export function safeExecute(fn, fallbackValue = null) {
  try {
    return fn()
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('安全执行函数出错', {
        error: error.message,
        stack: error.stack
      })
    }
    return fallbackValue
  }
}

/**
 * 安全执行异步函数，捕获所有错误
 * @param {Function} asyncFn 要执行的异步函数
 * @param {any} fallbackValue 出错时的回退值
 * @returns {Promise<any>} 函数结果或回退值
 */
export async function safeExecuteAsync(asyncFn, fallbackValue = null) {
  try {
    return await asyncFn()
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('安全执行异步函数出错', {
        error: error.message,
        stack: error.stack
      })
    }
    return fallbackValue
  }
}

// 导出核心组件供高级用法
export {
  ErrorHandler,
  notificationManager
}