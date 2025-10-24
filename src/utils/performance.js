/**
 * 性能优化工具函数库
 * 提供防抖、节流、缓存、懒加载等性能优化功能
 */

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, delay = 300, immediate = false) => {
  let timeoutId;
  let lastCallTime;
  
  return function debounced(...args) {
    const callNow = immediate && !timeoutId;
    
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) {
        func.apply(this, args);
      }
    }, delay);
    
    if (callNow) {
      func.apply(this, args);
    }
    
    lastCallTime = Date.now();
  };
};

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} delay - 节流间隔（毫秒）
 * @param {Object} options - 选项
 * @returns {Function} 节流后的函数
 */
export const throttle = (func, delay = 300, options = {}) => {
  const { leading = true, trailing = true } = options;
  let timeoutId;
  let lastCallTime = 0;
  let lastArgs;
  
  return function throttled(...args) {
    const now = Date.now();
    
    if (!lastCallTime && !leading) {
      lastCallTime = now;
    }
    
    const remaining = delay - (now - lastCallTime);
    lastArgs = args;
    
    if (remaining <= 0 || remaining > delay) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCallTime = now;
      func.apply(this, args);
    } else if (!timeoutId && trailing) {
      timeoutId = setTimeout(() => {
        lastCallTime = leading ? Date.now() : 0;
        timeoutId = null;
        func.apply(this, lastArgs);
      }, remaining);
    }
  };
};

/**
 * 内存缓存类
 */
export class MemoryCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 默认5分钟过期
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  
  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} customTtl - 自定义过期时间
   */
  set(key, value, customTtl) {
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    const expiresAt = Date.now() + (customTtl || this.ttl);
    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now()
    });
  }
  
  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {any} 缓存值或null
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  delete(key) {
    this.cache.delete(key);
  }
  
  /**
   * 清空缓存
   */
  clear() {
    this.cache.clear();
  }
  
  /**
   * 获取缓存大小
   * @returns {number} 缓存项数量
   */
  size() {
    return this.cache.size;
  }
  
  /**
   * 清理过期缓存
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * 请求缓存管理器
 */
export class RequestCache {
  constructor() {
    this.cache = new MemoryCache(50, 2 * 60 * 1000); // 2分钟缓存
    this.pendingRequests = new Map();
  }
  
  /**
   * 生成缓存键
   * @param {string} url - 请求URL
   * @param {Object} params - 请求参数
   * @returns {string} 缓存键
   */
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${url}?${JSON.stringify(sortedParams)}`;
  }
  
  /**
   * 获取缓存的请求结果
   * @param {string} url - 请求URL
   * @param {Object} params - 请求参数
   * @returns {any} 缓存的结果或null
   */
  get(url, params) {
    const key = this.generateKey(url, params);
    return this.cache.get(key);
  }
  
  /**
   * 设置请求结果缓存
   * @param {string} url - 请求URL
   * @param {Object} params - 请求参数
   * @param {any} result - 请求结果
   * @param {number} ttl - 缓存时间
   */
  set(url, params, result, ttl) {
    const key = this.generateKey(url, params);
    this.cache.set(key, result, ttl);
  }
  
  /**
   * 请求去重 - 防止相同请求并发执行
   * @param {string} url - 请求URL
   * @param {Object} params - 请求参数
   * @param {Function} requestFn - 请求函数
   * @returns {Promise} 请求结果
   */
  async dedupe(url, params, requestFn) {
    const key = this.generateKey(url, params);
    
    // 检查是否有相同的请求正在进行
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }
    
    // 执行请求
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }
  
  /**
   * 清除缓存
   * @param {string} pattern - URL模式（可选）
   */
  clear(pattern) {
    if (pattern) {
      // 清除匹配模式的缓存
      for (const [key] of this.cache.cache.entries()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

/**
 * 懒加载管理器
 */
export class LazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };
    
    this.observer = null;
    this.callbacks = new Map();
    this.init();
  }
  
  /**
   * 初始化Intersection Observer
   */
  init() {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      return;
    }
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const callback = this.callbacks.get(entry.target);
          if (callback) {
            callback(entry.target);
            this.unobserve(entry.target);
          }
        }
      });
    }, this.options);
  }
  
  /**
   * 观察元素
   * @param {Element} element - DOM元素
   * @param {Function} callback - 回调函数
   */
  observe(element, callback) {
    if (!this.observer || !element) return;
    
    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }
  
  /**
   * 停止观察元素
   * @param {Element} element - DOM元素
   */
  unobserve(element) {
    if (!this.observer || !element) return;
    
    this.observer.unobserve(element);
    this.callbacks.delete(element);
  }
  
  /**
   * 销毁懒加载管理器
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.callbacks.clear();
    }
  }
}

/**
 * 分页加载管理器
 */
export class PaginationLoader {
  constructor(options = {}) {
    this.options = {
      pageSize: 20,
      preloadThreshold: 5, // 提前5项开始预加载
      maxCachePages: 10,
      ...options
    };
    
    this.currentPage = 1;
    this.totalPages = 0;
    this.totalItems = 0;
    this.isLoading = false;
    this.hasMore = true;
    this.cache = new Map();
    this.data = [];
  }
  
  /**
   * 加载指定页面
   * @param {number} page - 页码
   * @param {Function} loadFn - 加载函数
   * @returns {Promise} 加载结果
   */
  async loadPage(page, loadFn) {
    if (this.isLoading) return;
    
    // 检查缓存
    const cacheKey = `page_${page}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    this.isLoading = true;
    
