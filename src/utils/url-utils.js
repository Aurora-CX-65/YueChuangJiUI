/**
 * URL和参数处理工具函数库
 * 提供URL构建、查询参数处理、路由参数解析等功能
 */

/**
 * 解析URL查询参数
 * @param {string} url - URL字符串，默认使用当前页面URL
 * @returns {Object} 查询参数对象
 */
export const parseQueryParams = (url = window.location.href) => {
  const params = {};
  
  try {
    const urlObj = new URL(url);
    const searchParams = urlObj.searchParams;
    
    for (const [key, value] of searchParams.entries()) {
      // 处理数组参数（如 ?tags=1&tags=2）
      if (params[key]) {
        if (Array.isArray(params[key])) {
          params[key].push(value);
        } else {
          params[key] = [params[key], value];
        }
      } else {
        params[key] = value;
      }
    }
  } catch (error) {
    console.warn('URL解析失败:', error);
  }
  
  return params;
};

/**
 * 构建查询参数字符串
 * @param {Object} params - 参数对象
 * @param {Object} options - 选项
 * @returns {string} 查询参数字符串
 */
export const buildQueryString = (params, options = {}) => {
  const { 
    encode = true, 
    arrayFormat = 'repeat', // 'repeat' | 'bracket' | 'comma'
    skipNull = true,
    skipEmpty = true
  } = options;
  
  if (!params || typeof params !== 'object') {
    return '';
  }
  
  const pairs = [];
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    
    // 跳过null值
    if (skipNull && (value === null || value === undefined)) {
      return;
    }
    
    // 跳过空字符串
    if (skipEmpty && value === '') {
      return;
    }
    
    const encodedKey = encode ? encodeURIComponent(key) : key;
    
    if (Array.isArray(value)) {
      // 处理数组参数
      switch (arrayFormat) {
        case 'bracket':
          value.forEach(item => {
            const encodedValue = encode ? encodeURIComponent(item) : item;
            pairs.push(`${encodedKey}[]=${encodedValue}`);
          });
          break;
        case 'comma':
          const encodedValue = encode ? encodeURIComponent(value.join(',')) : value.join(',');
          pairs.push(`${encodedKey}=${encodedValue}`);
          break;
        case 'repeat':
        default:
          value.forEach(item => {
            const encodedValue = encode ? encodeURIComponent(item) : item;
            pairs.push(`${encodedKey}=${encodedValue}`);
          });
          break;
      }
    } else {
      const encodedValue = encode ? encodeURIComponent(value) : value;
      pairs.push(`${encodedKey}=${encodedValue}`);
    }
  });
  
  return pairs.join('&');
};

/**
 * 构建完整URL
 * @param {string} baseUrl - 基础URL
 * @param {string} path - 路径
 * @param {Object} params - 查询参数
 * @param {Object} options - 选项
 * @returns {string} 完整URL
 */
export const buildUrl = (baseUrl, path = '', params = {}, options = {}) => {
  let url = baseUrl;
  
  // 添加路径
  if (path) {
    // 确保baseUrl以/结尾，path不以/开头
    if (!url.endsWith('/') && !path.startsWith('/')) {
      url += '/';
    } else if (url.endsWith('/') && path.startsWith('/')) {
      path = path.substring(1);
    }
    url += path;
  }
  
  // 添加查询参数
  const queryString = buildQueryString(params, options);
  if (queryString) {
    const separator = url.includes('?') ? '&' : '?';
    url += separator + queryString;
  }
  
  return url;
};

/**
 * 更新URL查询参数
 * @param {Object} params - 要更新的参数
 * @param {Object} options - 选项
 * @returns {string} 新的URL
 */
export const updateQueryParams = (params, options = {}) => {
  const { 
    url = window.location.href,
    replace = false, // 是否替换所有参数
    removeEmpty = true
  } = options;
  
  try {
    const urlObj = new URL(url);
    
    if (replace) {
      // 替换所有参数
      urlObj.search = '';
    }
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      
      if (value === null || value === undefined || (removeEmpty && value === '')) {
        urlObj.searchParams.delete(key);
      } else if (Array.isArray(value)) {
        urlObj.searchParams.delete(key);
        value.forEach(item => {
          urlObj.searchParams.append(key, item);
        });
      } else {
        urlObj.searchParams.set(key, value);
      }
    });
    
    return urlObj.toString();
  } catch (error) {
    console.warn('URL更新失败:', error);
    return url;
  }
};

/**
 * 移除URL查询参数
 * @param {string|string[]} keys - 要移除的参数键
 * @param {string} url - URL字符串
 * @returns {string} 新的URL
 */
export const removeQueryParams = (keys, url = window.location.href) => {
  try {
    const urlObj = new URL(url);
    const keysArray = Array.isArray(keys) ? keys : [keys];
    
    keysArray.forEach(key => {
      urlObj.searchParams.delete(key);
    });
    
    return urlObj.toString();
  } catch (error) {
    console.warn('URL参数移除失败:', error);
    return url;
  }
};

