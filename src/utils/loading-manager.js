/**
 * 加载状态管理器
 * 管理全局和局部的加载状态
 */

import { ref, reactive } from 'vue'

class LoadingManager {
  constructor() {
    // 全局加载状态
    this.globalLoading = ref(false)
    
    // 请求计数器
    this.requestCount = ref(0)
    
    // 局部加载状态映射
    this.localLoadingMap = reactive(new Map())
    
    // 加载配置
    this.config = {
      // 全局加载的最小显示时间（毫秒）
      minLoadingTime: 300,
      // 延迟显示加载的时间（毫秒）
      delayTime: 200
    }
  }

  /**
   * 开始全局加载
   * @param {string} key 加载标识
   */
  startGlobalLoading(key = 'default') {
    this.requestCount.value++
    
    // 延迟显示加载状态，避免闪烁
    if (!this.globalLoading.value) {
      setTimeout(() => {
        if (this.requestCount.value > 0) {
          this.globalLoading.value = true
        }
      }, this.config.delayTime)
    }
  }

  /**
   * 结束全局加载
   * @param {string} key 加载标识
   */
  endGlobalLoading(key = 'default') {
    this.requestCount.value = Math.max(0, this.requestCount.value - 1)
    
    if (this.requestCount.value === 0) {
      // 确保最小显示时间
      setTimeout(() => {
        if (this.requestCount.value === 0) {
          this.globalLoading.value = false
        }
      }, this.config.minLoadingTime)
    }
  }

  /**
   * 开始局部加载
   * @param {string} key 加载标识
   */
  startLocalLoading(key) {
    if (!key) return
    
    this.localLoadingMap.set(key, true)
  }

  /**
   * 结束局部加载
   * @param {string} key 加载标识
   */
  endLocalLoading(key) {
    if (!key) return
    
    this.localLoadingMap.set(key, false)
  }

  /**
   * 获取全局加载状态
   * @returns {Ref<boolean>} 全局加载状态
   */
  getGlobalLoading() {
    return this.globalLoading
  }

  /**
   * 获取局部加载状态
   * @param {string} key 加载标识
   * @returns {boolean} 局部加载状态
   */
  getLocalLoading(key) {
    return this.localLoadingMap.get(key) || false
  }

  /**
   * 清除所有加载状态
   */
  clearAllLoading() {
    this.globalLoading.value = false
    this.requestCount.value = 0
    this.localLoadingMap.clear()
  }

  /**
   * 创建带加载状态的异步函数
   * @param {Function} asyncFunction 异步函数
   * @param {Object} options 选项
   * @returns {Function} 包装后的函数
   */
  withLoading(asyncFunction, options = {}) {
    const {
      global = true,
      local = null,
      showError = true
    } = options

    return async (...args) => {
      try {
        // 开始加载
        if (global) {
          this.startGlobalLoading()
        }
        if (local) {
          this.startLocalLoading(local)
        }

        // 执行异步函数
        const result = await asyncFunction(...args)
        return result
      } catch (error) {
        if (showError) {
          const { ErrorHandler } = await import('./error-handler.js')
          ErrorHandler.handleError(error)
        }
        throw error
      } finally {
        // 结束加载
        if (global) {
          this.endGlobalLoading()
        }
        if (local) {
          this.endLocalLoading(local)
        }
      }
    }
  }
}

// 创建全局加载管理器实例
export const loadingManager = new LoadingManager()

// 导出类供其他地方使用
export { LoadingManager }