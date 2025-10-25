/**
 * 管理员系统管理状态存储
 * 
 * 管理系统统计、日志查看、系统设置等相关状态
 */

import { defineStore } from 'pinia'
import { AdminSystemService } from '@/services/admin/admin-system-service.js'
import { 
  createPersistConfig, 
  createLoadingState,
  createErrorHandler,
  createLoadingManager,
  createPaginationState,
  createPaginationManager
} from '../store-config.js'

export const useAdminSystemStore = defineStore('adminSystem', {
  state: () => ({
    // 系统统计数据
    stats: {
      overview: null,
      users: null,
      books: null,
      ...createLoadingState()
    },
    
    // 操作日志
    logs: {
      list: [],
      pagination: createPaginationState(),
      filters: {
        keyword: '',
        level: '',
        module: '',
        dateRange: null
      },
      ...createLoadingState()
    },
    
    // 系统设置
    settings: {
      data: null,
      ...createLoadingState()
    },
    
    // 实时数据刷新
    realTimeData: {
      enabled: false,
      interval: null,
      lastUpdate: null
    }
  }),

  getters: {
    /**
     * 获取系统概览统计摘要
     */
    overviewStatsSummary: (state) => {
      if (!state.stats.overview) return null
      
      return {
        totalUsers: state.stats.overview.totalUsers || 0,
        activeUsers: state.stats.overview.activeUsers || 0,
        totalBooks: state.stats.overview.totalBooks || 0,
        publishedBooks: state.stats.overview.publishedBooks || 0,
        totalComments: state.stats.overview.totalComments || 0,
        todayRegistrations: state.stats.overview.todayRegistrations || 0,
        todayPublications: state.stats.overview.todayPublications || 0
      }
    },
    
    /**
     * 获取用户统计摘要
     */
    userStatsSummary: (state) => {
      if (!state.stats.users) return null
      
      return {
        total: state.stats.users.totalUsers || 0,
        active: state.stats.users.activeUsers || 0,
        suspended: state.stats.users.suspendedUsers || 0,
        banned: state.stats.users.bannedUsers || 0,
        authors: state.stats.users.authorUsers || 0,
        admins: state.stats.users.adminUsers || 0,
        todayRegistrations: state.stats.users.todayRegistrations || 0,
        weeklyRegistrations: state.stats.users.weeklyRegistrations || 0,
        monthlyRegistrations: state.stats.users.monthlyRegistrations || 0
      }
    },
    
    /**
     * 获取书籍统计摘要
     */
    bookStatsSummary: (state) => {
      if (!state.stats.books) return null
      
      return {
        total: state.stats.books.totalBooks || 0,
        published: state.stats.books.publishedBooks || 0,
        draft: state.stats.books.draftBooks || 0,
        reviewing: state.stats.books.reviewingBooks || 0,
        totalChapters: state.stats.books.totalChapters || 0,
        totalWords: state.stats.books.totalWords || 0,
        todayPublications: state.stats.books.todayPublications || 0,
        weeklyPublications: state.stats.books.weeklyPublications || 0,
        monthlyPublications: state.stats.books.monthlyPublications || 0
      }
    },
    
    /**
     * 获取今日统计数据
     */
    todayStats: (state) => {
      const overview = state.stats.overview
      const users = state.stats.users
      const books = state.stats.books
      
      if (!overview && !users && !books) return null
      
      return {
        registrations: users?.todayRegistrations || overview?.todayRegistrations || 0,
        publications: books?.todayPublications || overview?.todayPublications || 0,
        comments: overview?.todayComments || 0,
        visits: overview?.todayVisits || 0
      }
    },
    
    /**
     * 检查是否有错误日志
     */
    hasErrorLogs: (state) => {
      return state.logs.list.some(log => log.level === 'ERROR')
    },
    
    /**
     * 获取错误日志数量
     */
    errorLogsCount: (state) => {
      return state.logs.list.filter(log => log.level === 'ERROR').length
    },
    
    /**
     * 获取警告日志数量
     */
    warningLogsCount: (state) => {
      return state.logs.list.filter(log => log.level === 'WARN').length
    },
    
    /**
     * 检查实时数据是否启用
     */
    isRealTimeEnabled: (state) => {
      return state.realTimeData.enabled && state.realTimeData.interval !== null
    }
  },

  actions: {
    // 混入通用方法
    ...createLoadingManager(),
    ...createPaginationManager(),
    handleError: createErrorHandler('AdminSystemStore'),

    /**
     * 获取系统概览统计
     * @param {boolean} [forceRefresh=false] - 是否强制刷新
     */
    async fetchOverviewStats(forceRefresh = false) {
      try {
        // 如果已有数据且不强制刷新，检查是否需要更新
        if (!forceRefresh && this.stats.overview && this.stats.lastUpdated) {
          const lastUpdate = new Date(this.stats.lastUpdated)
          const now = new Date()
          const diffMinutes = (now - lastUpdate) / (1000 * 60)
          
          // 如果数据更新时间少于5分钟，直接返回缓存数据
          if (diffMinutes < 5) {
            return this.stats.overview
          }
        }
        
        this.stats.loading = true
        this.stats.error = null
        
        const stats = await AdminSystemService.getOverviewStats()
        
        if (stats) {
          this.stats.overview = stats
        }
        
        this.stats.loading = false
        this.stats.lastUpdated = new Date().toISOString()
        
        return stats
      } catch (error) {
        this.stats.loading = false
        this.stats.error = error.message || '获取系统概览统计失败'
        this.handleError(error, '获取系统概览统计')
        throw error
      }
    },

    /**
     * 获取用户统计数据
     * @param {boolean} [forceRefresh=false] - 是否强制刷新
     */
    async fetchUserStats(forceRefresh = false) {
      try {
        if (!forceRefresh && this.stats.users && this.stats.lastUpdated) {
          const lastUpdate = new Date(this.stats.lastUpdated)
          const now = new Date()
          const diffMinutes = (now - lastUpdate) / (1000 * 60)
          
          if (diffMinutes < 5) {
            return this.stats.users
          }
        }
        
        this.stats.loading = true
        this.stats.error = null
        
        const stats = await AdminSystemService.getUserStats()
        
        if (stats) {
          this.stats.users = stats
        }
        
        this.stats.loading = false
        this.stats.lastUpdated = new Date().toISOString()
        
        return stats
      } catch (error) {
        this.stats.loading = false
        this.stats.error = error.message || '获取用户统计失败'
        this.handleError(error, '获取用户统计')
        throw error
      }
    },

    /**
     * 获取书籍统计数据
     * @param {boolean} [forceRefresh=false] - 是否强制刷新
     */
    async fetchBookStats(forceRefresh = false) {
      try {
        if (!forceRefresh && this.stats.books && this.stats.lastUpdated) {
          const lastUpdate = new Date(this.stats.lastUpdated)
          const now = new Date()
          const diffMinutes = (now - lastUpdate) / (1000 * 60)
          
          if (diffMinutes < 5) {
            return this.stats.books
          }
        }
        
        this.stats.loading = true
        this.stats.error = null
        
        const stats = await AdminSystemService.getBookStats()
        
        if (stats) {
          this.stats.books = stats
        }
        
        this.stats.loading = false
        this.stats.lastUpdated = new Date().toISOString()
        
        return stats
      } catch (error) {
        this.stats.loading = false
        this.stats.error = error.message || '获取书籍统计失败'
        this.handleError(error, '获取书籍统计')
        throw error
      }
    },

    /**
     * 获取系统统计数据（全部）
     * @param {boolean} [forceRefresh=false] - 是否强制刷新
     */
    async fetchSystemStats(forceRefresh = false) {
      try {
        this.stats.loading = true
        this.stats.error = null
        
        const stats = await AdminSystemService.getSystemStats()
        
        if (stats) {
          // 假设后端返回包含所有统计数据的对象
          this.stats.overview = stats.overview || stats
          this.stats.users = stats.users || null
          this.stats.books = stats.books || null
        }
        
        this.stats.loading = false
        this.stats.lastUpdated = new Date().toISOString()
        
        return stats
      } catch (error) {
        this.stats.loading = false
        this.stats.error = error.message || '获取系统统计失败'
        this.handleError(error, '获取系统统计')
        throw error
      }
    },

    /**
     * 获取操作日志
     * @param {Object} params - 查询参数
     */
    async fetchOperationLogs(params = {}) {
      try {
        this.logs.loading = true
        this.logs.error = null
        
        const queryParams = {
          page: params.page || this.logs.pagination.current,
          size: params.size || this.logs.pagination.size,
          keyword: params.keyword || this.logs.filters.keyword,
          level: params.level || this.logs.filters.level,
          module: params.module || this.logs.filters.module,
          ...params
        }
        
        const response = await AdminSystemService.getOperationLogs(queryParams)
        
        if (response) {
          this.logs.list = response.records || response.data || []
          
          // 更新分页信息
          if (response.total !== undefined) {
            this.logs.pagination.total = response.total
            this.logs.pagination.current = response.current || queryParams.page
            this.logs.pagination.size = response.size || queryParams.size
            this.logs.pagination.pages = Math.ceil(response.total / this.logs.pagination.size)
          }
          
          // 更新过滤条件
          this.logs.filters = {
            ...this.logs.filters,
            keyword: queryParams.keyword,
            level: queryParams.level,
            module: queryParams.module
          }
        }
        
        this.logs.loading = false
        this.logs.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.logs.loading = false
        this.logs.error = error.message || '获取操作日志失败'
        this.handleError(error, '获取操作日志')
        throw error
      }
    },

    /**
     * 搜索操作日志
     * @param {string} keyword - 搜索关键词
     * @param {Object} filters - 过滤条件
     */
    async searchOperationLogs(keyword, filters = {}) {
      const params = {
        keyword,
        ...filters,
        page: 1 // 搜索时重置到第一页
      }
      
      return await this.fetchOperationLogs(params)
    },

    /**
     * 重置日志过滤条件
     */
    resetLogFilters() {
      this.logs.filters = {
        keyword: '',
        level: '',
        module: '',
        dateRange: null
      }
    },

    /**
     * 获取系统设置
     * @param {boolean} [forceRefresh=false] - 是否强制刷新
     */
    async fetchSystemSettings(forceRefresh = false) {
      try {
        if (!forceRefresh && this.settings.data && this.settings.lastUpdated) {
          const lastUpdate = new Date(this.settings.lastUpdated)
          const now = new Date()
          const diffMinutes = (now - lastUpdate) / (1000 * 60)
          
          // 设置数据缓存10分钟
          if (diffMinutes < 10) {
            return this.settings.data
          }
        }
        
        this.settings.loading = true
        this.settings.error = null
        
        const settings = await AdminSystemService.getSystemSettings()
        
        if (settings) {
          this.settings.data = settings
        }
        
        this.settings.loading = false
        this.settings.lastUpdated = new Date().toISOString()
        
        return settings
      } catch (error) {
        this.settings.loading = false
        this.settings.error = error.message || '获取系统设置失败'
        this.handleError(error, '获取系统设置')
        throw error
      }
    },

    /**
     * 更新系统设置
     * @param {Object} settingsData - 设置数据
     */
    async updateSystemSettings(settingsData) {
      try {
        this.settings.loading = true
        this.settings.error = null
        
        const result = await AdminSystemService.updateSystemSettings(settingsData)
        
        if (result) {
          // 更新本地设置数据
          this.settings.data = { ...this.settings.data, ...settingsData }
          
          if (window.notificationManager) {
            window.notificationManager.success('系统设置更新成功')
          }
        }
        
        this.settings.loading = false
        this.settings.lastUpdated = new Date().toISOString()
        
        return result
      } catch (error) {
        this.settings.loading = false
        this.settings.error = error.message || '更新系统设置失败'
        this.handleError(error, '更新系统设置')
        throw error
      }
    },

    /**
     * 启用实时数据刷新
     * @param {number} [intervalMinutes=5] - 刷新间隔（分钟）
     */
    enableRealTimeData(intervalMinutes = 5) {
      if (this.realTimeData.interval) {
        this.disableRealTimeData()
      }
      
      this.realTimeData.enabled = true
      this.realTimeData.interval = setInterval(async () => {
        try {
          await this.fetchOverviewStats(true)
          this.realTimeData.lastUpdate = new Date().toISOString()
        } catch (error) {
          console.warn('实时数据刷新失败:', error)
        }
      }, intervalMinutes * 60 * 1000)
      
      console.log(`实时数据刷新已启用，间隔 ${intervalMinutes} 分钟`)
    },

    /**
     * 禁用实时数据刷新
     */
    disableRealTimeData() {
      if (this.realTimeData.interval) {
        clearInterval(this.realTimeData.interval)
        this.realTimeData.interval = null
      }
      
      this.realTimeData.enabled = false
      console.log('实时数据刷新已禁用')
    },

    /**
     * 刷新所有统计数据
     */
    async refreshAllStats() {
      try {
        await Promise.all([
          this.fetchOverviewStats(true),
          this.fetchUserStats(true),
          this.fetchBookStats(true)
        ])
        
        if (window.notificationManager) {
          window.notificationManager.success('统计数据刷新成功')
        }
      } catch (error) {
        this.handleError(error, '刷新统计数据')
        throw error
      }
    },

    /**
     * 刷新操作日志
     */
    async refreshOperationLogs() {
      return await this.fetchOperationLogs({ 
        page: this.logs.pagination.current,
        size: this.logs.pagination.size
      })
    },

    /**
     * 清空统计数据缓存
     */
    clearStatsCache() {
      this.stats.overview = null
      this.stats.users = null
      this.stats.books = null
      this.stats.lastUpdated = null
    },

    /**
     * 清空日志数据
     */
    clearLogsData() {
      this.logs.list = []
      this.logs.pagination = createPaginationState()
      this.resetLogFilters()
    },

    /**
     * 初始化管理员系统数据
     */
    async initializeAdminSystemData() {
      try {
        await Promise.all([
          this.fetchOverviewStats(),
          this.fetchOperationLogs({ page: 1, size: 20 }) // 获取最近的日志
        ])
      } catch (error) {
        console.warn('初始化管理员系统数据失败:', error)
      }
    }
  },

  // 持久化配置 - 只缓存过滤条件和分页信息，不缓存统计数据
  persist: createPersistConfig('admin-system', [
    'logs.filters',
    'logs.pagination',
    'realTimeData.enabled'
  ])
})