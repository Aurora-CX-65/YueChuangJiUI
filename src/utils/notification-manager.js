import { ElMessage } from 'element-plus'

/**
 * 通知管理器
 * 提供统一的通知显示接口，支持多种通知组件
 */

class NotificationManager {
  constructor() {
    this.notificationQueue = []
    this.maxNotifications = 5
    this.defaultDuration = 5000
  }

  /**
   * 显示成功通知
   * @param {string} message 消息内容
   * @param {Object} options 选项
   */
  success(message, options = {}) {
    this.show(message, 'success', options)
  }

  /**
   * 显示错误通知
   * @param {string} message 消息内容
   * @param {Object} options 选项
   */
  error(message, options = {}) {
    this.show(message, 'error', options)
  }

  /**
   * 显示警告通知
   * @param {string} message 消息内容
   * @param {Object} options 选项
   */
  warning(message, options = {}) {
    this.show(message, 'warning', options)
  }

  /**
   * 显示信息通知
   * @param {string} message 消息内容
   * @param {Object} options 选项
   */
  info(message, options = {}) {
    this.show(message, 'info', options)
  }

  /**
   * 显示通知
   * @param {string} message 消息内容
   * @param {string} type 通知类型
   * @param {Object} options 选项
   */
  show(message, type = 'info', options = {}) {
    const notification = {
      id: this.generateId(),
      message,
      type,
      duration: options.duration || this.defaultDuration,
      showClose: options.showClose !== false,
      timestamp: Date.now(),
      ...options
    }

    // 检查是否有重复的通知
    if (this.isDuplicate(notification)) {
      return
    }

    // 添加到队列
    this.addToQueue(notification)

    // 尝试使用不同的通知组件
    this.tryShowNotification(notification)
  }

  /**
   * 尝试显示通知
   * @param {Object} notification 通知对象
   */
  tryShowNotification(notification) {
    // 尝试使用Element Plus
    if (this.tryElementPlus(notification)) {
      return
    }

    // 尝试使用Ant Design Vue
    if (this.tryAntDesign(notification)) {
      return
    }

    // 尝试使用自定义通知组件
    if (this.tryCustomNotification(notification)) {
      return
    }

    // 降级到浏览器原生通知
    this.fallbackNotification(notification)
  }

  /**
   * 尝试使用Element Plus通知
   * @param {Object} notification 通知对象
   * @returns {boolean} 是否成功显示
   */
  tryElementPlus(notification) {
    // 优先尝试使用导入的 ElMessage
    if (typeof ElMessage !== 'undefined') {
      try {
        ElMessage({
          type: notification.type,
          message: notification.message,
          duration: notification.duration,
          showClose: notification.showClose
        })
        return true
      } catch (error) {
        console.warn('Element Plus通知显示失败:', error)
      }
    }
    
    // 降级尝试全局挂载的 ElMessage
    if (typeof window !== 'undefined' && window.ElMessage) {
      try {
        window.ElMessage({
          type: notification.type,
          message: notification.message,
          duration: notification.duration,
          showClose: notification.showClose
        })
        return true
      } catch (error) {
        console.warn('全局 Element Plus通知显示失败:', error)
      }
    }
    return false
  }

  /**
   * 尝试使用Ant Design Vue通知
   * @param {Object} notification 通知对象
   * @returns {boolean} 是否成功显示
   */
  tryAntDesign(notification) {
    if (typeof window !== 'undefined' && window.$message) {
      try {
        window.$message[notification.type](notification.message, notification.duration / 1000)
        return true
      } catch (error) {
        console.warn('Ant Design Vue通知显示失败:', error)
      }
    }
    return false
  }

  /**
   * 尝试使用自定义通知组件
   * @param {Object} notification 通知对象
   * @returns {boolean} 是否成功显示
   */
  tryCustomNotification(notification) {
    if (typeof window !== 'undefined' && window.showToast) {
      try {
        window.showToast(notification.message, notification.type, notification.duration)
        return true
      } catch (error) {
        console.warn('自定义通知显示失败:', error)
      }
    }
    return false
  }

  /**
   * 降级到浏览器原生通知
   * @param {Object} notification 通知对象
   */
  fallbackNotification(notification) {
    // 在开发环境下使用console
    if (import.meta.env.DEV) {
      const prefix = this.getTypePrefix(notification.type)
      console.log(`${prefix} ${notification.message}`)
    } else {
      // 生产环境下只使用console
      console.log(`[${notification.type.toUpperCase()}] ${notification.message}`)
    }

    // 尝试使用浏览器原生Notification API
    this.tryBrowserNotification(notification)
  }

  /**
   * 尝试使用浏览器原生Notification API
   * @param {Object} notification 通知对象
   */
  tryBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`阅创集 - ${this.getTypeText(notification.type)}`, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id
        })
      } catch (error) {
        console.warn('浏览器原生通知显示失败:', error)
      }
    }
  }

  /**
   * 请求浏览器通知权限
   */
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      } catch (error) {
        console.warn('请求通知权限失败:', error)
        return false
      }
    }
    return Notification.permission === 'granted'
  }

  /**
   * 生成通知ID
   * @returns {string} 通知ID
   */
  generateId() {
    return `notification_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * 检查是否是重复通知
   * @param {Object} notification 通知对象
   * @returns {boolean} 是否重复
   */
  isDuplicate(notification) {
    const now = Date.now()
    const duplicateWindow = 3000 // 3秒内的重复通知

    return this.notificationQueue.some(existing => 
      existing.message === notification.message &&
      existing.type === notification.type &&
      (now - existing.timestamp) < duplicateWindow
    )
  }

  /**
   * 添加到通知队列
   * @param {Object} notification 通知对象
   */
  addToQueue(notification) {
    this.notificationQueue.push(notification)

    // 限制队列长度
    if (this.notificationQueue.length > this.maxNotifications) {
      this.notificationQueue.shift()
    }

    // 自动清理过期通知
    setTimeout(() => {
      this.removeFromQueue(notification.id)
    }, notification.duration + 1000)
  }

  /**
   * 从队列中移除通知
   * @param {string} notificationId 通知ID
   */
  removeFromQueue(notificationId) {
    const index = this.notificationQueue.findIndex(n => n.id === notificationId)
    if (index > -1) {
      this.notificationQueue.splice(index, 1)
    }
  }

  /**
   * 获取类型前缀
   * @param {string} type 通知类型
   * @returns {string} 类型前缀
   */
  getTypePrefix(type) {
    const prefixes = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }
    return prefixes[type] || 'ℹ️'
  }

  /**
   * 获取类型文本
   * @param {string} type 通知类型
   * @returns {string} 类型文本
   */
  getTypeText(type) {
    const texts = {
      success: '成功',
      error: '错误',
      warning: '警告',
      info: '信息'
    }
    return texts[type] || '通知'
  }

  /**
   * 清空所有通知
   */
  clear() {
    this.notificationQueue = []
  }

  /**
   * 获取当前通知队列
   * @returns {Array} 通知队列
   */
  getQueue() {
    return [...this.notificationQueue]
  }
}

// 创建全局实例
export const notificationManager = new NotificationManager()

// 导出类供其他地方使用
export { NotificationManager }