    try {
      const result = await loadFn(page, this.options.pageSize);
      
      // 更新分页信息
      this.totalPages = result.totalPages || Math.ceil(result.total / this.options.pageSize);
      this.totalItems = result.total || 0;
      this.hasMore = page < this.totalPages;
      
      // 缓存结果
      this.cache.set(cacheKey, result);
      
      // 限制缓存大小
      if (this.cache.size > this.options.maxCachePages) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      
      return result;
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * 加载下一页
   * @param {Function} loadFn - 加载函数
   * @returns {Promise} 加载结果
   */
  async loadNext(loadFn) {
    if (!this.hasMore || this.isLoading) return null;
    
    const nextPage = this.currentPage + 1;
    const result = await this.loadPage(nextPage, loadFn);
    
    if (result && result.records) {
      this.data.push(...result.records);
      this.currentPage = nextPage;
    }
    
    return result;
  }
  
  /**
   * 重置分页状态
   */
  reset() {
    this.currentPage = 1;
    this.totalPages = 0;
    this.totalItems = 0;
    this.hasMore = true;
    this.data = [];
    this.cache.clear();
  }
  
  /**
   * 检查是否需要预加载
   * @param {number} currentIndex - 当前索引
   * @returns {boolean} 是否需要预加载
   */
  shouldPreload(currentIndex) {
    const remainingItems = this.data.length - currentIndex;
    return remainingItems <= this.options.preloadThreshold && this.hasMore;
  }
}

/**
 * 虚拟滚动管理器
 */
export class VirtualScroller {
  constructor(options = {}) {
    this.options = {
      itemHeight: 50,
      containerHeight: 400,
      buffer: 5,
      ...options
    };
    
    this.scrollTop = 0;
    this.visibleStart = 0;
    this.visibleEnd = 0;
    this.totalItems = 0;
  }
  
  /**
   * 更新滚动位置
   * @param {number} scrollTop - 滚动位置
   */
  updateScrollTop(scrollTop) {
    this.scrollTop = scrollTop;
    this.calculateVisibleRange();
  }
  
  /**
   * 设置总项目数
   * @param {number} total - 总项目数
   */
  setTotalItems(total) {
    this.totalItems = total;
    this.calculateVisibleRange();
  }
  
  /**
   * 计算可见范围
   */
  calculateVisibleRange() {
    const { itemHeight, containerHeight, buffer } = this.options;
    
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(this.scrollTop / itemHeight);
    
    this.visibleStart = Math.max(0, startIndex - buffer);
    this.visibleEnd = Math.min(
      this.totalItems - 1,
      startIndex + visibleCount + buffer
    );
  }
  
  /**
   * 获取可见项目
   * @param {Array} items - 所有项目
   * @returns {Array} 可见项目
   */
  getVisibleItems(items) {
    return items.slice(this.visibleStart, this.visibleEnd + 1);
  }
  
  /**
   * 获取偏移样式
   * @returns {Object} 样式对象
   */
  getOffsetStyle() {
    const { itemHeight } = this.options;
    const offsetY = this.visibleStart * itemHeight;
    const totalHeight = this.totalItems * itemHeight;
    
    return {
      transform: `translateY(${offsetY}px)`,
      height: `${totalHeight}px`
    };
  }
}

// 创建全局实例
export const globalRequestCache = new RequestCache();
export const globalLazyLoader = new LazyLoader();

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = new Map();
  }
  
  /**
   * 标记时间点
   * @param {string} name - 标记名称
   */
  mark(name) {
    const timestamp = performance.now();
    this.marks.set(name, timestamp);
    
    if (performance.mark) {
      performance.mark(name);
    }
  }
  
  /**
   * 测量时间间隔
   * @param {string} name - 测量名称
   * @param {string} startMark - 开始标记
   * @param {string} endMark - 结束标记
   * @returns {number} 时间间隔（毫秒）
   */
  measure(name, startMark, endMark) {
    const startTime = this.marks.get(startMark);
    const endTime = this.marks.get(endMark);
    
    if (startTime && endTime) {
      const duration = endTime - startTime;
      this.measures.set(name, duration);
      
      if (performance.measure) {
        performance.measure(name, startMark, endMark);
      }
      
      return duration;
    }
    
    return 0;
  }
  
  /**
   * 获取测量结果
   * @param {string} name - 测量名称
   * @returns {number} 时间间隔
   */
  getMeasure(name) {
    return this.measures.get(name) || 0;
  }
  
  /**
   * 清除标记和测量
   */
  clear() {
    this.marks.clear();
    this.measures.clear();
    
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
  }
}

// 导出全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();