/**
 * 解析路径参数
 * @param {string} pattern - 路径模式，如 '/users/:id/posts/:postId'
 * @param {string} path - 实际路径，如 '/users/123/posts/456'
 * @returns {Object} 路径参数对象
 */
export const parsePathParams = (pattern, path) => {
  const params = {};
  
  if (!pattern || !path) {
    return params;
  }
  
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  
  if (patternParts.length !== pathParts.length) {
    return params;
  }
  
  patternParts.forEach((part, index) => {
    if (part.startsWith(':')) {
      const paramName = part.substring(1);
      params[paramName] = decodeURIComponent(pathParts[index]);
    }
  });
  
  return params;
};

/**
 * 构建路径
 * @param {string} pattern - 路径模式
 * @param {Object} params - 路径参数
 * @returns {string} 构建的路径
 */
export const buildPath = (pattern, params = {}) => {
  if (!pattern) return '';
  
  let path = pattern;
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined) {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    }
  });
  
  return path;
};

/**
 * 检查URL是否为绝对URL
 * @param {string} url - URL字符串
 * @returns {boolean} 是否为绝对URL
 */
export const isAbsoluteUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 检查URL是否为相对URL
 * @param {string} url - URL字符串
 * @returns {boolean} 是否为相对URL
 */
export const isRelativeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return !isAbsoluteUrl(url);
};

/**
 * 获取URL的域名
 * @param {string} url - URL字符串
 * @returns {string} 域名
 */
export const getDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
};

/**
 * 获取URL的协议
 * @param {string} url - URL字符串
 * @returns {string} 协议
 */
export const getProtocol = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol;
  } catch {
    return '';
  }
};

/**
 * 检查两个URL是否同源
 * @param {string} url1 - 第一个URL
 * @param {string} url2 - 第二个URL
 * @returns {boolean} 是否同源
 */
export const isSameOrigin = (url1, url2) => {
  try {
    const urlObj1 = new URL(url1);
    const urlObj2 = new URL(url2);
    
    return urlObj1.origin === urlObj2.origin;
  } catch {
    return false;
  }
};

/**
 * 深度链接管理器
 */
export class DeepLinkManager {
  constructor() {
    this.listeners = new Map();
    this.currentState = this.getCurrentState();
    this.init();
  }
  
  /**
   * 初始化深度链接管理器
   */
  init() {
    // 监听浏览器前进后退
    window.addEventListener('popstate', (event) => {
      const newState = this.getCurrentState();
      this.notifyListeners(newState, this.currentState);
      this.currentState = newState;
    });
    
    // 监听hash变化
    window.addEventListener('hashchange', (event) => {
      const newState = this.getCurrentState();
      this.notifyListeners(newState, this.currentState);
      this.currentState = newState;
    });
  }
  
  /**
   * 获取当前状态
   * @returns {Object} 当前状态
   */
  getCurrentState() {
    return {
      url: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      params: parseQueryParams(),
      timestamp: Date.now()
    };
  }
  
  /**
   * 添加状态变化监听器
   * @param {string} key - 监听器键
   * @param {Function} callback - 回调函数
   */
  addListener(key, callback) {
    this.listeners.set(key, callback);
  }
  
  /**
   * 移除状态变化监听器
   * @param {string} key - 监听器键
   */
  removeListener(key) {
    this.listeners.delete(key);
  }
  
  /**
   * 通知所有监听器
   * @param {Object} newState - 新状态
   * @param {Object} oldState - 旧状态
   */
  notifyListeners(newState, oldState) {
    this.listeners.forEach((callback) => {
      try {
        callback(newState, oldState);
      } catch (error) {
        console.error('深度链接监听器执行失败:', error);
      }
    });
  }
  
  /**
   * 更新URL状态
   * @param {Object} params - 参数对象
   * @param {Object} options - 选项
   */
  updateState(params, options = {}) {
    const { replace = false, title = document.title } = options;
    
    const newUrl = updateQueryParams(params, { replace: false });
    const newState = { ...this.currentState, params };
    
    if (replace) {
      window.history.replaceState(newState, title, newUrl);
    } else {
      window.history.pushState(newState, title, newUrl);
    }
    
    const oldState = this.currentState;
    this.currentState = this.getCurrentState();
    this.notifyListeners(this.currentState, oldState);
  }
  
  /**
   * 导航到指定URL
   * @param {string} url - 目标URL
   * @param {Object} options - 选项
   */
  navigate(url, options = {}) {
    const { replace = false, title = document.title } = options;
    
    const newState = { url, timestamp: Date.now() };
    
    if (replace) {
      window.history.replaceState(newState, title, url);
    } else {
      window.history.pushState(newState, title, url);
    }
    
    const oldState = this.currentState;
    this.currentState = this.getCurrentState();
    this.notifyListeners(this.currentState, oldState);
  }
  
  /**
   * 后退
   */
  back() {
    window.history.back();
  }
  
  /**
   * 前进
   */
  forward() {
    window.history.forward();
  }
  
  /**
   * 跳转到历史记录中的指定位置
   * @param {number} delta - 跳转步数
   */
  go(delta) {
    window.history.go(delta);
  }
}

