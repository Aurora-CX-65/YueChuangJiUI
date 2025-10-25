/**
 * 管理员用户管理状态存储
 * 
 * 管理管理员用户管理相关的状态，包括用户列表、用户操作、统计信息等
 */

import { defineStore } from 'pinia'
import { AdminUserService } from '@/services/admin/admin-user-service.js'
import { 
  createPersistConfig, 
  createLoadingState,
  createErrorHandler,
  createLoadingManager,
  createPaginationState,
  createPaginationManager
} from '../store-config.js'

export const useAdminUserStore = defineStore('adminUser', {
  state: () => ({
    // 用户管理状态
    users: {
      list: [],
      pagination: createPaginationState(),
      filters: {
        keyword: '',
        status: '',
        role: '',
        dateRange: null
      },
      ...createLoadingState()
    },
    
    // 当前选中的用户详情
    currentUser: {
      data: null,
      banLogs: [],
      ...createLoadingState()
    },
    
    // 用户统计信息
    userStats: {
      data: null,
      ...createLoadingState()
    },
    
    // 批量操作状态
    batchOperation: {
      selectedUserIds: [],
      processing: false,
      results: []
    }
  }),

  getters: {
    /**
     * 根据ID获取用户
     */
    getUserById: (state) => (userId) => {
      return state.users.list.find(user => user.id === userId)
    },
    
    /**
     * 获取活跃用户列表
     */
    activeUsers: (state) => {
      return state.users.list.filter(user => user.status === 'ACTIVE')
    },
    
    /**
     * 获取被封禁用户列表
     */
    bannedUsers: (state) => {
      return state.users.list.filter(user => user.status === 'BANNED')
    },
    
    /**
     * 获取被暂停用户列表
     */
    suspendedUsers: (state) => {
      return state.users.list.filter(user => user.status === 'SUSPENDED')
    },
    
    /**
     * 根据角色获取用户列表
     */
    getUsersByRole: (state) => (role) => {
      return state.users.list.filter(user => user.role === role)
    },
    
    /**
     * 获取管理员用户列表
     */
    adminUsers: (state) => {
      return state.users.list.filter(user => user.role === 'ADMIN')
    },
    
    /**
     * 获取作者用户列表
     */
    authorUsers: (state) => {
      return state.users.list.filter(user => user.role === 'AUTHOR')
    },
    
    /**
     * 获取普通用户列表
     */
    regularUsers: (state) => {
      return state.users.list.filter(user => user.role === 'USER')
    },
    
    /**
     * 获取用户统计摘要
     */
    userStatsSummary: (state) => {
      if (!state.userStats.data) return null
      
      return {
        total: state.userStats.data.totalUsers || 0,
        active: state.userStats.data.activeUsers || 0,
        suspended: state.userStats.data.suspendedUsers || 0,
        banned: state.userStats.data.bannedUsers || 0,
        todayRegistrations: state.userStats.data.todayRegistrations || 0
      }
    },
    
    /**
     * 检查是否有选中的用户
     */
    hasSelectedUsers: (state) => {
      return state.batchOperation.selectedUserIds.length > 0
    },
    
    /**
     * 获取选中用户的数量
     */
    selectedUsersCount: (state) => {
      return state.batchOperation.selectedUserIds.length
    }
  },

  actions: {
    // 混入通用方法
    ...createLoadingManager(),
    ...createPaginationManager(),
    handleError: createErrorHandler('AdminUserStore'),

    /**
     * 获取用户列表
     * @param {Object} params - 查询参数
     */
    async fetchUsers(params = {}) {
      try {
        this.users.loading = true
        this.users.error = null
        
        const queryParams = {
          page: params.page || this.users.pagination.current,
          size: params.size || this.users.pagination.size,
          keyword: params.keyword || this.users.filters.keyword,
          status: params.status || this.users.filters.status,
          role: params.role || this.users.filters.role,
          ...params
        }
        
        const response = await AdminUserService.getUsers(queryParams)
        
        if (response) {
          this.users.list = response.records || response.data || []
          
          // 更新分页信息
          if (response.total !== undefined) {
            this.users.pagination.total = response.total
            this.users.pagination.current = response.current || queryParams.page
            this.users.pagination.size = response.size || queryParams.size
            this.users.pagination.pages = Math.ceil(response.total / this.users.pagination.size)
          }
          
          // 更新过滤条件
          this.users.filters = {
            ...this.users.filters,
            keyword: queryParams.keyword,
            status: queryParams.status,
            role: queryParams.role
          }
        }
        
        this.users.loading = false
        this.users.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.users.loading = false
        this.users.error = error.message || '获取用户列表失败'
        this.handleError(error, '获取用户列表')
        throw error
      }
    },

    /**
     * 根据ID获取用户详情
     * @param {number} userId - 用户ID
     */
    async fetchUserById(userId) {
      try {
        this.currentUser.loading = true
        this.currentUser.error = null
        
        const user = await AdminUserService.getUserById(userId)
        
        if (user) {
          this.currentUser.data = user
        }
        
        this.currentUser.loading = false
        this.currentUser.lastUpdated = new Date().toISOString()
        
        return user
      } catch (error) {
        this.currentUser.loading = false
        this.currentUser.error = error.message || '获取用户详情失败'
        this.handleError(error, '获取用户详情')
        throw error
      }
    },

    /**
     * 更新用户状态
     * @param {number} userId - 用户ID
     * @param {Object} statusData - 状态数据
     */
    async updateUserStatus(userId, statusData) {
      try {
        const result = await AdminUserService.updateUserStatus(userId, statusData)
        
        if (result) {
          // 更新本地用户列表中的用户状态
          const userIndex = this.users.list.findIndex(u => u.id === userId)
          if (userIndex !== -1) {
            this.users.list[userIndex] = { 
              ...this.users.list[userIndex], 
              status: statusData.status,
              updatedAt: new Date().toISOString()
            }
          }
          
          // 更新当前用户详情
          if (this.currentUser.data && this.currentUser.data.id === userId) {
            this.currentUser.data = { 
              ...this.currentUser.data, 
              status: statusData.status,
              updatedAt: new Date().toISOString()
            }
          }
          
          if (window.notificationManager) {
            window.notificationManager.success('用户状态更新成功')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '更新用户状态')
        throw error
      }
    },

    /**
     * 更新用户角色
     * @param {number} userId - 用户ID
     * @param {Object} roleData - 角色数据
     */
    async updateUserRole(userId, roleData) {
      try {
        const result = await AdminUserService.updateUserRole(userId, roleData)
        
        if (result) {
          // 更新本地用户列表中的用户角色
          const userIndex = this.users.list.findIndex(u => u.id === userId)
          if (userIndex !== -1) {
            this.users.list[userIndex] = { 
              ...this.users.list[userIndex], 
              role: roleData.role,
              updatedAt: new Date().toISOString()
            }
          }
          
          // 更新当前用户详情
          if (this.currentUser.data && this.currentUser.data.id === userId) {
            this.currentUser.data = { 
              ...this.currentUser.data, 
              role: roleData.role,
              updatedAt: new Date().toISOString()
            }
          }
          
          if (window.notificationManager) {
            window.notificationManager.success('用户角色更新成功')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '更新用户角色')
        throw error
      }
    },

    /**
     * 重置用户密码
     * @param {number} userId - 用户ID
     */
    async resetUserPassword(userId) {
      try {
        const result = await AdminUserService.resetUserPassword(userId)
        
        if (result && window.notificationManager) {
          window.notificationManager.success('用户密码重置成功')
        }
        
        return result
      } catch (error) {
        this.handleError(error, '重置用户密码')
        throw error
      }
    },

    /**
     * 暂停用户
     * @param {number} userId - 用户ID
     * @param {Object} suspendData - 暂停数据
     */
    async suspendUser(userId, suspendData) {
      try {
        const result = await AdminUserService.suspendUser(userId, suspendData)
        
        if (result) {
          // 更新用户状态为暂停
          await this.updateUserStatus(userId, { status: 'SUSPENDED' })
          
          if (window.notificationManager) {
            window.notificationManager.success('用户暂停成功')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '暂停用户')
        throw error
      }
    },

    /**
     * 封禁用户
     * @param {number} userId - 用户ID
     * @param {Object} banData - 封禁数据
     */
    async banUser(userId, banData) {
      try {
        const result = await AdminUserService.banUser(userId, banData)
        
        if (result) {
          // 更新用户状态为封禁
          await this.updateUserStatus(userId, { status: 'BANNED' })
          
          if (window.notificationManager) {
            window.notificationManager.success('用户封禁成功')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '封禁用户')
        throw error
      }
    },

    /**
     * 解封用户
     * @param {number} userId - 用户ID
     */
    async unbanUser(userId) {
      try {
        const result = await AdminUserService.unbanUser(userId)
        
        if (result) {
          // 更新用户状态为活跃
          await this.updateUserStatus(userId, { status: 'ACTIVE' })
          
          if (window.notificationManager) {
            window.notificationManager.success('用户解封成功')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '解封用户')
        throw error
      }
    },

    /**
     * 获取用户封禁日志
     * @param {number} userId - 用户ID
     */
    async fetchUserBanLogs(userId) {
      try {
        this.currentUser.loading = true
        
        const logs = await AdminUserService.getUserBanLogs(userId)
        
        if (logs) {
          this.currentUser.banLogs = logs
        }
        
        this.currentUser.loading = false
        
        return logs
      } catch (error) {
        this.currentUser.loading = false
        this.handleError(error, '获取用户封禁日志')
        throw error
      }
    },

    /**
     * 获取用户统计信息
     */
    async fetchUserStats() {
      try {
        this.userStats.loading = true
        this.userStats.error = null
        
        const stats = await AdminUserService.getUserStats()
        
        if (stats) {
          this.userStats.data = stats
        }
        
        this.userStats.loading = false
        this.userStats.lastUpdated = new Date().toISOString()
        
        return stats
      } catch (error) {
        this.userStats.loading = false
        this.userStats.error = error.message || '获取用户统计失败'
        this.handleError(error, '获取用户统计')
        throw error
      }
    },

    /**
     * 搜索用户
     * @param {string} keyword - 搜索关键词
     * @param {Object} filters - 过滤条件
     */
    async searchUsers(keyword, filters = {}) {
      const params = {
        keyword,
        ...filters,
        page: 1 // 搜索时重置到第一页
      }
      
      return await this.fetchUsers(params)
    },

    /**
     * 重置用户过滤条件
     */
    resetUserFilters() {
      this.users.filters = {
        keyword: '',
        status: '',
        role: '',
        dateRange: null
      }
    },

    /**
     * 选择用户（批量操作）
     * @param {number} userId - 用户ID
     */
    selectUser(userId) {
      if (!this.batchOperation.selectedUserIds.includes(userId)) {
        this.batchOperation.selectedUserIds.push(userId)
      }
    },

    /**
     * 取消选择用户（批量操作）
     * @param {number} userId - 用户ID
     */
    unselectUser(userId) {
      const index = this.batchOperation.selectedUserIds.indexOf(userId)
      if (index > -1) {
        this.batchOperation.selectedUserIds.splice(index, 1)
      }
    },

    /**
     * 切换用户选择状态
     * @param {number} userId - 用户ID
     */
    toggleUserSelection(userId) {
      if (this.batchOperation.selectedUserIds.includes(userId)) {
        this.unselectUser(userId)
      } else {
        this.selectUser(userId)
      }
    },

    /**
     * 全选用户
     */
    selectAllUsers() {
      this.batchOperation.selectedUserIds = this.users.list.map(user => user.id)
    },

    /**
     * 取消全选
     */
    unselectAllUsers() {
      this.batchOperation.selectedUserIds = []
    },

    /**
     * 批量更新用户状态
     * @param {string} status - 新状态
     */
    async batchUpdateUserStatus(status) {
      try {
        this.batchOperation.processing = true
        this.batchOperation.results = []
        
        const promises = this.batchOperation.selectedUserIds.map(async (userId) => {
          try {
            await this.updateUserStatus(userId, { status })
            return { userId, success: true }
          } catch (error) {
            return { userId, success: false, error: error.message }
          }
        })
        
        const results = await Promise.all(promises)
        this.batchOperation.results = results
        
        const successCount = results.filter(r => r.success).length
        const failCount = results.length - successCount
        
        if (window.notificationManager) {
          if (failCount === 0) {
            window.notificationManager.success(`批量操作成功，共处理 ${successCount} 个用户`)
          } else {
            window.notificationManager.warning(`批量操作完成，成功 ${successCount} 个，失败 ${failCount} 个`)
          }
        }
        
        // 清空选择
        this.unselectAllUsers()
        
        this.batchOperation.processing = false
        
        return results
      } catch (error) {
        this.batchOperation.processing = false
        this.handleError(error, '批量更新用户状态')
        throw error
      }
    },

    /**
     * 刷新用户列表
     */
    async refreshUsers() {
      return await this.fetchUsers({ 
        page: this.users.pagination.current,
        size: this.users.pagination.size
      })
    },

    /**
     * 清空当前用户详情
     */
    clearCurrentUser() {
      this.currentUser.data = null
      this.currentUser.banLogs = []
      this.currentUser.error = null
    },

    /**
     * 初始化管理员用户数据
     */
    async initializeAdminUserData() {
      try {
        await Promise.all([
          this.fetchUsers(),
          this.fetchUserStats()
        ])
      } catch (error) {
        console.warn('初始化管理员用户数据失败:', error)
      }
    }
  },

  // 持久化配置 - 只缓存过滤条件和分页信息
  persist: createPersistConfig('admin-user', [
    'users.filters',
    'users.pagination'
  ])
})