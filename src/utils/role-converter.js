/**
 * 用户角色转换工具
 * 用于统一处理前后端角色字段的不一致问题
 */

/**
 * 后端角色枚举（与后端UserRole.java保持一致）
 */
export const BACKEND_ROLES = {
  READER: 'reader',
  AUTHOR: 'author', 
  EDITOR: 'editor',
  ADMIN: 'admin'
}

/**
 * 前端显示角色枚举（用于UI显示和权限判断）
 */
export const FRONTEND_ROLES = {
  READER: 'READER',
  AUTHOR: 'AUTHOR',
  EDITOR: 'EDITOR', 
  ADMIN: 'ADMIN'
}

/**
 * 角色级别定义（用于权限比较）
 */
export const ROLE_LEVELS = {
  [FRONTEND_ROLES.READER]: 1,
  [FRONTEND_ROLES.AUTHOR]: 2,
  [FRONTEND_ROLES.EDITOR]: 3,
  [FRONTEND_ROLES.ADMIN]: 4
}

/**
 * 角色显示信息映射
 */
export const ROLE_DISPLAY_MAP = {
  [FRONTEND_ROLES.READER]: { text: '读者', color: 'primary', icon: 'user' },
  [FRONTEND_ROLES.AUTHOR]: { text: '作者', color: 'info', icon: 'edit' },
  [FRONTEND_ROLES.EDITOR]: { text: '编辑', color: 'success', icon: 'check-circle' },
  [FRONTEND_ROLES.ADMIN]: { text: '管理员', color: 'warning', icon: 'shield' }
}

/**
 * 后端角色转前端角色
 * @param {string} backendRole - 后端角色字符串
 * @returns {string} 前端角色字符串
 */
export function convertBackendToFrontendRole(backendRole) {
  if (!backendRole || typeof backendRole !== 'string') {
    return FRONTEND_ROLES.READER
  }
  
  const lowerRole = backendRole.toLowerCase()
  switch (lowerRole) {
    case BACKEND_ROLES.READER:
      return FRONTEND_ROLES.READER
    case BACKEND_ROLES.AUTHOR:
      return FRONTEND_ROLES.AUTHOR
    case BACKEND_ROLES.EDITOR:
      return FRONTEND_ROLES.EDITOR
    case BACKEND_ROLES.ADMIN:
      return FRONTEND_ROLES.ADMIN
    default:
      console.warn(`未知的后端角色: ${backendRole}，默认为读者`)
      return FRONTEND_ROLES.READER
  }
}

/**
 * 前端角色转后端角色
 * @param {string} frontendRole - 前端角色字符串
 * @returns {string} 后端角色字符串
 */
export function convertFrontendToBackendRole(frontendRole) {
  if (!frontendRole || typeof frontendRole !== 'string') {
    return BACKEND_ROLES.READER
  }
  
  const upperRole = frontendRole.toUpperCase()
  switch (upperRole) {
    case FRONTEND_ROLES.READER:
      return BACKEND_ROLES.READER
    case FRONTEND_ROLES.AUTHOR:
      return BACKEND_ROLES.AUTHOR
    case FRONTEND_ROLES.EDITOR:
      return BACKEND_ROLES.EDITOR
    case FRONTEND_ROLES.ADMIN:
      return BACKEND_ROLES.ADMIN
    default:
      console.warn(`未知的前端角色: ${frontendRole}，默认为读者`)
      return BACKEND_ROLES.READER
  }
}

/**
 * 获取角色级别
 * @param {string} role - 角色字符串（前端格式）
 * @returns {number} 角色级别
 */
export function getRoleLevel(role) {
  const frontendRole = convertBackendToFrontendRole(role)
  return ROLE_LEVELS[frontendRole] || 1
}

/**
 * 比较角色级别
 * @param {string} role1 - 角色1
 * @param {string} role2 - 角色2
 * @returns {number} 比较结果：1表示role1级别更高，-1表示role2级别更高，0表示相等
 */
export function compareRoleLevel(role1, role2) {
  const level1 = getRoleLevel(role1)
  const level2 = getRoleLevel(role2)
  
  if (level1 > level2) return 1
  if (level1 < level2) return -1
  return 0
}

/**
 * 检查用户是否有指定角色或更高级别的角色
 * @param {string} userRole - 用户角色
 * @param {string} requiredRole - 需要的角色
 * @returns {boolean} 是否满足角色要求
 */
export function hasRoleOrHigher(userRole, requiredRole) {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole)
}

/**
 * 检查用户是否为读者
 * @param {string} role - 用户角色
 * @returns {boolean} 是否为读者
 */
export function isReader(role) {
  const frontendRole = convertBackendToFrontendRole(role)
  return frontendRole === FRONTEND_ROLES.READER
}

/**
 * 检查用户是否为作者（包含作者、编辑、管理员）
 * @param {string} role - 用户角色
 * @returns {boolean} 是否为作者或更高级别
 */
export function isAuthor(role) {
  return hasRoleOrHigher(role, BACKEND_ROLES.AUTHOR)
}

/**
 * 检查用户是否为编辑（包含编辑、管理员）
 * @param {string} role - 用户角色
 * @returns {boolean} 是否为编辑或更高级别
 */
export function isEditor(role) {
  return hasRoleOrHigher(role, BACKEND_ROLES.EDITOR)
}

/**
 * 检查用户是否为管理员
 * @param {string} role - 用户角色
 * @returns {boolean} 是否为管理员
 */
export function isAdmin(role) {
  const frontendRole = convertBackendToFrontendRole(role)
  return frontendRole === FRONTEND_ROLES.ADMIN
}

/**
 * 获取角色显示信息
 * @param {string} role - 用户角色
 * @returns {Object} 角色显示信息
 */
export function getRoleDisplayInfo(role) {
  const frontendRole = convertBackendToFrontendRole(role)
  const displayInfo = ROLE_DISPLAY_MAP[frontendRole] || ROLE_DISPLAY_MAP[FRONTEND_ROLES.READER]
  
  return {
    ...displayInfo,
    original: role,
    frontend: frontendRole,
    backend: convertFrontendToBackendRole(frontendRole)
  }
}

/**
 * 验证角色是否有效
 * @param {string} role - 角色字符串
 * @returns {boolean} 是否为有效角色
 */
export function isValidRole(role) {
  if (!role || typeof role !== 'string') {
    return false
  }
  
  const lowerRole = role.toLowerCase()
  return Object.values(BACKEND_ROLES).includes(lowerRole)
}

/**
 * 获取所有有效的后端角色列表
 * @returns {string[]} 后端角色列表
 */
export function getAllBackendRoles() {
  return Object.values(BACKEND_ROLES)
}

/**
 * 获取所有有效的前端角色列表
 * @returns {string[]} 前端角色列表
 */
export function getAllFrontendRoles() {
  return Object.values(FRONTEND_ROLES)
}