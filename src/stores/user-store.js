/**
 * 用户状态存储
 * 
 * 管理用户相关的状态，包括登录状态、用户信息、关注关系等
 */

import { defineStore } from 'pinia'
import { AuthService } from '@/services/auth-service.js'
import { UserService } from '@/services/user-service.js'
import { TokenManager } from '@/utils/token-manager.js'
import { AdminPermissionChecker } from '@/utils/admin/admin-permission-checker.js'
import { isAuthor, isEditor, isAdmin } from '@/utils/role-converter.js'
import { 
  createPersistConfig, 
  createLoadingState, 
  createPaginationState,
  createErrorHandler,
  createLoadingManager,
  createPaginationManager
} from './store-config.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 当前用户信息
    currentUser: null,
    
    // 认证状态
    isAuthenticated: false,
    
    // 用户统计信息
    userStats: null,
    
    // 关注列表
    following: {
      items: [],
      pagination: createPaginationState(),
      ...createLoadingState()
    },
    
    // 粉丝列表
    followers: {
      items: [],
      pagination: createPaginationState(),
      ...createLoadingState()
    },
    
    // 收藏书籍列表
    favorites: {
      items: [],
      pagination: createPaginationState(),
      ...createLoadingState()
    },
    
    // 用户搜索结果
    searchResults: {
      items: [],
      keyword: '',
      pagination: createPaginationState(),
      ...createLoadingState()
    },
    
    // 作者申请相关状态
    authorApplication: {
      applications: [],
      latestApplication: null,
      canApply: false,
      pagination: createPaginationState(),
      ...createLoadingState()
    },
    
    // 全局加载状态
    ...createLoadingState(),
    
    // 权限检查器实例
    permissionChecker: null
  }),

  getters: {
    /**
     * 是否已登录
     */
    isLoggedIn: (state) => state.isAuthenticated && !!state.currentUser,
    
    /**
     * 当前用户ID
     */
    currentUserId: (state) => state.currentUser?.id,
    
    /**
     * 当前用户角色
     */
    currentUserRole: (state) => state.currentUser?.role,
    
    /**
     * 是否为作者
     */
    isAuthor: (state) => isAuthor(state.currentUser?.role),
    
    /**
     * 是否为编辑
     */
    isEditor: (state) => isEditor(state.currentUser?.role),

    /**
     * 是否为管理员
     */
    isAdmin: (state) => isAdmin(state.currentUser?.role),
    
    /**
     * 是否为超级管理员
     */
    isSuperAdmin: (state) => {
      // isSuperAdmin 并没有在 role-converter 中导出（或者实现不同），这里保留原有逻辑或使用 role-converter
      // 检查 role-converter 发现没有 isSuperAdmin 导出，但有 ROLE_LEVELS
      // 简单起见，这里手动实现，或者检查 role-converter 是否有
      // 刚才的 read 结果显示 role-converter 没有 isSuperAdmin 导出，只有 isAdmin
      // AdminPermissionChecker 有 isSuperAdmin
      if (!state.currentUser?.role) return false;
      return state.currentUser.role.toUpperCase() === 'SUPER_ADMIN';
    },
    
    /**
     * 用户头像URL
     */
    userAvatar: (state) => state.currentUser?.avatar || '/images/default-avatar.svg',
    
    /**
     * 用户昵称
     */
    userNickname: (state) => state.currentUser?.nickname || state.currentUser?.username || '未知用户',
    
    /**
     * 关注数量
     */
    followingCount: (state) => state.userStats?.followingCount || 0,
    
    /**
     * 粉丝数量
     */
    followersCount: (state) => state.userStats?.followersCount || 0,
    
    /**
     * 作品数量
     */
    bookCount: (state) => state.userStats?.bookCount || 0,
    
    /**
     * 总字数
     */
    totalWordCount: (state) => state.userStats?.totalWordCount || 0,
    
    /**
     * 是否可以申请作者
     */
    canApplyAuthor: (state) => state.authorApplication.canApply && !state.isAuthor,
    
    /**
     * 获取权限检查器实例
     */
    getPermissionChecker: (state) => {
      if (!state.permissionChecker && state.currentUser) {
        state.permissionChecker = new AdminPermissionChecker(state.currentUser);
      }
      return state.permissionChecker;
    }
  },

  actions: {
    // 混入通用方法
    ...createLoadingManager(),
    ...createPaginationManager(),
    handleError: createErrorHandler('UserStore'),

    /**
     * 用户登录
     * @param {Object} credentials - 登录凭据
     * @param {string} credentials.username - 用户名
     * @param {string} credentials.password - 密码
     * @param {boolean} [credentials.rememberMe] - 记住我
     */
    async login(credentials) {
      try {
        this.startLoading()
        
        const response = await AuthService.login(credentials)
        
        if (response && response.accessToken) {
          // 保存令牌
          TokenManager.setToken(response.accessToken)
          if (response.refreshToken) {
            TokenManager.setRefreshToken(response.refreshToken)
          }
          
          // 设置用户信息
          this.currentUser = response.userInfo
          this.isAuthenticated = true
          
          // 初始化权限检查器
          this.permissionChecker = new AdminPermissionChecker(response.userInfo)
          
          // 获取用户统计信息
          if (response.userInfo?.id) {
            await this.fetchUserStats(response.userInfo.id)
          }
          
          this.stopLoading()
          
          // 显示成功消息
          if (window.notificationManager) {
            window.notificationManager.success(`欢迎回来，${this.userNickname}！`)
          }
          
          return response
        } else {
          throw new Error('登录响应数据格式错误')
        }
      } catch (error) {
        this.handleError(error, '登录')
        throw error
      }
    },

    /**
     * 用户注册
     * @param {Object} registerData - 注册数据
     */
    async register(registerData) {
      try {
        this.startLoading()
        
        const result = await AuthService.register(registerData)
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('注册成功！请登录您的账户。')
        }
        
        return result
      } catch (error) {
        this.handleError(error, '注册')
        throw error
      }
    },

    /**
     * 用户登出
     */
    async logout() {
      try {
        this.startLoading()
        
        // 调用后端登出接口
        await AuthService.logout()
        
        // 清除本地状态
        this.clearUserState()
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.info('您已成功登出')
        }
      } catch (error) {
        // 即使后端登出失败，也要清除本地状态
        this.clearUserState()
        console.warn('登出时发生错误，但已清除本地状态:', error)
      }
    },

    /**
     * 清除用户状态
     */
    clearUserState() {
      this.currentUser = null
      this.isAuthenticated = false
      this.userStats = null
      this.following.items = []
      this.followers.items = []
      this.favorites.items = []
      this.searchResults.items = []
      this.authorApplication.applications = []
      this.authorApplication.latestApplication = null
      this.permissionChecker = null
      
      // 清除令牌
      TokenManager.removeToken()
      TokenManager.removeRefreshToken()
    },

    /**
     * 获取当前用户信息
     */
    async fetchCurrentUser() {
      try {
        this.startLoading()
        
        const user = await UserService.getCurrentUserProfile()
        
        if (user) {
          this.currentUser = user
          this.isAuthenticated = true
          
          // 初始化权限检查器
          this.permissionChecker = new AdminPermissionChecker(user)
          
          // 获取用户统计信息
          await this.fetchUserStats(user.id)
        }
        
        this.stopLoading()
        return user
      } catch (error) {
        this.handleError(error, '获取用户信息')
        // 如果获取用户信息失败，可能是令牌过期，清除状态
        this.clearUserState()
        throw error
      }
    },

    /**
     * 刷新认证信息
     * 从数据库获取最新用户信息并更新JWT令牌（用于角色变更后实时更新）
     */
    async refreshAuthInfo() {
      try {
        console.log('[UserStore] 开始刷新认证信息...')
        const response = await AuthService.refreshAuthInfo()
        
        console.log('[UserStore] 收到响应:', response)
        
        if (response && response.accessToken) {
          // 更新令牌
          TokenManager.setToken(response.accessToken)
          if (response.refreshToken) {
            TokenManager.setRefreshToken(response.refreshToken)
          }
          
          // 更新用户信息
          this.currentUser = response.userInfo
          this.isAuthenticated = true
          
          console.log('[UserStore] 用户信息已更新，最新角色:', response.userInfo?.role)
          
          // 重新初始化权限检查器
          this.permissionChecker = new AdminPermissionChecker(response.userInfo)
          
          // 获取用户统计信息
          if (response.userInfo?.id) {
            await this.fetchUserStats(response.userInfo.id)
          }
          
          return response
        }
        
        console.error('[UserStore] 响应格式错误:', response)
        throw new Error('刷新认证信息响应格式错误')
      } catch (error) {
        console.error('[UserStore] 刷新认证信息失败:', error)
        this.handleError(error, '刷新认证信息')
        throw error
      }
    },

    /**
     * 更新用户信息
     * @param {Object} updateData - 更新数据
     */
    async updateProfile(updateData) {
      try {
        this.startLoading()
        
        const updatedUser = await UserService.updateUserInfo(updateData)
        
        if (updatedUser) {
          this.currentUser = { ...this.currentUser, ...updatedUser }
          
          // 更新权限检查器
          if (this.permissionChecker) {
            this.permissionChecker.setCurrentUser(this.currentUser)
          }
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('个人信息更新成功')
        }
        
        return updatedUser
      } catch (error) {
        this.handleError(error, '更新个人信息')
        throw error
      }
    },

    /**
     * 上传头像
     * @param {File} file - 头像文件
     */
    async uploadAvatar(file) {
      try {
        this.startLoading()
        
        const avatarUrl = await UserService.uploadAvatar(file)
        
        if (avatarUrl && this.currentUser) {
          this.currentUser.avatar = avatarUrl
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('头像上传成功')
        }
        
        return avatarUrl
      } catch (error) {
        this.handleError(error, '上传头像')
        throw error
      }
    },

    /**
     * 获取用户统计信息
     * @param {number} userId - 用户ID
     */
    async fetchUserStats(userId) {
      try {
        const stats = await UserService.getUserStats(userId)
        
        if (userId === this.currentUserId) {
          this.userStats = stats
        }
        
        return stats
      } catch (error) {
        console.warn('获取用户统计信息失败:', error)
        return null
      }
    },

    /**
     * 关注用户
     * @param {number} userId - 被关注用户ID
     */
    async followUser(userId) {
      try {
        const result = await UserService.followUser(userId)
        
        if (result && this.userStats) {
          this.userStats.followingCount++
        }
        
        if (window.notificationManager) {
          window.notificationManager.success('关注成功')
        }
        
        return result
      } catch (error) {
        this.handleError(error, '关注用户')
        throw error
      }
    },

    /**
     * 取消关注用户
     * @param {number} userId - 被取消关注用户ID
     */
    async unfollowUser(userId) {
      try {
        const result = await UserService.unfollowUser(userId)
        
        if (result && this.userStats && this.userStats.followingCount > 0) {
          this.userStats.followingCount--
        }
        
        if (window.notificationManager) {
          window.notificationManager.success('已取消关注')
        }
        
        return result
      } catch (error) {
        this.handleError(error, '取消关注')
        throw error
      }
    },

    /**
     * 检查关注状态
     * @param {number} userId - 用户ID
     */
    async checkFollowStatus(userId) {
      try {
        return await UserService.checkFollowStatus(userId)
      } catch (error) {
        console.warn('检查关注状态失败:', error)
        return false
      }
    },

    /**
     * 获取关注列表
     * @param {number} [userId] - 用户ID，不传则获取当前用户的
     * @param {number} [page=1] - 页码
     * @param {number} [size=10] - 每页大小
     */
    async fetchFollowing(userId, page = 1, size = 10) {
      try {
        this.following.loading = true
        this.following.error = null
        
        let response
        if (userId && userId !== this.currentUserId) {
          response = await UserService.getUserFollowing(userId, page, size)
        } else {
          response = await UserService.getCurrentUserFollowing(page, size)
        }
        
        if (response) {
          this.following.items = page === 1 ? response.records : [...this.following.items, ...response.records]
          this.updateFollowingPagination(response)
        }
        
        this.following.loading = false
        this.following.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.following.error = error.message
        this.following.loading = false
        this.handleError(error, '获取关注列表')
        throw error
      }
    },

    /**
     * 获取粉丝列表
     * @param {number} [userId] - 用户ID，不传则获取当前用户的
     * @param {number} [page=1] - 页码
     * @param {number} [size=10] - 每页大小
     */
    async fetchFollowers(userId, page = 1, size = 10) {
      try {
        this.followers.loading = true
        this.followers.error = null
        
        let response
        if (userId && userId !== this.currentUserId) {
          response = await UserService.getUserFollowers(userId, page, size)
        } else {
          response = await UserService.getCurrentUserFollowers(page, size)
        }
        
        if (response) {
          this.followers.items = page === 1 ? response.records : [...this.followers.items, ...response.records]
          this.updateFollowersPagination(response)
        }
        
        this.followers.loading = false
        this.followers.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.followers.error = error.message
        this.followers.loading = false
        this.handleError(error, '获取粉丝列表')
        throw error
      }
    },

    /**
     * 获取收藏列表
     * @param {number} [userId] - 用户ID，不传则获取当前用户的
     * @param {number} [page=1] - 页码
     * @param {number} [size=10] - 每页大小
     */
    async fetchFavorites(userId, page = 1, size = 10) {
      try {
        this.favorites.loading = true
        this.favorites.error = null
        
        let response
        if (userId && userId !== this.currentUserId) {
          response = await UserService.getUserFavorites(userId, page, size)
        } else {
          response = await UserService.getCurrentUserFavorites(page, size)
        }
        
        if (response) {
          this.favorites.items = page === 1 ? response.records : [...this.favorites.items, ...response.records]
          this.updateFavoritesPagination(response)
        }
        
        this.favorites.loading = false
        this.favorites.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.favorites.error = error.message
        this.favorites.loading = false
        this.handleError(error, '获取收藏列表')
        throw error
      }
    },

    /**
     * 搜索用户
     * @param {string} keyword - 搜索关键词
     * @param {number} [page=1] - 页码
     * @param {number} [size=10] - 每页大小
     */
    async searchUsers(keyword, page = 1, size = 10) {
      try {
        this.searchResults.loading = true
        this.searchResults.error = null
        
        if (page === 1) {
          this.searchResults.keyword = keyword
        }
        
        const response = await UserService.searchUsers(keyword, page, size)
        
        if (response) {
          this.searchResults.items = page === 1 ? response.records : [...this.searchResults.items, ...response.records]
          this.updateSearchPagination(response)
        }
        
        this.searchResults.loading = false
        this.searchResults.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.searchResults.error = error.message
        this.searchResults.loading = false
        this.handleError(error, '搜索用户')
        throw error
      }
    },

    /**
     * 申请成为作者
     * @param {Object} applicationData - 申请数据
     */
    async applyForAuthor(applicationData) {
      try {
        this.authorApplication.loading = true
        this.authorApplication.error = null
        
        const result = await UserService.applyForAuthor(applicationData)
        
        if (result) {
          // 刷新申请状态
          await this.fetchAuthorApplications()
          await this.checkCanApplyAuthor()
        }
        
        this.authorApplication.loading = false
        
        if (window.notificationManager) {
          window.notificationManager.success('作者申请提交成功，请等待审核')
        }
        
        return result
      } catch (error) {
        this.authorApplication.error = error.message
        this.authorApplication.loading = false
        this.handleError(error, '申请作者身份')
        throw error
      }
    },

    /**
     * 获取作者申请记录
     * @param {number} [page=1] - 页码
     * @param {number} [size=10] - 每页大小
     */
    async fetchAuthorApplications(page = 1, size = 10) {
      try {
        this.authorApplication.loading = true
        this.authorApplication.error = null
        
        const response = await UserService.getUserApplications(page, size)
        
        if (response) {
          this.authorApplication.applications = page === 1 ? response.records : [...this.authorApplication.applications, ...response.records]
          this.updateAuthorApplicationPagination(response)
        }
        
        this.authorApplication.loading = false
        this.authorApplication.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.authorApplication.error = error.message
        this.authorApplication.loading = false
        this.handleError(error, '获取申请记录')
        throw error
      }
    },

    /**
     * 获取最新申请记录
     */
    async fetchLatestApplication() {
      try {
        const application = await UserService.getLatestApplication()
        this.authorApplication.latestApplication = application
        return application
      } catch (error) {
        console.warn('获取最新申请记录失败:', error)
        return null
      }
    },

    /**
     * 检查是否可以申请作者
     */
    async checkCanApplyAuthor() {
      try {
        const canApply = await UserService.canApplyForAuthor()
        this.authorApplication.canApply = canApply
        return canApply
      } catch (error) {
        console.warn('检查申请资格失败:', error)
        return false
      }
    },

    /**
     * 撤销申请
     * @param {number} applicationId - 申请ID
     */
    async withdrawApplication(applicationId) {
      try {
        const result = await UserService.withdrawApplication(applicationId)
        
        if (result) {
          // 从列表中移除
          this.authorApplication.applications = this.authorApplication.applications.filter(
            app => app.id !== applicationId
          )
          
          // 更新申请状态
          await this.checkCanApplyAuthor()
        }
        
        if (window.notificationManager) {
          window.notificationManager.success('申请已撤销')
        }
        
        return result
      } catch (error) {
        this.handleError(error, '撤销申请')
        throw error
      }
    },

    // 分页更新方法
    updateFollowingPagination(paginationData) {
      if (paginationData) {
        this.following.pagination.current = paginationData.current || 1
        this.following.pagination.size = paginationData.size || 10
        this.following.pagination.total = paginationData.total || 0
        this.following.pagination.pages = Math.ceil(this.following.pagination.total / this.following.pagination.size)
      }
    },

    updateFollowersPagination(paginationData) {
      if (paginationData) {
        this.followers.pagination.current = paginationData.current || 1
        this.followers.pagination.size = paginationData.size || 10
        this.followers.pagination.total = paginationData.total || 0
        this.followers.pagination.pages = Math.ceil(this.followers.pagination.total / this.followers.pagination.size)
      }
    },

    updateFavoritesPagination(paginationData) {
      if (paginationData) {
        this.favorites.pagination.current = paginationData.current || 1
        this.favorites.pagination.size = paginationData.size || 10
        this.favorites.pagination.total = paginationData.total || 0
        this.favorites.pagination.pages = Math.ceil(this.favorites.pagination.total / this.favorites.pagination.size)
      }
    },

    updateSearchPagination(paginationData) {
      if (paginationData) {
        this.searchResults.pagination.current = paginationData.current || 1
        this.searchResults.pagination.size = paginationData.size || 10
        this.searchResults.pagination.total = paginationData.total || 0
        this.searchResults.pagination.pages = Math.ceil(this.searchResults.pagination.total / this.searchResults.pagination.size)
      }
    },

    updateAuthorApplicationPagination(paginationData) {
      if (paginationData) {
        this.authorApplication.pagination.current = paginationData.current || 1
        this.authorApplication.pagination.size = paginationData.size || 10
        this.authorApplication.pagination.total = paginationData.total || 0
        this.authorApplication.pagination.pages = Math.ceil(this.authorApplication.pagination.total / this.authorApplication.pagination.size)
      }
    },

    /**
     * 权限检查相关方法
     */
    
    /**
     * 检查操作权限
     * @param {string} operation - 操作类型
     * @returns {Object} 权限检查结果
     */
    checkPermission(operation) {
      if (!this.permissionChecker) {
        return {
          hasPermission: false,
          reason: '权限检查器未初始化'
        };
      }
      return this.permissionChecker.checkPermission(operation);
    },
    
    /**
     * 检查是否可以操作目标用户
     * @param {Object} targetUser - 目标用户
     * @param {string} operation - 操作类型
     * @returns {Object} 权限检查结果
     */
    canOperateUser(targetUser, operation) {
      if (!this.permissionChecker) {
        return {
          hasPermission: false,
          reason: '权限检查器未初始化'
        };
      }
      return this.permissionChecker.canOperateUser(targetUser, operation);
    },
    
    /**
     * 批量权限检查
     * @param {Array} operations - 操作列表
     * @returns {Object} 批量权限检查结果
     */
    checkMultiplePermissions(operations) {
      if (!this.permissionChecker) {
        return {
          results: {},
          hasAllPermissions: false,
          allowedOperations: [],
          deniedOperations: operations
        };
      }
      return this.permissionChecker.checkMultiplePermissions(operations);
    },
    
    /**
     * 获取用户可执行的操作列表
     * @returns {Array} 可执行的操作列表
     */
    getAllowedOperations() {
      if (!this.permissionChecker) {
        return [];
      }
      return this.permissionChecker.getAllowedOperations();
    },
    
    /**
     * 检查资源访问权限
     * @param {string} resourceType - 资源类型
     * @param {string} action - 操作动作
     * @param {Object} resource - 资源对象
     * @returns {Object} 权限检查结果
     */
    checkResourcePermission(resourceType, action, resource = null) {
      if (!this.permissionChecker) {
        return {
          hasPermission: false,
          reason: '权限检查器未初始化'
        };
      }
      return this.permissionChecker.checkResourcePermission(resourceType, action, resource);
    },

    /**
     * 初始化用户状态
     * 检查本地存储的token状态，清理无效的认证信息
     */
    async initializeUserState() {
      try {
        // 检查是否有token
        const token = TokenManager.getToken()
        
        if (!token) {
          // 没有token，确保状态为未认证
          this.clearUserState()
          return
        }

        // 检查token是否过期
        if (TokenManager.isTokenExpired()) {
          console.log('检测到过期token，清理用户状态')
          this.clearUserState()
          return
        }

        // token存在且未过期，但需要验证用户状态是否一致
        if (this.isAuthenticated && this.currentUser) {
          // 状态一致，无需处理
          return
        }

        // token存在但用户状态不一致，尝试获取用户信息
        try {
          await this.fetchCurrentUser()
        } catch (error) {
          // 获取用户信息失败，可能token无效，清理状态
          console.log('获取用户信息失败，清理用户状态:', error.message)
          this.clearUserState()
        }
      } catch (error) {
        console.error('初始化用户状态失败:', error)
        this.clearUserState()
      }
    }
  },

  // 持久化配置
  persist: createPersistConfig('user', [
    'currentUser',
    'isAuthenticated',
    'userStats'
  ])
})