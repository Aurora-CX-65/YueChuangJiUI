/**
 * Pinia Store 配置
 * 
 * 定义通用的store配置选项和工具函数
 */

/**
 * 通用的持久化配置
 */
export const createPersistConfig = (key, paths = []) => ({
  key: `yuechuangji-${key}`,
  storage: localStorage,
  paths: paths.length > 0 ? paths : undefined,
  // 序列化配置
  serializer: {
    serialize: JSON.stringify,
    deserialize: JSON.parse
  },
  // 在hydration之前执行
  beforeRestore: (context) => {
    console.log(`正在恢复 ${key} store 的状态...`)
  },
  // 在hydration之后执行
  afterRestore: (context) => {
    console.log(`${key} store 状态恢复完成`)
  }
})

/**
 * 通用的分页状态
 */
export const createPaginationState = () => ({
  current: 1,
  size: 10,
  total: 0,
  pages: 0
})

/**
 * 通用的加载状态
 */
export const createLoadingState = () => ({
  loading: false,
  error: null,
  lastUpdated: null
})

/**
 * 通用的搜索状态
 */
export const createSearchState = () => ({
  keyword: '',
  filters: {},
  results: [],
  pagination: createPaginationState(),
  ...createLoadingState()
})

/**
 * 通用的列表状态
 */
export const createListState = () => ({
  items: [],
  pagination: createPaginationState(),
  ...createLoadingState()
})

/**
 * 通用的详情状态
 */
export const createDetailState = () => ({
  item: null,
  ...createLoadingState()
})

/**
 * 通用的错误处理action
 */
export const createErrorHandler = (storeName) => {
  return function handleError(error, action = '操作') {
    console.error(`${storeName} - ${action}失败:`, error)
    this.error = error.message || `${action}失败`
    this.loading = false
    
    // 可以在这里添加全局错误通知
    if (window.notificationManager) {
      window.notificationManager.error(`${action}失败: ${error.message || '未知错误'}`)
    }
  }
}

/**
 * 通用的加载状态管理
 */
export const createLoadingManager = () => {
  return {
    startLoading() {
      this.loading = true
      this.error = null
    },
    
    stopLoading() {
      this.loading = false
      this.lastUpdated = new Date().toISOString()
    },
    
    setError(error) {
      this.error = error
      this.loading = false
    }
  }
}

/**
 * 通用的分页管理
 */
export const createPaginationManager = () => {
  return {
    updatePagination(paginationData) {
      if (paginationData) {
        this.pagination.current = paginationData.current || 1
        this.pagination.size = paginationData.size || 10
        this.pagination.total = paginationData.total || 0
        this.pagination.pages = Math.ceil(this.pagination.total / this.pagination.size)
      }
    },
    
    resetPagination() {
      this.pagination = createPaginationState()
    },
    
    nextPage() {
      if (this.pagination.current < this.pagination.pages) {
        this.pagination.current++
        return true
      }
      return false
    },
    
    prevPage() {
      if (this.pagination.current > 1) {
        this.pagination.current--
        return true
      }
      return false
    },
    
    goToPage(page) {
      if (page >= 1 && page <= this.pagination.pages) {
        this.pagination.current = page
        return true
      }
      return false
    }
  }
}