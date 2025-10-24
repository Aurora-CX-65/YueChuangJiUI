/**
 * 通知状态存储
 * 
 * 管理通知相关的状态，包括系统通知、消息提醒等
 */

import { defineStore } from 'pinia'
import { NotificationService } from '@/services/notification-service.js'
import { 
  createPersistConfig, 
  createLoadingState, 
  createPaginationState,
  createListState,
  createErrorHandler,
  createLoadingManager,
  createPaginationManager
} from './store-config.js'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    // 通知列表
    notifications: {
      ...createListState()
    },
    
    // 未读通知数量
    unreadCount: 0,
    
    // 通知设置
    settings: {
      emailNotification: true,
      browserNotification: true,
      commentNotification: true,
      likeNotification: true,
      followNotification: true,
      systemNotification: true,
      ...createLoadingState()
    },
    
    // 实时通知队列（用于显示toast等）
    toastQueue: [],
    
    // 全局加载状态
    ...createLoadingState()
  }),

  getters: {
    /**
     * 是否有未读通知
     */
    hasUnreadNotifications: (state) => state.unreadCount > 0,
    
    /**
     * 未读通知列表
     */
    unreadNotifications: (state) => {
      return state.notifications.items.filter(notification => !notification.isRead)
    },
    
    /**
     * 已读通知列表
     */
    readNotifications: (state) => {
      return state.notifications.items.filter(notification => notification.isRead)
    },
    
    /**
     * 按类型分组的通知
     */
    notificationsByType: (state) => {
      const grouped = {}
      state.notifications.items.forEach(notification => {
        const type = notification.type || 'system'
        if (!grouped[type]) {
          grouped[type] = []
        }
        grouped[type].push(notification)
      })
      return grouped
    },
    
    /**
     * 系统通知列表
     */
    systemNotifications: (state) => {
      return state.notifications.items.filter(notification => notification.type === 'system')
    },
    
    /**
     * 评论通知列表
     */
    commentNotifications: (state) => {
      return state.notifications.items.filter(notification => notification.type === 'comment')
    },
    
    /**
     * 点赞通知列表
     */
    likeNotifications: (state) => {
      return state.notifications.items.filter(notification => notification.type === 'like')
    },
    
    /**
     * 关注通知列表
     */
    followNotifications: (state) => {
      return state.notifications.items.filter(notification => notification.type === 'follow')
    },
    
    /**
     * 待显示的toast通知
     */
    pendingToasts: (state) => state.toastQueue.filter(toast => !toast.shown)
  },

  actions: {
    // 混入通用方法
    ...createLoadingManager(),
    ...createPaginationManager(),
    handleError: createErrorHandler('NotificationStore'),

    /**
     * 获取通知列表
     * @param {number} [page=1] - 页码
     * @param {number} [size=10] - 每页大小
     * @param {string} [type] - 通知类型
     * @param {boolean} [append=false] - 是否追加到现有列表
     */
    async fetchNotifications(page = 1, size = 10, type, append = false) {
      try {
        this.notifications.loading = true
        this.notifications.error = null
        
        const response = await NotificationService.getNotifications(page, size, type)
        
        if (response) {
          if (append && page > 1) {
            this.notifications.items = [...this.notifications.items, ...response.records]
          } else {
            this.notifications.items = response.records
          }
          this.updateNotificationsPagination(response)
        }
        
        this.notifications.loading = false
        this.notifications.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.notifications.error = error.message
        this.notifications.loading = false
        this.handleError(error, '获取通知列表')
        throw error
      }
    },

    /**
     * 获取未读通知数量
     */
    async fetchUnreadCount() {
      try {
        const count = await NotificationService.getUnreadCount()
        this.unreadCount = count || 0
        return count
      } catch (error) {
        console.warn('获取未读通知数量失败:', error)
        return 0
      }
    },

    /**
     * 标记通知为已读
     * @param {number} notificationId - 通知ID
     */
    async markAsRead(notificationId) {
      try {
        const result = await NotificationService.markAsRead(notificationId)
        
        if (result) {
          // 更新本地状态
          const notification = this.notifications.items.find(n => n.id === notificationId)
          if (notification && !notification.isRead) {
            notification.isRead = true
            this.unreadCount = Math.max(this.unreadCount - 1, 0)
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '标记通知已读')
        throw error
      }
    },

    /**
     * 标记所有通知为已读
     */
    async markAllAsRead() {
      try {
        const result = await NotificationService.markAllAsRead()
        
        if (result) {
          // 更新本地状态
          this.notifications.items.forEach(notification => {
            notification.isRead = true
          })
          this.unreadCount = 0
          
          if (window.notificationManager) {
            window.notificationManager.success('所有通知已标记为已读')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '标记所有通知已读')
        throw error
      }
    },

    /**
     * 删除通知
     * @param {number} notificationId - 通知ID
     */
    async deleteNotification(notificationId) {
      try {
        const result = await NotificationService.deleteNotification(notificationId)
        
        if (result) {
          // 从列表中移除
          const index = this.notifications.items.findIndex(n => n.id === notificationId)
          if (index !== -1) {
            const notification = this.notifications.items[index]
            this.notifications.items.splice(index, 1)
            this.notifications.pagination.total--
            
            // 如果是未读通知，减少未读数量
            if (!notification.isRead) {
              this.unreadCount = Math.max(this.unreadCount - 1, 0)
            }
          }
          
          if (window.notificationManager) {
            window.notificationManager.success('通知删除成功')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '删除通知')
        throw error
      }
    },

    /**
     * 清空所有通知
     */
    async clearAllNotifications() {
      try {
        const result = await NotificationService.clearAllNotifications()
        
        if (result) {
          this.notifications.items = []
          this.notifications.pagination.total = 0
          this.unreadCount = 0
          
          if (window.notificationManager) {
            window.notificationManager.success('所有通知已清空')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '清空通知')
        throw error
      }
    },

    /**
     * 获取通知设置
     */
    async fetchNotificationSettings() {
      try {
        this.settings.loading = true
        this.settings.error = null
        
        const settings = await NotificationService.getNotificationSettings()
        
        if (settings) {
          Object.assign(this.settings, settings)
        }
        
        this.settings.loading = false
        this.settings.lastUpdated = new Date().toISOString()
        
        return settings
      } catch (error) {
        this.settings.error = error.message
        this.settings.loading = false
        this.handleError(error, '获取通知设置')
        throw error
      }
    },

    /**
     * 更新通知设置
     * @param {Object} settingsData - 设置数据
     */
    async updateNotificationSettings(settingsData) {
      try {
        this.settings.loading = true
        this.settings.error = null
        
        const updatedSettings = await NotificationService.updateNotificationSettings(settingsData)
        
        if (updatedSettings) {
          Object.assign(this.settings, updatedSettings)
        }
        
        this.settings.loading = false
        this.settings.lastUpdated = new Date().toISOString()
        
        if (window.notificationManager) {
          window.notificationManager.success('通知设置更新成功')
        }
        
        return updatedSettings
      } catch (error) {
        this.settings.error = error.message
        this.settings.loading = false
        this.handleError(error, '更新通知设置')
        throw error
      }
    },

    /**
     * 添加实时通知到队列
     * @param {Object} notification - 通知对象
     */
    addToastNotification(notification) {
      const toast = {
        id: Date.now() + Math.random(),
        ...notification,
        timestamp: new Date().toISOString(),
        shown: false
      }
      
      this.toastQueue.push(toast)
      
      // 限制队列长度
      if (this.toastQueue.length > 50) {
        this.toastQueue = this.toastQueue.slice(-50)
      }
      
      return toast
    },

    /**
     * 标记toast为已显示
     * @param {string} toastId - Toast ID
     */
    markToastAsShown(toastId) {
      const toast = this.toastQueue.find(t => t.id === toastId)
      if (toast) {
        toast.shown = true
      }
    },

    /**
     * 清除已显示的toast
     */
    clearShownToasts() {
      this.toastQueue = this.toastQueue.filter(toast => !toast.shown)
    },

    /**
     * 处理WebSocket通知消息
     * @param {Object} message - WebSocket消息
     */
    handleWebSocketNotification(message) {
      try {
        const notification = JSON.parse(message.data || message)
        
        // 添加到通知列表
        this.notifications.items.unshift(notification)
        this.notifications.pagination.total++
        
        // 增加未读数量
        if (!notification.isRead) {
          this.unreadCount++
        }
        
        // 添加到toast队列
        this.addToastNotification({
          type: notification.type,
          title: notification.title,
          message: notification.content,
          level: this.getNotificationLevel(notification.type)
        })
        
        // 限制列表长度
        if (this.notifications.items.length > 100) {
          this.notifications.items = this.notifications.items.slice(0, 100)
        }
        
      } catch (error) {
        console.warn('处理WebSocket通知失败:', error)
      }
    },

    /**
     * 根据通知类型获取级别
     * @param {string} type - 通知类型
     */
    getNotificationLevel(type) {
      const levelMap = {
        system: 'info',
        comment: 'success',
        like: 'success',
        follow: 'success',
        warning: 'warning',
        error: 'error'
      }
      return levelMap[type] || 'info'
    },

    /**
     * 初始化通知系统
     */
    async initializeNotifications() {
      try {
        // 获取未读数量
        await this.fetchUnreadCount()
        
        // 获取最新通知
        await this.fetchNotifications(1, 20)
        
        // 获取通知设置
        await this.fetchNotificationSettings()
        
        // 请求浏览器通知权限
        if (this.settings.browserNotification && 'Notification' in window) {
          if (Notification.permission === 'default') {
            await Notification.requestPermission()
          }
        }
        
      } catch (error) {
        console.warn('初始化通知系统失败:', error)
      }
    },

    // 分页更新方法
    updateNotificationsPagination(paginationData) {
      if (paginationData) {
        this.notifications.pagination.current = paginationData.current || 1
        this.notifications.pagination.size = paginationData.size || 10
        this.notifications.pagination.total = paginationData.total || 0
        this.notifications.pagination.pages = Math.ceil(this.notifications.pagination.total / this.notifications.pagination.size)
      }
    }
  },

  // 持久化配置
  persist: createPersistConfig('notification', [
    'settings',
    'unreadCount'
  ])
})