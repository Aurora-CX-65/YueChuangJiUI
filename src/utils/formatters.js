/**
 * 格式化工具函数库
 * 提供日期、数字、文本等格式化功能
 */

/**
 * 日期格式化
 * @param {Date|string|number} date - 日期对象、时间戳或日期字符串
 * @param {string} format - 格式模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '';
  
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return '';
  }
  
  if (isNaN(dateObj.getTime())) return '';
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 相对时间格式化（多久之前）
 * @param {Date|string|number} date - 日期
 * @returns {string} 相对时间描述
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < month) {
    return `${Math.floor(diff / day)}天前`;
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`;
  } else {
    return `${Math.floor(diff / year)}年前`;
  }
};

/**
 * 数字格式化（千分位分隔符）
 * @param {number} num - 数字
 * @param {number} decimals - 小数位数，默认0
 * @returns {string} 格式化后的数字字符串
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  
  const number = Number(num);
  return number.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * 文件大小格式化
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数，默认2
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * 货币格式化
 * @param {number} amount - 金额
 * @param {string} currency - 货币符号，默认'¥'
 * @param {number} decimals - 小数位数，默认2
 * @returns {string} 格式化后的货币字符串
 */
export const formatCurrency = (amount, currency = '¥', decimals = 2) => {
  if (amount === null || amount === undefined || isNaN(amount)) return `${currency}0.00`;
  
  const number = Number(amount);
  const formatted = number.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return `${currency}${formatted}`;
};

/**
 * 百分比格式化
 * @param {number} value - 数值（0-1之间或0-100之间）
 * @param {number} decimals - 小数位数，默认1
 * @param {boolean} isDecimal - 是否为小数形式（0-1），默认false
 * @returns {string} 格式化后的百分比字符串
 */
export const formatPercentage = (value, decimals = 1, isDecimal = false) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  
  const number = Number(value);
  const percentage = isDecimal ? number * 100 : number;
  
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * 文本截断
 * @param {string} text - 原始文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀，默认'...'
 * @returns {string} 截断后的文本
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * 手机号格式化（隐藏中间4位）
 * @param {string} phone - 手机号
 * @returns {string} 格式化后的手机号
 */
export const formatPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length !== 11) return phone;
  
  return `${cleanPhone.substring(0, 3)}****${cleanPhone.substring(7)}`;
};

/**
 * 邮箱格式化（隐藏用户名部分字符）
 * @param {string} email - 邮箱地址
 * @returns {string} 格式化后的邮箱
 */
export const formatEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return email;
  
  const username = email.substring(0, atIndex);
  const domain = email.substring(atIndex);
  
  if (username.length <= 2) return email;
  
  const visibleChars = Math.max(1, Math.floor(username.length / 3));
  const hiddenPart = '*'.repeat(username.length - visibleChars * 2);
  
  return `${username.substring(0, visibleChars)}${hiddenPart}${username.substring(username.length - visibleChars)}${domain}`;
};

/**
 * 数量格式化（大数字简化显示）
 * @param {number} count - 数量
 * @returns {string} 格式化后的数量字符串
 */
export const formatCount = (count) => {
  if (count === null || count === undefined || isNaN(count)) return '0';
  
  const number = Number(count);
  
  if (number < 1000) {
    return number.toString();
  } else if (number < 10000) {
    return `${(number / 1000).toFixed(1)}k`;
  } else if (number < 100000000) {
    return `${(number / 10000).toFixed(1)}万`;
  } else {
    return `${(number / 100000000).toFixed(1)}亿`;
  }
};

/**
 * 时长格式化（秒转换为时分秒）
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时长字符串
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
};

/**
 * 字符串首字母大写
 * @param {string} str - 字符串
 * @returns {string} 首字母大写的字符串
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * 驼峰命名转换为短横线命名
 * @param {string} str - 驼峰命名字符串
 * @returns {string} 短横线命名字符串
 */
export const camelToKebab = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * 短横线命名转换为驼峰命名
 * @param {string} str - 短横线命名字符串
 * @returns {string} 驼峰命名字符串
 */
