/**
 * 验证工具函数库
 * 提供表单验证、数据验证等辅助函数
 */

/**
 * 邮箱验证规则
 * @param {string} email - 邮箱地址
 * @returns {boolean} 验证结果
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * 手机号验证规则（中国大陆）
 * @param {string} phone - 手机号码
 * @returns {boolean} 验证结果
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * 密码强度验证
 * @param {string} password - 密码
 * @param {Object} options - 验证选项
 * @returns {Object} 验证结果和强度信息
 */
export const validatePassword = (password, options = {}) => {
  const defaultOptions = {
    minLength: 6,
    maxLength: 20,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false
  };
  
  const opts = { ...defaultOptions, ...options };
  
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      strength: 'weak',
      errors: ['密码不能为空']
    };
  }
  
  const errors = [];
  let strength = 'weak';
  let score = 0;
  
  // 长度验证
  if (password.length < opts.minLength) {
    errors.push(`密码长度不能少于${opts.minLength}位`);
  }
  if (password.length > opts.maxLength) {
    errors.push(`密码长度不能超过${opts.maxLength}位`);
  }
  
  // 字符类型验证
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (opts.requireUppercase && !hasUppercase) {
    errors.push('密码必须包含大写字母');
  }
  if (opts.requireLowercase && !hasLowercase) {
    errors.push('密码必须包含小写字母');
  }
  if (opts.requireNumbers && !hasNumbers) {
    errors.push('密码必须包含数字');
  }
  if (opts.requireSpecialChars && !hasSpecialChars) {
    errors.push('密码必须包含特殊字符');
  }
  
  // 计算密码强度
  if (password.length >= 8) score += 1;
  if (hasUppercase) score += 1;
  if (hasLowercase) score += 1;
  if (hasNumbers) score += 1;
  if (hasSpecialChars) score += 1;
  
  if (score >= 4) {
    strength = 'strong';
  } else if (score >= 2) {
    strength = 'medium';
  }
  
  return {
    isValid: errors.length === 0,
    strength,
    score,
    errors
  };
};

/**
 * 用户名验证
 * @param {string} username - 用户名
 * @returns {Object} 验证结果
 */
