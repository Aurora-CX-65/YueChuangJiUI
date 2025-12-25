/**
 * 路由守卫
 * 基于用户角色的路由访问控制
 */

import { useUserStore } from '@/stores/user-store.js'
import { TokenManager } from '@/utils/token-manager.js'
import { 
  isAuthor, 
  isEditor, 
  isAdmin, 
  hasRoleOrHigher,
  BACKEND_ROLES 
} from '@/utils/role-converter.js'

/**
 * 检查用户是否已认证
 * @returns {boolean} 是否已认证
 */
function isAuthenticated() {
  const userStore = useUserStore()
  // 使用用户状态管理中的登录状态，确保与导航栏保持一致
  return userStore.isLoggedIn
}

/**
 * 获取当前用户角色
 * @returns {string|null} 用户角色
 */
function getCurrentUserRole() {
  const userStore = useUserStore()
  return userStore.currentUser?.role || null
}

/**
 * 检查用户是否有访问权限
 * @param {Object} meta - 路由元信息
 * @param {string} userRole - 用户角色
 * @returns {boolean} 是否有权限
 */
function hasPermission(meta, userRole) {
  // 如果没有权限要求，允许访问
  if (!meta.requiresAuth && !meta.requiresRole && !meta.requiresAnyRole) {
    return true
  }

  // 如果需要认证但用户未登录
  if (meta.requiresAuth && !isAuthenticated()) {
    return false
  }

  // 如果用户未登录，但路由需要角色权限
  if ((meta.requiresRole || meta.requiresAnyRole) && !userRole) {
    return false
  }

  // 检查特定角色要求
  if (meta.requiresRole) {
    return hasRoleOrHigher(userRole, meta.requiresRole)
  }

  // 检查任意角色要求
  if (meta.requiresAnyRole && Array.isArray(meta.requiresAnyRole)) {
    return meta.requiresAnyRole.some(role => hasRoleOrHigher(userRole, role))
  }

  return true
}

/**
 * 获取重定向路径
 * @param {Object} to - 目标路由
 * @param {string} userRole - 用户角色
 * @returns {string} 重定向路径
 */
function getRedirectPath(to, userRole) {
  const meta = to.meta || {}

  // 如果需要认证但用户未登录，重定向到登录页
  if (!isAuthenticated()) {
    // 不强制跳转到登录页，允许访问 requiresAuth 的页面以进行只读展示
    // 对需要角色的页面，跳转到首页
    if (meta.requiresRole || meta.requiresAnyRole) {
      return '/'
    }
    return null
  }

  // 如果用户已登录但权限不足，重定向到首页
  if (isAuthenticated() && !hasPermission(meta, userRole)) {
    return '/'
  }

  // 如果是访客页面但用户已登录，重定向到首页
  if (meta.requiresGuest && isAuthenticated()) {
    return '/'
  }

  return null
}

/**
 * 路由前置守卫
 * @param {Object} to - 目标路由
 * @param {Object} from - 来源路由
 * @param {Function} next - 导航函数
 */
export async function beforeEachGuard(to, from, next) {
  const userStore = useUserStore()
  let userRole = getCurrentUserRole()
  const meta = to.meta || {}

  // 检查是否为访客页面（如登录、注册页面）
  if (meta.requiresGuest && isAuthenticated()) {
    next('/')
    return
  }

  // 如果需要权限且用户信息尚未加载，但存在令牌，则尝试初始化用户状态
  const needAuthCheck = meta.requiresAuth || meta.requiresRole || meta.requiresAnyRole
  if (needAuthCheck && (!userStore.isLoggedIn || !userStore.currentUser) && TokenManager.getToken()) {
    try {
      await userStore.initializeUserState()
      userRole = getCurrentUserRole()
    } catch (e) {
      console.warn('初始化用户状态失败:', e)
    }
  }

  // 检查权限
  if (!hasPermission(meta, userRole)) {
    const redirectPath = getRedirectPath(to, userRole)
    if (redirectPath) {
      next(redirectPath)
      return
    }
  }

  // 权限检查通过，继续导航
  next()
}

/**
 * 路由后置守卫
 * @param {Object} to - 目标路由
 * @param {Object} from - 来源路由
 */
export function afterEachGuard(to, from) {
  // 更新页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 阅创集`
  } else {
    document.title = '阅创集 - 创作与阅读一体化平台'
  }

  // 记录页面访问日志（开发环境）
  if (import.meta.env.DEV) {
    console.log(`[Router] 导航到: ${to.path}`, {
      name: to.name,
      params: to.params,
      query: to.query,
      meta: to.meta
    })
  }
}

/**
 * 路由错误处理
 * @param {Error} error - 错误对象
 * @param {Object} to - 目标路由
 * @param {Object} from - 来源路由
 */
export function routeErrorHandler(error, to, from) {
  console.error('[Router] 路由错误:', error)
  // 不进行自动重定向，便于观察错误并在控制台调试
}

/**
 * 权限检查工具函数
 */
export const PermissionChecker = {
  /**
   * 检查是否可以访问作者功能
   * @param {string} userRole - 用户角色
   * @returns {boolean} 是否可以访问
   */
  canAccessAuthorFeatures(userRole) {
    return isAuthor(userRole)
  },

  /**
   * 检查是否可以访问编辑功能
   * @param {string} userRole - 用户角色
   * @returns {boolean} 是否可以访问
   */
  canAccessEditorFeatures(userRole) {
    return isEditor(userRole)
  },

  /**
   * 检查是否可以访问管理员功能
   * @param {string} userRole - 用户角色
   * @returns {boolean} 是否可以访问
   */
  canAccessAdminFeatures(userRole) {
    return isAdmin(userRole)
  },

  /**
   * 检查是否可以创建内容
   * @param {string} userRole - 用户角色
   * @returns {boolean} 是否可以创建内容
   */
  canCreateContent(userRole) {
    return hasRoleOrHigher(userRole, BACKEND_ROLES.AUTHOR)
  },

  /**
   * 检查是否可以审核内容
   * @param {string} userRole - 用户角色
   * @returns {boolean} 是否可以审核内容
   */
  canReviewContent(userRole) {
    return hasRoleOrHigher(userRole, BACKEND_ROLES.EDITOR)
  },

  /**
   * 检查是否可以管理用户
   * @param {string} userRole - 用户角色
   * @returns {boolean} 是否可以管理用户
   */
  canManageUsers(userRole) {
    return isAdmin(userRole)
  }
}

/**
 * 路由元信息配置示例
 * 
 * 基本配置：
 * meta: {
 *   title: '页面标题',
 *   requiresAuth: true,           // 需要登录
 *   requiresGuest: true,          // 需要未登录（访客页面）
 *   requiresRole: 'author',       // 需要特定角色或更高级别
 *   requiresAnyRole: ['author', 'editor'], // 需要任意一个角色
 * }
 * 
 * 示例：
 * {
 *   path: '/profile',
 *   meta: { title: '个人中心', requiresAuth: true }
 * },
 * {
 *   path: '/create',
 *   meta: { title: '创作中心', requiresRole: 'author' }
 * },
 * {
 *   path: '/admin',
 *   meta: { title: '管理后台', requiresRole: 'admin' }
 * },
 * {
 *   path: '/review',
 *   meta: { title: '审核中心', requiresAnyRole: ['editor', 'admin'] }
 * }
 */
