/**
 * 统一错误处理器
 * 负责处理API错误和显示错误通知
 */

import { API_CONFIG } from '@/config/api-config.js'
import { notificationManager } from './notification-manager.js'

class ErrorHandler {
    /**
     * 处理API错误
     * @param {Error} error 错误对象
     * @param {Object} options 处理选项
     */
    static handleError(error, options = {}) {
        const {
            showNotification = false,
            customMessage = null
        } = options

        // 获取错误信息
        const errorInfo = this.parseError(error)

        // 全局错误通知
        if (showNotification) {
            const message = customMessage || errorInfo.message
            
            // 避免重复通知：如果同一个错误已经被通知过，且消息相同，则不再通知
            if (error.__notifiedMessage === message) {
                return errorInfo
            }
            error.__notifiedMessage = message

            const duration = this.getNotificationDuration(errorInfo.code)
            
            // 使用NotificationManager显示错误
            notificationManager.error(message, { duration })
        }

        // 特殊错误处理
        this.handleSpecialErrors(error, errorInfo)

        return errorInfo
    }

    /**
     * 解析错误信息
     * @param {Error} error 错误对象
     * @returns {Object} 解析后的错误信息
     */
    static parseError(error) {
        let code = 500
        let message = '未知错误'
        let details = null

        if (error.response) {
            // HTTP响应错误
            code = error.response.status || error.status || 500

            // 尝试从响应中获取错误信息
            if (error.response.data) {
                if (typeof error.response.data === 'string') {
                    try {
                        const data = JSON.parse(error.response.data)
                        message = data.message || this.getErrorMessage(code)
                        details = data
                    } catch {
                        message = error.response.data
                    }
                } else if (typeof error.response.data === 'object') {
                    message = error.response.data.message || this.getErrorMessage(code)
                    details = error.response.data
                }
            } else {
                message = this.getErrorMessage(code)
            }
        } else if (error.message) {
            // 网络错误或其他错误
            if (error.message.includes('timeout') || error.message.includes('超时')) {
                code = 408
                message = '请求超时，请检查网络连接'
            } else if (error.message.includes('Network') || error.message.includes('网络')) {
                code = 0
                message = '网络连接失败，请检查网络设置'
            } else {
                message = error.message
            }
        }

        return {
            code,
            message,
            details,
            originalError: error
        }
    }

    /**
     * 根据错误码获取错误消息
     * @param {number} code 错误码
     * @returns {string} 错误消息
     */
    static getErrorMessage(code) {
        return API_CONFIG.errorCodes[code] || `未知错误 (${code})`
    }

    /**
     * 处理特殊错误
     * @param {Error} error 原始错误
     * @param {Object} errorInfo 解析后的错误信息
     */
    static handleSpecialErrors(error, errorInfo) {
        switch (errorInfo.code) {
            case 401:
                // 未授权错误，触发登出
                this.handleUnauthorized()
                break

            case 403:
                // 权限不足
                this.handleForbidden()
                break

            case 429:
                // 请求频率过高
                this.handleRateLimit()
                break

            case 500:
            case 502:
            case 503:
            case 504:
                // 服务器错误
                this.handleServerError(errorInfo.code)
                break
        }
    }

    /**
     * 处理未授权错误
     */
    static async handleUnauthorized() {
        // 检查是否存在旧的token
        const { TokenManager } = await import('./token-manager.js')
        const hasToken = TokenManager.isAuthenticated() // 这里我们用修改后的isAuthenticated，只检查是否有token字符串
        
        // 清除令牌
        TokenManager.clearAuth()
        
        // 如果当前已经在登录页或注册页，不提示
        if (typeof window !== 'undefined') {
            const path = window.location.pathname
            if (path.includes('/login') || path.includes('/register') || path.includes('/auth/')) {
                return
            }
        }

        // 关键修复：只有当用户之前确实有登录状态（即有token）时，才提示“登录失效”
        // 这样新用户第一次访问（没有token）遇到401时，就不会弹出提示
        if (hasToken && window.notificationManager) {
            window.notificationManager.info('登录状态已失效，请登录后继续操作')
        }
    }

    /**
     * 处理权限不足错误
     */
    static handleForbidden() {
        // 不进行全局权限不足提示
    }

    /**
     * 处理请求频率限制错误
     */
    static handleRateLimit() {
        // 不进行全局频率限制提示
    }

    /**
     * 处理服务器错误
     * @param {number} code 错误码
     */
    static handleServerError(code) {
        // 不进行全局服务器错误提示
    }

    /**
     * 获取通知持续时间
     * @param {number} code 错误码
     * @returns {number} 持续时间（毫秒）
     */
    static getNotificationDuration(code) {
        // 根据错误严重程度调整通知持续时间
        if (code >= 500) {
            return 8000 // 服务器错误显示更长时间
        } else if (code === 401 || code === 403) {
            return 6000 // 权限相关错误
        } else {
            return 5000 // 默认时间
        }
    }



    /**
     * 跳转到登录页面
     */
    static redirectToLogin() {
        if (typeof window !== 'undefined') {
            // 尝试使用Vue Router
            if (window.router) {
                window.router.push('/auth/login')
            } else if (window.location) {
                // 降级到直接跳转
                window.location.href = '/auth/login'
            }
        }
    }

    /**
     * 创建重试函数
     * @param {Function} originalFunction 原始函数
     * @param {number} maxRetries 最大重试次数
     * @param {number} delay 重试延迟（毫秒）
     * @returns {Function} 带重试功能的函数
     */
    static createRetryFunction(originalFunction, maxRetries = 3, delay = 1000) {
        return async function (...args) {
            let lastError

            for (let i = 0; i <= maxRetries; i++) {
                try {
                    return await originalFunction.apply(this, args)
                } catch (error) {
                    lastError = error

                    // 如果是最后一次尝试，或者是不应该重试的错误，直接抛出
                    if (i === maxRetries || ErrorHandler.shouldNotRetry(error)) {
                        throw error
                    }

                    // 等待后重试
                    await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
                }
            }

            throw lastError
        }
    }

    /**
     * 判断错误是否不应该重试
     * @param {Error} error 错误对象
     * @returns {boolean} 是否不应该重试
     */
    static shouldNotRetry(error) {
        const noRetryStatuses = [400, 401, 403, 404, 422]
        const status = error.status || error.response?.status

        return noRetryStatuses.includes(status)
    }

    /**
     * 设置全局错误处理器
     */
    static setupGlobalErrorHandler() {
        // 处理未捕获的Promise错误
        if (typeof window !== 'undefined') {
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled promise rejection:', event.reason)
                this.handleError(event.reason, { showNotification: false })
            })

            // 处理JavaScript运行时错误
            window.addEventListener('error', (event) => {
                console.error('JavaScript error:', event.error)
            })
        }
    }
}

export { ErrorHandler }