export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return {
      isValid: false,
      errors: ['用户名不能为空']
    };
  }
  
  const errors = [];
  const trimmedUsername = username.trim();
  
  // 长度验证
  if (trimmedUsername.length < 3) {
    errors.push('用户名长度不能少于3位');
  }
  if (trimmedUsername.length > 20) {
    errors.push('用户名长度不能超过20位');
  }
  
  // 字符验证（只允许字母、数字、下划线）
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(trimmedUsername)) {
    errors.push('用户名只能包含字母、数字和下划线');
  }
  
  // 不能以数字开头
  if (/^\d/.test(trimmedUsername)) {
    errors.push('用户名不能以数字开头');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * URL验证
 * @param {string} url - URL地址
 * @returns {boolean} 验证结果
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 数字验证
 * @param {any} value - 待验证的值
 * @param {Object} options - 验证选项
 * @returns {Object} 验证结果
 */
export const validateNumber = (value, options = {}) => {
  const { min, max, integer = false } = options;
  
  if (value === null || value === undefined || value === '') {
    return {
      isValid: false,
      errors: ['数值不能为空']
    };
  }
  
  const num = Number(value);
  const errors = [];
  
  if (isNaN(num)) {
    errors.push('必须是有效的数字');
    return { isValid: false, errors };
  }
  
  if (integer && !Number.isInteger(num)) {
    errors.push('必须是整数');
  }
  
  if (typeof min === 'number' && num < min) {
    errors.push(`数值不能小于${min}`);
  }
  
  if (typeof max === 'number' && num > max) {
    errors.push(`数值不能大于${max}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: num
  };
};

/**
 * 必填字段验证
 * @param {any} value - 待验证的值
 * @param {string} fieldName - 字段名称
 * @returns {Object} 验证结果
 */
export const validateRequired = (value, fieldName = '字段') => {
  const isEmpty = value === null || 
                  value === undefined || 
                  (typeof value === 'string' && value.trim() === '') ||
                  (Array.isArray(value) && value.length === 0);
  
  return {
    isValid: !isEmpty,
    errors: isEmpty ? [`${fieldName}不能为空`] : []
  };
};

/**
 * 字符串长度验证
 * @param {string} value - 待验证的字符串
 * @param {Object} options - 验证选项
 * @returns {Object} 验证结果
 */
export const validateLength = (value, options = {}) => {
  const { min, max, fieldName = '字段' } = options;
  
  if (!value || typeof value !== 'string') {
    return {
      isValid: false,
      errors: [`${fieldName}必须是字符串`]
    };
  }
  
  const errors = [];
  const length = value.trim().length;
  
  if (typeof min === 'number' && length < min) {
    errors.push(`${fieldName}长度不能少于${min}位`);
  }
  
  if (typeof max === 'number' && length > max) {
    errors.push(`${fieldName}长度不能超过${max}位`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 表单验证器类
 */
export class FormValidator {
  constructor() {
    this.rules = {};
    this.errors = {};
  }
  
  /**
   * 添加验证规则
   * @param {string} field - 字段名
   * @param {Array} rules - 验证规则数组
   */
  addRule(field, rules) {
    this.rules[field] = rules;
  }
  
  /**
   * 验证单个字段
   * @param {string} field - 字段名
   * @param {any} value - 字段值
   * @returns {boolean} 验证结果
   */
  validateField(field, value) {
    const fieldRules = this.rules[field];
    if (!fieldRules) return true;
    
    this.errors[field] = [];
    
    for (const rule of fieldRules) {
      const result = rule.validator(value, rule.options);
      if (!result.isValid) {
        this.errors[field].push(...result.errors);
      }
    }
    
    return this.errors[field].length === 0;
  }
  
  /**
   * 验证整个表单
   * @param {Object} formData - 表单数据
   * @returns {boolean} 验证结果
   */
  validate(formData) {
    let isValid = true;
    this.errors = {};
    
    for (const field in this.rules) {
      const fieldValid = this.validateField(field, formData[field]);
      if (!fieldValid) {
        isValid = false;
      }
    }
    
    return isValid;
  }
  
  /**
   * 获取字段错误信息
   * @param {string} field - 字段名
   * @returns {Array} 错误信息数组
   */
  getFieldErrors(field) {
    return this.errors[field] || [];
  }
  
  /**
   * 获取所有错误信息
   * @returns {Object} 所有错误信息
   */
  getAllErrors() {
    return this.errors;
  }
  
  /**
   * 清除错误信息
   * @param {string} field - 字段名（可选，不传则清除所有）
   */
  clearErrors(field) {
    if (field) {
      delete this.errors[field];
    } else {
      this.errors = {};
    }
  }
}

/**
 * 创建常用的验证规则
 */
export const createValidationRules = {
  required: (fieldName) => ({
    validator: validateRequired,
    options: fieldName
  }),
  
  email: () => ({
    validator: (value) => ({
      isValid: validateEmail(value),
      errors: validateEmail(value) ? [] : ['请输入有效的邮箱地址']
    })
  }),
  
  phone: () => ({
    validator: (value) => ({
      isValid: validatePhone(value),
      errors: validatePhone(value) ? [] : ['请输入有效的手机号码']
    })
  }),
  
  username: () => ({
    validator: validateUsername
  }),
  
  password: (options) => ({
    validator: validatePassword,
    options
  }),
  
  length: (min, max, fieldName) => ({
    validator: validateLength,
    options: { min, max, fieldName }
  }),
  
  number: (options) => ({
    validator: validateNumber,
    options
  })
};

/**
 * 管理员专用验证函数
 */

/**
 * 用户状态验证
 * @param {string} status - 用户状态
 * @returns {Object} 验证结果
 */
export const validateUserStatus = (status) => {
  const validStatuses = ['ACTIVE', 'SUSPENDED', 'BANNED', 'DELETED'];
  
  if (!status || typeof status !== 'string') {
    return {
      isValid: false,
      errors: ['用户状态不能为空']
    };
  }
  
  const upperStatus = status.toUpperCase();
  const isValid = validStatuses.includes(upperStatus);
  
  return {
    isValid,
    errors: isValid ? [] : ['无效的用户状态，必须是：ACTIVE、SUSPENDED、BANNED、DELETED 之一']
  };
};

/**
 * 用户角色验证
 * @param {string} role - 用户角色
 * @returns {Object} 验证结果
 */
export const validateUserRole = (role) => {
  const validRoles = ['USER', 'AUTHOR', 'ADMIN', 'SUPER_ADMIN'];
  
  if (!role || typeof role !== 'string') {
    return {
      isValid: false,
      errors: ['用户角色不能为空']
    };
  }
  
  const upperRole = role.toUpperCase();
  const isValid = validRoles.includes(upperRole);
  
  return {
    isValid,
    errors: isValid ? [] : ['无效的用户角色，必须是：USER、AUTHOR、ADMIN、SUPER_ADMIN 之一']
  };
};

/**
 * 封禁时间验证
 * @param {string|Date} until - 封禁结束时间
 * @returns {Object} 验证结果
 */
export const validateSuspendDuration = (until) => {
  if (!until) {
    return {
      isValid: false,
      errors: ['封禁结束时间不能为空']
    };
  }
  
  const now = new Date();
  const suspendUntil = new Date(until);
  
  if (isNaN(suspendUntil.getTime())) {
    return {
      isValid: false,
      errors: ['封禁结束时间格式无效']
    };
  }
  
  if (suspendUntil <= now) {
    return {
      isValid: false,
      errors: ['封禁结束时间必须晚于当前时间']
    };
  }
  
  // 最长封禁时间为1年
  const maxDuration = 365 * 24 * 60 * 60 * 1000;
  if (suspendUntil.getTime() - now.getTime() > maxDuration) {
    return {
      isValid: false,
      errors: ['封禁时间不能超过1年']
    };
  }
  
  return {
    isValid: true,
    errors: []
  };
};

/**
 * 标签名称验证（管理员级别）
 * @param {string} name - 标签名称
 * @param {Object} options - 验证选项
 * @returns {Object} 验证结果
 */
export const validateAdminTagName = (name, options = {}) => {
  const { 
    minLength = 1, 
    maxLength = 20, 
    allowSpecialChars = false,
    existingNames = []
  } = options;
  
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      errors: ['标签名称不能为空']
    };
  }
  
  const errors = [];
  const trimmedName = name.trim();
  
  // 长度验证
  if (trimmedName.length < minLength) {
    errors.push(`标签名称长度不能少于${minLength}位`);
  }
  if (trimmedName.length > maxLength) {
    errors.push(`标签名称长度不能超过${maxLength}位`);
  }
  
  // 字符验证
  if (!allowSpecialChars) {
    const validCharsRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_\-\s]+$/;
    if (!validCharsRegex.test(trimmedName)) {
      errors.push('标签名称只能包含中文、英文、数字、下划线、连字符和空格');
    }
  }
  
  // 重复性验证
  if (existingNames.includes(trimmedName)) {
    errors.push('标签名称已存在');
  }
  
  // 不能全是空格或特殊字符
  if (!/[\u4e00-\u9fa5a-zA-Z0-9]/.test(trimmedName)) {
    errors.push('标签名称必须包含至少一个中文、英文或数字字符');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 分类名称验证（管理员级别）
 * @param {string} name - 分类名称
 * @param {Object} options - 验证选项
 * @returns {Object} 验证结果
 */
export const validateAdminCategoryName = (name, options = {}) => {
  const { 
    minLength = 1, 
    maxLength = 50, 
    allowSpecialChars = false,
    existingNames = [],
    parentId = null
  } = options;
  
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      errors: ['分类名称不能为空']
    };
  }
  
  const errors = [];
  const trimmedName = name.trim();
  
  // 长度验证
  if (trimmedName.length < minLength) {
    errors.push(`分类名称长度不能少于${minLength}位`);
  }
  if (trimmedName.length > maxLength) {
    errors.push(`分类名称长度不能超过${maxLength}位`);
  }
  
  // 字符验证
  if (!allowSpecialChars) {
    const validCharsRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_\-\s\/]+$/;
    if (!validCharsRegex.test(trimmedName)) {
      errors.push('分类名称只能包含中文、英文、数字、下划线、连字符、空格和斜杠');
    }
  }
  
  // 重复性验证（同级分类下不能重复）
  const duplicateKey = parentId ? `${parentId}_${trimmedName}` : trimmedName;
  if (existingNames.includes(duplicateKey)) {
    errors.push('同级分类下已存在相同名称的分类');
  }
  
  // 不能全是空格或特殊字符
  if (!/[\u4e00-\u9fa5a-zA-Z0-9]/.test(trimmedName)) {
    errors.push('分类名称必须包含至少一个中文、英文或数字字符');
  }
  
  // 不能以斜杠开头或结尾
  if (trimmedName.startsWith('/') || trimmedName.endsWith('/')) {
    errors.push('分类名称不能以斜杠开头或结尾');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 封禁原因验证
 * @param {string} reason - 封禁原因
 * @returns {Object} 验证结果
 */
export const validateBanReason = (reason) => {
  if (!reason || typeof reason !== 'string') {
    return {
      isValid: false,
      errors: ['封禁原因不能为空']
    };
  }
  
  const errors = [];
  const trimmedReason = reason.trim();
  
  if (trimmedReason.length < 5) {
    errors.push('封禁原因不能少于5个字符');
  }
  
  if (trimmedReason.length > 500) {
    errors.push('封禁原因不能超过500个字符');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 管理员操作权限验证
 * @param {Object} currentUser - 当前用户
 * @param {Object} targetUser - 目标用户
 * @param {string} operation - 操作类型
 * @returns {Object} 验证结果
 */
export const validateAdminOperation = (currentUser, targetUser, operation) => {
  if (!currentUser || !currentUser.role) {
    return {
      isValid: false,
      errors: ['当前用户信息无效']
    };
  }
  
  if (!targetUser || !targetUser.id) {
    return {
      isValid: false,
      errors: ['目标用户信息无效']
    };
  }
  
  const errors = [];
  
  // 检查是否为管理员
  if (!['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
    errors.push('权限不足，需要管理员权限');
  }
  
  // 不能操作自己
  if (currentUser.id === targetUser.id) {
    errors.push('不能对自己执行此操作');
  }
  
  // 普通管理员不能操作其他管理员
  if (currentUser.role === 'ADMIN' && ['ADMIN', 'SUPER_ADMIN'].includes(targetUser.role)) {
    errors.push('权限不足，不能操作其他管理员');
  }
  
  // 特定操作的权限检查
  const restrictedOperations = ['DELETE', 'BAN', 'CHANGE_ROLE'];
  if (restrictedOperations.includes(operation) && currentUser.role !== 'SUPER_ADMIN') {
    if (targetUser.role === 'ADMIN') {
      errors.push('权限不足，只有超级管理员才能执行此操作');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 批量操作验证
 * @param {Array} items - 操作项目列表
 * @param {number} maxBatchSize - 最大批量操作数量
 * @returns {Object} 验证结果
 */
export const validateBatchOperation = (items, maxBatchSize = 100) => {
  if (!Array.isArray(items)) {
    return {
      isValid: false,
      errors: ['操作项目必须是数组']
    };
  }
  
  const errors = [];
  
  if (items.length === 0) {
    errors.push('操作项目不能为空');
  }
  
  if (items.length > maxBatchSize) {
    errors.push(`批量操作数量不能超过${maxBatchSize}项`);
  }
  
  // 检查是否有重复项
  const uniqueIds = new Set(items.map(item => item.id || item));
  if (uniqueIds.size !== items.length) {
    errors.push('操作项目中存在重复项');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 创建管理员验证规则
 */
export const createAdminValidationRules = {
  userStatus: () => ({
    validator: validateUserStatus
  }),
  
  userRole: () => ({
    validator: validateUserRole
  }),
  
  suspendDuration: () => ({
    validator: validateSuspendDuration
  }),
  
  adminTagName: (options) => ({
    validator: validateAdminTagName,
    options
  }),
  
  adminCategoryName: (options) => ({
    validator: validateAdminCategoryName,
    options
  }),
  
  banReason: () => ({
    validator: validateBanReason
  }),
  
  adminOperation: (currentUser, operation) => ({
    validator: (targetUser) => validateAdminOperation(currentUser, targetUser, operation)
  }),
  
  batchOperation: (maxBatchSize) => ({
    validator: (items) => validateBatchOperation(items, maxBatchSize)
  })
};

// 导出默认验证器实例
export const defaultValidator = new FormValidator();