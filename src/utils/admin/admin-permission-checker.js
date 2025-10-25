/**
 * 管理员权限检查工具
 * 提供管理员操作权限验证和检查功能
 */

/**
 * 用户角色权限级别定义
 */
const ROLE_LEVELS = {
  'USER': 0,
  'AUTHOR': 1,
  'ADMIN': 2,
  'SUPER_ADMIN': 3
};

/**
 * 操作权限要求定义
 */
const OPERATION_PERMISSIONS = {
  // 用户管理权限
  'USER_VIEW': { minLevel: 2, description: '查看用户信息' },
  'USER_EDIT': { minLevel: 2, description: '编辑用户信息' },
  'USER_SUSPEND': { minLevel: 2, description: '暂停用户' },
  'USER_BAN': { minLevel: 2, description: '封禁用户' },
  'USER_DELETE': { minLevel: 3, description: '删除用户' },
  'USER_CHANGE_ROLE': { minLevel: 3, description: '修改用户角色' },
  
  // 内容管理权限
  'CONTENT_VIEW': { minLevel: 2, description: '查看内容' },
  'CONTENT_EDIT': { minLevel: 2, description: '编辑内容' },
  'CONTENT_DELETE': { minLevel: 2, description: '删除内容' },
  'CONTENT_PUBLISH': { minLevel: 2, description: '发布内容' },
  
  // 分类标签管理权限
  'CATEGORY_MANAGE': { minLevel: 2, description: '管理分类' },
  'TAG_MANAGE': { minLevel: 2, description: '管理标签' },
  
  // 系统管理权限
  'SYSTEM_CONFIG': { minLevel: 3, description: '系统配置' },
  'SYSTEM_LOGS': { minLevel: 2, description: '查看系统日志' },
  'SYSTEM_STATS': { minLevel: 2, description: '查看系统统计' },
  
  // 管理员管理权限
  'ADMIN_MANAGE': { minLevel: 3, description: '管理其他管理员' }
};

/**
 * 权限检查器类
 */
export class AdminPermissionChecker {
  constructor(currentUser = null) {
    this.currentUser = currentUser;
  }
  
  /**
   * 设置当前用户
   * @param {Object} user - 用户对象
   */
  setCurrentUser(user) {
    this.currentUser = user;
  }
  
  /**
   * 获取用户角色级别
   * @param {string} role - 用户角色
   * @returns {number} 角色级别
   */
  getRoleLevel(role) {
    return ROLE_LEVELS[role] || 0;
  }
  
  /**
   * 检查用户是否为管理员
   * @param {Object} user - 用户对象，默认使用当前用户
   * @returns {boolean} 是否为管理员
   */
  isAdmin(user = this.currentUser) {
    if (!user || !user.role) return false;
    return this.getRoleLevel(user.role) >= ROLE_LEVELS.ADMIN;
  }
  
  /**
   * 检查用户是否为超级管理员
   * @param {Object} user - 用户对象，默认使用当前用户
   * @returns {boolean} 是否为超级管理员
   */
  isSuperAdmin(user = this.currentUser) {
    if (!user || !user.role) return false;
    return user.role === 'SUPER_ADMIN';
  }
  
  /**
   * 检查操作权限
   * @param {string} operation - 操作类型
   * @param {Object} user - 用户对象，默认使用当前用户
   * @returns {Object} 权限检查结果
   */
  checkPermission(operation, user = this.currentUser) {
    if (!user) {
      return {
        hasPermission: false,
        reason: '用户未登录',
        requiredLevel: null
      };
    }
    
    const permission = OPERATION_PERMISSIONS[operation];
    if (!permission) {
      return {
        hasPermission: false,
        reason: '未知操作类型',
        requiredLevel: null
      };
    }
    
    const userLevel = this.getRoleLevel(user.role);
    const hasPermission = userLevel >= permission.minLevel;
    
    return {
      hasPermission,
      reason: hasPermission ? null : `权限不足，需要${this.getLevelName(permission.minLevel)}权限`,
      requiredLevel: permission.minLevel,
      userLevel,
      description: permission.description
    };
  }
  
  /**
   * 检查是否可以操作目标用户
   * @param {Object} targetUser - 目标用户
   * @param {string} operation - 操作类型
   * @param {Object} currentUser - 当前用户，默认使用this.currentUser
   * @returns {Object} 权限检查结果
   */
  canOperateUser(targetUser, operation, currentUser = this.currentUser) {
    // 基础权限检查
    const basePermission = this.checkPermission(operation, currentUser);
    if (!basePermission.hasPermission) {
      return basePermission;
    }
    
    if (!targetUser) {
      return {
        hasPermission: false,
        reason: '目标用户不存在'
      };
    }
    
    // 不能操作自己
    if (currentUser.id === targetUser.id) {
      return {
        hasPermission: false,
        reason: '不能对自己执行此操作'
      };
    }
    
    const currentLevel = this.getRoleLevel(currentUser.role);
    const targetLevel = this.getRoleLevel(targetUser.role);
    
    // 普通管理员不能操作其他管理员
    if (currentLevel === ROLE_LEVELS.ADMIN && targetLevel >= ROLE_LEVELS.ADMIN) {
      return {
        hasPermission: false,
        reason: '权限不足，不能操作其他管理员'
      };
    }
    
    // 特殊操作的额外检查
    const restrictedOperations = ['USER_DELETE', 'USER_CHANGE_ROLE', 'ADMIN_MANAGE'];
    if (restrictedOperations.includes(operation)) {
      if (currentLevel < ROLE_LEVELS.SUPER_ADMIN && targetLevel >= ROLE_LEVELS.ADMIN) {
        return {
          hasPermission: false,
          reason: '权限不足，只有超级管理员才能执行此操作'
        };
      }
    }
    
    return {
      hasPermission: true,
      reason: null
    };
  }
  