/**
 * 状态同步管理器
 */
export class StateSyncManager {
  constructor() {
    this.syncRules = new Map();
    this.deepLinkManager = new DeepLinkManager();
    this.init();
  }
  
  /**
   * 初始化状态同步管理器
   */
  init() {
    this.deepLinkManager.addListener('stateSyncManager', (newState, oldState) => {
      this.syncStateFromUrl(newState);
    });
  }
  
  /**
   * 添加同步规则
   * @param {string} key - 规则键
   * @param {Object} rule - 同步规则
   */
  addSyncRule(key, rule) {
    const {
      paramName, // URL参数名
      statePath, // 状态路径
      serialize, // 序列化函数
      deserialize, // 反序列化函数
      defaultValue // 默认值
    } = rule;
    
    this.syncRules.set(key, {
      paramName,
      statePath,
      serialize: serialize || ((value) => String(value)),
      deserialize: deserialize || ((value) => value),
      defaultValue
    });
  }
  
  /**
   * 移除同步规则
   * @param {string} key - 规则键
   */
  removeSyncRule(key) {
    this.syncRules.delete(key);
  }
  
  /**
   * 从URL同步状态
   * @param {Object} urlState - URL状态
   */
  syncStateFromUrl(urlState) {
    const params = urlState.params;
    
    this.syncRules.forEach((rule, key) => {
      const paramValue = params[rule.paramName];
      let stateValue = rule.defaultValue;
      
      if (paramValue !== undefined) {
        try {
          stateValue = rule.deserialize(paramValue);
        } catch (error) {
          console.warn(`状态反序列化失败 (${key}):`, error);
        }
      }
      
      // 这里可以集成到状态管理系统（如Pinia）
      this.updateState(rule.statePath, stateValue);
    });
  }
  
  /**
   * 同步状态到URL
   * @param {Object} state - 应用状态
   */
  syncStateToUrl(state) {
    const params = {};
    
    this.syncRules.forEach((rule, key) => {
      const stateValue = this.getStateValue(state, rule.statePath);
      
      if (stateValue !== undefined && stateValue !== rule.defaultValue) {
        try {
          params[rule.paramName] = rule.serialize(stateValue);
        } catch (error) {
          console.warn(`状态序列化失败 (${key}):`, error);
        }
      }
    });
    
    this.deepLinkManager.updateState(params, { replace: true });
  }
  
  /**
   * 获取状态值
   * @param {Object} state - 状态对象
   * @param {string} path - 状态路径
   * @returns {any} 状态值
   */
  getStateValue(state, path) {
    return path.split('.').reduce((obj, key) => obj?.[key], state);
  }
  
  /**
   * 更新状态值
   * @param {string} path - 状态路径
   * @param {any} value - 新值
   */
  updateState(path, value) {
    // 这里应该集成到实际的状态管理系统
    console.log(`更新状态 ${path}:`, value);
  }
}

/**
 * URL工具类
 */
export class UrlBuilder {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.pathSegments = [];
    this.queryParams = {};
    this.hashFragment = '';
  }
  
  /**
   * 创建URL构建器
   * @param {string} baseUrl - 基础URL
   * @returns {UrlBuilder} URL构建器实例
   */
  static create(baseUrl) {
    return new UrlBuilder(baseUrl);
  }
  
  /**
   * 添加路径段
   * @param {string} segment - 路径段
   * @returns {UrlBuilder} URL构建器实例
   */
  path(segment) {
    if (segment) {
      this.pathSegments.push(encodeURIComponent(segment));
    }
    return this;
  }
  
  /**
   * 添加查询参数
   * @param {string|Object} key - 参数键或参数对象
   * @param {any} value - 参数值
   * @returns {UrlBuilder} URL构建器实例
   */
  query(key, value) {
    if (typeof key === 'object') {
      Object.assign(this.queryParams, key);
    } else if (key && value !== undefined) {
      this.queryParams[key] = value;
    }
    return this;
  }
  
  /**
   * 设置hash片段
   * @param {string} fragment - hash片段
   * @returns {UrlBuilder} URL构建器实例
   */
  hash(fragment) {
    this.hashFragment = fragment;
    return this;
  }
  
  /**
   * 构建URL
   * @returns {string} 完整URL
   */
  build() {
    let url = this.baseUrl;
    
    // 添加路径
    if (this.pathSegments.length > 0) {
      const pathString = this.pathSegments.join('/');
      if (!url.endsWith('/') && !pathString.startsWith('/')) {
        url += '/';
      }
      url += pathString;
    }
    
    // 添加查询参数
    const queryString = buildQueryString(this.queryParams);
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
    
    // 添加hash
    if (this.hashFragment) {
      url += '#' + encodeURIComponent(this.hashFragment);
    }
    
    return url;
  }
  
  /**
   * 转换为字符串
   * @returns {string} URL字符串
   */
  toString() {
    return this.build();
  }
}

// 导出全局实例
export const deepLinkManager = new DeepLinkManager();
export const stateSyncManager = new StateSyncManager();