export const kebabToCamel = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};

/**
 * 生成随机颜色
 * @param {string} format - 颜色格式 'hex' | 'rgb' | 'hsl'
 * @returns {string} 颜色值
 */
export const generateRandomColor = (format = 'hex') => {
  switch (format) {
    case 'hex':
      return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    case 'rgb':
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r}, ${g}, ${b})`;
    case 'hsl':
      const h = Math.floor(Math.random() * 360);
      const s = Math.floor(Math.random() * 100);
      const l = Math.floor(Math.random() * 100);
      return `hsl(${h}, ${s}%, ${l}%)`;
    default:
      return generateRandomColor('hex');
  }
};

/**
 * 格式化器类 - 提供链式调用的格式化功能
 */
export class Formatter {
  constructor(value) {
    this.value = value;
  }
  
  /**
   * 创建格式化器实例
   * @param {any} value - 待格式化的值
   * @returns {Formatter} 格式化器实例
   */
  static create(value) {
    return new Formatter(value);
  }
  
  /**
   * 日期格式化
   * @param {string} format - 格式模板
   * @returns {Formatter} 格式化器实例
   */
  date(format) {
    this.value = formatDate(this.value, format);
    return this;
  }
  
  /**
   * 相对时间格式化
   * @returns {Formatter} 格式化器实例
   */
  relativeTime() {
    this.value = formatRelativeTime(this.value);
    return this;
  }
  
  /**
   * 数字格式化
   * @param {number} decimals - 小数位数
   * @returns {Formatter} 格式化器实例
   */
  number(decimals) {
    this.value = formatNumber(this.value, decimals);
    return this;
  }
  
  /**
   * 文件大小格式化
   * @param {number} decimals - 小数位数
   * @returns {Formatter} 格式化器实例
   */
  fileSize(decimals) {
    this.value = formatFileSize(this.value, decimals);
    return this;
  }
  
  /**
   * 文本截断
   * @param {number} maxLength - 最大长度
   * @param {string} suffix - 后缀
   * @returns {Formatter} 格式化器实例
   */
  truncate(maxLength, suffix) {
    this.value = truncateText(this.value, maxLength, suffix);
    return this;
  }
  
  /**
   * 获取格式化结果
   * @returns {any} 格式化后的值
   */
  toString() {
    return this.value;
  }
  
  /**
   * 获取格式化结果
   * @returns {any} 格式化后的值
   */
  valueOf() {
    return this.value;
  }
}

/**
 * 管理员专用格式化函数
 */

/**
 * 用户状态格式化
 * @param {string} status - 用户状态
 * @returns {Object} 格式化后的状态信息
 */
export const formatUserStatus = (status) => {
  const statusMap = {
    'ACTIVE': { text: '正常', color: 'success', badge: 'success' },
    'SUSPENDED': { text: '暂停', color: 'warning', badge: 'warning' },
    'BANNED': { text: '封禁', color: 'danger', badge: 'danger' },
    'DELETED': { text: '已删除', color: 'secondary', badge: 'secondary' }
  };
  
  const statusInfo = statusMap[status] || { text: '未知', color: 'secondary', badge: 'secondary' };
  
  return {
    text: statusInfo.text,
    color: statusInfo.color,
    badge: statusInfo.badge,
    original: status
  };
};

/**
 * 用户角色格式化
 * @param {string} role - 用户角色
 * @returns {Object} 格式化后的角色信息
 */
export const formatUserRole = (role) => {
  const roleMap = {
    'USER': { text: '普通用户', color: 'primary', icon: 'user' },
    'AUTHOR': { text: '作者', color: 'info', icon: 'edit' },
    'ADMIN': { text: '管理员', color: 'warning', icon: 'shield' },
    'SUPER_ADMIN': { text: '超级管理员', color: 'danger', icon: 'crown' }
  };
  
  const roleInfo = roleMap[role] || { text: '未知角色', color: 'secondary', icon: 'question' };
  
  return {
    text: roleInfo.text,
    color: roleInfo.color,
    icon: roleInfo.icon,
    original: role
  };
};

/**
 * 统计数据格式化（带增长趋势）
 * @param {number} current - 当前值
 * @param {number} previous - 之前值
 * @param {Object} options - 格式化选项
 * @returns {Object} 格式化后的统计信息
 */
export const formatStatistics = (current, previous = 0, options = {}) => {
  const { 
    showTrend = true, 
    showPercentage = true, 
    decimals = 0,
    unit = ''
  } = options;
  
  const currentNum = Number(current) || 0;
  const previousNum = Number(previous) || 0;
  
  const formatted = formatNumber(currentNum, decimals) + unit;
  
  if (!showTrend) {
    return {
      value: formatted,
      current: currentNum,
      previous: previousNum
    };
  }
  
  const difference = currentNum - previousNum;
  const percentageChange = previousNum === 0 ? 
    (currentNum > 0 ? 100 : 0) : 
    ((difference / previousNum) * 100);
  
  let trend = 'stable';
  let trendColor = 'secondary';
  let trendIcon = 'minus';
  
  if (difference > 0) {
    trend = 'up';
    trendColor = 'success';
    trendIcon = 'arrow-up';
  } else if (difference < 0) {
    trend = 'down';
    trendColor = 'danger';
    trendIcon = 'arrow-down';
  }
  
  const result = {
    value: formatted,
    current: currentNum,
    previous: previousNum,
    difference,
    trend,
    trendColor,
    trendIcon,
    differenceText: difference >= 0 ? `+${formatNumber(Math.abs(difference), decimals)}` : `-${formatNumber(Math.abs(difference), decimals)}`
  };
  
  if (showPercentage) {
    result.percentage = Math.abs(percentageChange);
    result.percentageText = `${Math.abs(percentageChange).toFixed(1)}%`;
  }
  
  return result;
};

/**
 * 操作日志时间格式化
 * @param {Date|string|number} date - 日期
 * @returns {Object} 格式化后的时间信息
 */
export const formatLogTime = (date) => {
  if (!date) return { full: '', relative: '', date: '', time: '' };
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return { full: '', relative: '', date: '', time: '' };
  
  const full = formatDate(dateObj, 'YYYY-MM-DD HH:mm:ss');
  const relative = formatRelativeTime(dateObj);
  const dateOnly = formatDate(dateObj, 'YYYY-MM-DD');
  const timeOnly = formatDate(dateObj, 'HH:mm:ss');
  
  return {
    full,
    relative,
    date: dateOnly,
    time: timeOnly,
    timestamp: dateObj.getTime()
  };
};

/**
 * 用户活跃度格式化
 * @param {Date|string|number} lastLoginAt - 最后登录时间
 * @returns {Object} 格式化后的活跃度信息
 */
export const formatUserActivity = (lastLoginAt) => {
  if (!lastLoginAt) {
    return {
      status: 'never',
      text: '从未登录',
      color: 'secondary',
      relative: '从未登录'
    };
  }
  
  const lastLogin = new Date(lastLoginAt);
  if (isNaN(lastLogin.getTime())) {
    return {
      status: 'unknown',
      text: '未知',
      color: 'secondary',
      relative: '未知'
    };
  }
  
  const now = new Date();
  const diffDays = Math.floor((now - lastLogin) / (24 * 60 * 60 * 1000));
  
  let status, text, color;
  
  if (diffDays === 0) {
    status = 'today';
    text = '今日活跃';
    color = 'success';
  } else if (diffDays <= 3) {
    status = 'recent';
    text = '近期活跃';
    color = 'info';
  } else if (diffDays <= 7) {
    status = 'week';
    text = '本周活跃';
    color = 'primary';
  } else if (diffDays <= 30) {
    status = 'month';
    text = '本月活跃';
    color = 'warning';
  } else {
    status = 'inactive';
    text = '不活跃';
    color = 'danger';
  }
  
  return {
    status,
    text,
    color,
    relative: formatRelativeTime(lastLogin),
    days: diffDays,
    lastLogin: formatDate(lastLogin, 'YYYY-MM-DD HH:mm')
  };
};

/**
 * 封禁时间格式化
 * @param {Date|string|number} until - 封禁结束时间
 * @returns {Object} 格式化后的封禁信息
 */
export const formatBanDuration = (until) => {
  if (!until) {
    return {
      status: 'permanent',
      text: '永久封禁',
      color: 'danger',
      remaining: '永久'
    };
  }
  
  const endTime = new Date(until);
  if (isNaN(endTime.getTime())) {
    return {
      status: 'invalid',
      text: '无效时间',
      color: 'secondary',
      remaining: '无效'
    };
  }
  
  const now = new Date();
  const remaining = endTime.getTime() - now.getTime();
  
  if (remaining <= 0) {
    return {
      status: 'expired',
      text: '封禁已到期',
      color: 'success',
      remaining: '已到期',
      endTime: formatDate(endTime, 'YYYY-MM-DD HH:mm')
    };
  }
  
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  
  let remainingText;
  if (days > 0) {
    remainingText = `${days}天${hours}小时`;
  } else if (hours > 0) {
    remainingText = `${hours}小时${minutes}分钟`;
  } else {
    remainingText = `${minutes}分钟`;
  }
  
  return {
    status: 'active',
    text: '封禁中',
    color: 'danger',
    remaining: remainingText,
    endTime: formatDate(endTime, 'YYYY-MM-DD HH:mm'),
    days,
    hours,
    minutes
  };
};

/**
 * 数据增长率格式化
 * @param {number} current - 当前值
 * @param {number} previous - 之前值
 * @returns {Object} 格式化后的增长率信息
 */
export const formatGrowthRate = (current, previous) => {
  const currentNum = Number(current) || 0;
  const previousNum = Number(previous) || 0;
  
  if (previousNum === 0) {
    if (currentNum === 0) {
      return {
        rate: 0,
        text: '0%',
        trend: 'stable',
        color: 'secondary',
        icon: 'minus'
      };
    } else {
      return {
        rate: 100,
        text: '100%',
        trend: 'up',
        color: 'success',
        icon: 'arrow-up'
      };
    }
  }
  
  const rate = ((currentNum - previousNum) / previousNum) * 100;
  const absRate = Math.abs(rate);
  
  let trend, color, icon;
  if (rate > 0) {
    trend = 'up';
    color = 'success';
    icon = 'arrow-up';
  } else if (rate < 0) {
    trend = 'down';
    color = 'danger';
    icon = 'arrow-down';
  } else {
    trend = 'stable';
    color = 'secondary';
    icon = 'minus';
  }
  
  return {
    rate,
    text: `${rate >= 0 ? '+' : ''}${rate.toFixed(1)}%`,
    absText: `${absRate.toFixed(1)}%`,
    trend,
    color,
    icon
  };
};

/**
 * 操作类型格式化
 * @param {string} operation - 操作类型
 * @returns {Object} 格式化后的操作信息
 */
export const formatOperationType = (operation) => {
  const operationMap = {
    'CREATE': { text: '创建', color: 'success', icon: 'plus' },
    'UPDATE': { text: '更新', color: 'info', icon: 'edit' },
    'DELETE': { text: '删除', color: 'danger', icon: 'trash' },
    'BAN': { text: '封禁', color: 'warning', icon: 'ban' },
    'UNBAN': { text: '解封', color: 'success', icon: 'check' },
    'SUSPEND': { text: '暂停', color: 'warning', icon: 'pause' },
    'ACTIVATE': { text: '激活', color: 'success', icon: 'play' },
    'LOGIN': { text: '登录', color: 'primary', icon: 'sign-in' },
    'LOGOUT': { text: '登出', color: 'secondary', icon: 'sign-out' }
  };
  
  const opInfo = operationMap[operation] || { text: operation, color: 'secondary', icon: 'question' };
  
  return {
    text: opInfo.text,
    color: opInfo.color,
    icon: opInfo.icon,
    original: operation
  };
};

/**
 * 内容统计格式化（书籍、评论等）
 * @param {number} count - 数量
 * @param {string} type - 类型
 * @returns {Object} 格式化后的统计信息
 */
export const formatContentStats = (count, type = 'item') => {
  const num = Number(count) || 0;
  
  const typeMap = {
    'book': '本',
    'books': '本',
    'comment': '条',
    'comments': '条',
    'user': '人',
    'users': '人',
    'tag': '个',
    'tags': '个',
    'category': '个',
    'categories': '个',
    'item': '项',
    'items': '项'
  };
  
  const unit = typeMap[type] || '个';
  const formatted = formatCount(num);
  
  return {
    count: num,
    formatted,
    text: `${formatted}${unit}`,
    unit
  };
};

/**
 * 时间范围格式化
 * @param {Date|string|number} startDate - 开始时间
 * @param {Date|string|number} endDate - 结束时间
 * @returns {Object} 格式化后的时间范围信息
 */
export const formatTimeRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return {
      text: '时间范围无效',
      start: '',
      end: '',
      duration: ''
    };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      text: '时间格式无效',
      start: '',
      end: '',
      duration: ''
    };
  }
  
  const startFormatted = formatDate(start, 'YYYY-MM-DD');
  const endFormatted = formatDate(end, 'YYYY-MM-DD');
  
  const duration = end.getTime() - start.getTime();
  const days = Math.floor(duration / (24 * 60 * 60 * 1000));
  
  let durationText;
  if (days === 0) {
    durationText = '当天';
  } else if (days === 1) {
    durationText = '1天';
  } else {
    durationText = `${days}天`;
  }
  
  return {
    text: `${startFormatted} 至 ${endFormatted}`,
    start: startFormatted,
    end: endFormatted,
    duration: durationText,
    days
  };
};

/**
 * 管理员格式化器类扩展
 */
export class AdminFormatter extends Formatter {
  /**
   * 用户状态格式化
   * @returns {AdminFormatter} 格式化器实例
   */
  userStatus() {
    this.value = formatUserStatus(this.value);
    return this;
  }
  
  /**
   * 用户角色格式化
   * @returns {AdminFormatter} 格式化器实例
   */
  userRole() {
    this.value = formatUserRole(this.value);
    return this;
  }
  
  /**
   * 统计数据格式化
   * @param {number} previous - 之前值
   * @param {Object} options - 格式化选项
   * @returns {AdminFormatter} 格式化器实例
   */
  statistics(previous, options) {
    this.value = formatStatistics(this.value, previous, options);
    return this;
  }
  
  /**
   * 用户活跃度格式化
   * @returns {AdminFormatter} 格式化器实例
   */
  userActivity() {
    this.value = formatUserActivity(this.value);
    return this;
  }
  
  /**
   * 封禁时间格式化
   * @returns {AdminFormatter} 格式化器实例
   */
  banDuration() {
    this.value = formatBanDuration(this.value);
    return this;
  }
  
  /**
   * 增长率格式化
   * @param {number} previous - 之前值
   * @returns {AdminFormatter} 格式化器实例
   */
  growthRate(previous) {
    this.value = formatGrowthRate(this.value, previous);
    return this;
  }
  
  /**
   * 操作类型格式化
   * @returns {AdminFormatter} 格式化器实例
   */
  operationType() {
    this.value = formatOperationType(this.value);
    return this;
  }
  
  /**
   * 内容统计格式化
   * @param {string} type - 类型
   * @returns {AdminFormatter} 格式化器实例
   */
  contentStats(type) {
    this.value = formatContentStats(this.value, type);
    return this;
  }
}

/**
 * 创建管理员格式化器实例
 * @param {any} value - 待格式化的值
 * @returns {AdminFormatter} 管理员格式化器实例
 */
export const formatAdmin = (value) => new AdminFormatter(value);

// 导出便捷的格式化函数
export const format = Formatter.create;