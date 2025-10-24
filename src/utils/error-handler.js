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
            showNotification = true,
            customMessage = null
        } = options

        // 获取错误信息
        const errorInfo = this.parseError(error)

        // 显示错误通知
        if (showNotification) {
            const message = customMessage || errorInfo.message
            notificationManager.error(message, {
                duration: this.getNotificationDuration(errorInfo.code)
            })
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
        // 清除令牌
        const { TokenManager } = await import('./token-manager.js')
        TokenManager.clearAuth()

        // 显示特殊通知
        notificationManager.warning('登录已过期，请重新登录', {
            duration: 8000
        })

        // 延迟跳转，让用户看到通知
        setTimeout(() => {
            this.redirectToLogin()
        }, 2000)
    }

    /**
     * 处理权限不足错误
     */
    static handleForbidden() {
        notificationManager.warning('权限不足，无法执行此操作')
    }

    /**
     * 处理请求频率限制错误
     */
    static handleRateLimit() {
        notificationManager.warning('请求过于频繁，请稍后再试')
    }

    /**
     * 处理服务器错误
     * @param {number} code 错误码
     */
    static handleServerError(code) {
        let message = '服务器暂时无法处理请求，请稍后重试'

        switch (code) {
            case 502:
                message = '网关错误，请稍后重试'
                break
            case 503:
                message = '服务暂时不可用，请稍后重试'
                break
            case 504:
                message = '网关超时，请稍后重试'
                break
        }

        notificationManager.error(message, {
            duration: 8000
        })
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
                window.router.push('/login')
            } else if (window.location) {
                // 降级到直接跳转
                window.location.href = '/login'
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