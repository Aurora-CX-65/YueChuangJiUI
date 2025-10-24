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

// 导出默认验证器实例
export const defaultValidator = new FormValidator();