  /**
   * 批量权限检查
   * @param {Array} operations - 操作列表
   * @param {Object} user - 用户对象，默认使用当前用户
   * @returns {Object} 批量权限检查结果
   */
  checkMultiplePermissions(operations, user = this.currentUser) {
    const results = {};
    let hasAllPermissions = true;
    
    operations.forEach(operation => {
      const result = this.checkPermission(operation, user);
      results[operation] = result;
      if (!result.hasPermission) {
        hasAllPermissions = false;
      }
    });
    
    return {
      results,
      hasAllPermissions,
      allowedOperations: Object.keys(results).filter(op => results[op].hasPermission),
      deniedOperations: Object.keys(results).filter(op => !results[op].hasPermission)
    };
  }
  
  /**
   * 获取用户可执行的操作列表
   * @param {Object} user - 用户对象，默认使用当前用户
   * @returns {Array} 可执行的操作列表
   */
  getAllowedOperations(user = this.currentUser) {
    const allowedOperations = [];
    
    Object.keys(OPERATION_PERMISSIONS).forEach(operation => {
      const result = this.checkPermission(operation, user);
      if (result.hasPermission) {
        allowedOperations.push({
          operation,
          description: result.description
        });
      }
    });
    
    return allowedOperations;
  }
  
  /**
   * 检查资源访问权限
   * @param {string} resourceType - 资源类型
   * @param {string} action - 操作动作
   * @param {Object} resource - 资源对象
   * @param {Object} user - 用户对象，默认使用当前用户
   * @returns {Object} 权限检查结果
   */
  checkResourcePermission(resourceType, action, resource = null, user = this.currentUser) {
    const operationKey = `${resourceType.toUpperCase()}_${action.toUpperCase()}`;
    const basePermission = this.checkPermission(operationKey, user);
    
    if (!basePermission.hasPermission) {
      return basePermission;
    }
    
    // 资源所有者检查
    if (resource && resource.createdBy) {
      const isOwner = resource.createdBy === user.id;
      const isAdmin = this.isAdmin(user);
      
      // 如果不是管理员且不是资源所有者，某些操作可能被限制
      if (!isAdmin && !isOwner && ['EDIT', 'DELETE'].includes(action.toUpperCase())) {
        return {
          hasPermission: false,
          reason: '只能操作自己创建的资源'
        };
      }
    }
    
    return {
      hasPermission: true,
      reason: null
    };
  }
  
  /**
   * 获取角色级别名称
   * @param {number} level - 角色级别
   * @returns {string} 角色名称
   */
  getLevelName(level) {
    const levelNames = {
      0: '普通用户',
      1: '作者',
      2: '管理员',
      3: '超级管理员'
    };
    return levelNames[level] || '未知';
  }
  
  /**
   * 创建权限装饰器
   * @param {string} operation - 操作类型
   * @returns {Function} 装饰器函数
   */
  requirePermission(operation) {
    return (target, propertyKey, descriptor) => {
      const originalMethod = descriptor.value;
      
      descriptor.value = function(...args) {
        const permissionResult = this.checkPermission(operation);
        if (!permissionResult.hasPermission) {
          throw new Error(`权限不足: ${permissionResult.reason}`);
        }
        return originalMethod.apply(this, args);
      };
      
      return descriptor;
    };
  }
  
  /**
   * 权限中间件生成器
   * @param {string} operation - 操作类型
   * @returns {Function} 中间件函数
   */
  createPermissionMiddleware(operation) {
    return (user) => {
      const result = this.checkPermission(operation, user);
      return {
        allowed: result.hasPermission,
        reason: result.reason,
        operation,
        user: user ? { id: user.id, role: user.role } : null
      };
    };
  }
}

/**
 * 权限检查辅助函数
 */

/**
 * 快速权限检查
 * @param {Object} user - 用户对象
 * @param {string} operation - 操作类型
 * @returns {boolean} 是否有权限
 */
export const hasPermission = (user, operation) => {
  const checker = new AdminPermissionChecker(user);
  return checker.checkPermission(operation).hasPermission;
};

/**
 * 快速管理员检查
 * @param {Object} user - 用户对象
 * @returns {boolean} 是否为管理员
 */
export const isAdmin = (user) => {
  const checker = new AdminPermissionChecker(user);
  return checker.isAdmin();
};

/**
 * 快速超级管理员检查
 * @param {Object} user - 用户对象
 * @returns {boolean} 是否为超级管理员
 */
export const isSuperAdmin = (user) => {
  const checker = new AdminPermissionChecker(user);
  return checker.isSuperAdmin();
};

/**
 * 检查用户操作权限
 * @param {Object} currentUser - 当前用户
 * @param {Object} targetUser - 目标用户
 * @param {string} operation - 操作类型
 * @returns {boolean} 是否可以操作
 */
export const canOperateUser = (currentUser, targetUser, operation) => {
  const checker = new AdminPermissionChecker(currentUser);
  return checker.canOperateUser(targetUser, operation).hasPermission;
};

/**
 * 权限常量导出
 */
export const PERMISSIONS = OPERATION_PERMISSIONS;
export const ROLES = ROLE_LEVELS;

/**
 * 默认权限检查器实例
 */
export const defaultPermissionChecker = new AdminPermissionChecker();

/**
 * 权限检查器工厂函数
 * @param {Object} user - 用户对象
 * @returns {AdminPermissionChecker} 权限检查器实例
 */
export const createPermissionChecker = (user) => {
  return new AdminPermissionChecker(user);
};