# 工具函数库

这个工具库为阅创集Vue 3应用程序提供了完整的HTTP客户端、状态管理、错误处理和各种实用工具函数。

## 核心组件

### 1. HttpClient - HTTP客户端

基于fetch API的HTTP客户端，支持请求拦截器、响应拦截器和统一错误处理。

```javascript
import { httpClient } from '@/utils'

// GET请求
const users = await httpClient.get('/api/users', { page: 1, size: 10 })

// POST请求
const newUser = await httpClient.post('/api/users', {
  username: 'testuser',
  email: 'test@example.com'
})

// PUT请求
const updatedUser = await httpClient.put('/api/users/1', {
  nickname: '新昵称'
})

// DELETE请求
await httpClient.delete('/api/users/1')

// 文件上传
const formData = new FormData()
formData.append('file', file)
const result = await httpClient.upload('/api/files/upload', formData)
```

### 2. TokenManager - JWT令牌管理

管理JWT令牌的存储、验证和刷新。

```javascript
import { TokenManager } from '@/utils'

// 检查是否已认证
const isAuthenticated = TokenManager.isAuthenticated()

// 获取令牌
const token = TokenManager.getToken()

// 设置认证数据
TokenManager.setAuthData({
  accessToken: 'xxx',
  refreshToken: 'xxx',
  expiresIn: 86400
})

// 获取用户信息
const userInfo = TokenManager.getUserFromToken()

// 清除认证
TokenManager.clearAuth()
```

### 3. ErrorHandler - 错误处理

统一的错误处理和通知系统。

```javascript
import { ErrorHandler, handleApiError, showSuccess, showWarning } from '@/utils'

// 基础错误处理
try {
  // 一些可能出错的操作
} catch (error) {
  ErrorHandler.handleError(error, {
    showNotification: true,
    logError: true,
    customMessage: '自定义错误消息'
  })
}

// 简化的API错误处理
try {
  const result = await httpClient.get('/api/books')
} catch (error) {
  handleApiError(error)
}

// 显示成功消息
showSuccess('操作成功完成')

// 显示警告消息
showWarning('请注意数据变更')

// 带错误处理的函数包装器
import { withErrorHandling, withRetry } from '@/utils'

const safeApiCall = withErrorHandling(async () => {
  return await httpClient.get('/api/data')
}, {
  errorMessage: '获取数据失败',
  successMessage: '数据获取成功'
})

// 带重试的API调用
const retryApiCall = withRetry(async () => {
  return await httpClient.post('/api/submit', data)
}, {
  maxRetries: 3,
  delay: 1000
})
```

### 4. NotificationManager - 通知管理

统一的通知显示系统，支持多种通知组件。

```javascript
import { notificationManager } from '@/utils'

// 显示不同类型的通知
notificationManager.success('操作成功')
notificationManager.error('操作失败')
notificationManager.warning('请注意')
notificationManager.info('提示信息')

// 自定义通知选项
notificationManager.show('自定义消息', 'success', {
  duration: 8000,
  showClose: true
})
```

### 5. LoadingManager - 加载状态管理

管理全局和局部的加载状态。

```javascript
import { loadingManager } from '@/utils'

// 在Vue组件中使用
export default {
  setup() {
    const globalLoading = loadingManager.getGlobalLoading()
    const isBookListLoading = computed(() => 
      loadingManager.getLocalLoading('books-list')
    )
    
    return {
      globalLoading,
      isBookListLoading
    }
  }
}

// 带加载状态的请求
const loadBooks = loadingManager.withLoading(async () => {
  return await httpClient.get('/api/books')
}, {
  global: true,
  local: 'books-list'
})
```

## 新增工具函数库

### 6. Validators - 验证工具

提供表单验证和数据验证功能。

```javascript
import { validateEmail, validatePassword, FormValidator, createValidationRules } from '@/utils'

// 基础验证
const isValidEmail = validateEmail('user@example.com')
const phoneValid = validatePhone('13800138000')

// 密码强度验证
const passwordResult = validatePassword('myPassword123', {
  minLength: 8,
  requireNumbers: true,
  requireUppercase: true
})

// 表单验证器
const validator = new FormValidator()
validator.addRule('email', [createValidationRules.email()])
validator.addRule('password', [createValidationRules.password({ minLength: 8 })])

const isFormValid = validator.validate({
  email: 'user@example.com',
  password: 'myPassword123'
})
```

### 7. Formatters - 格式化工具

提供各种数据格式化功能。

```javascript
import { 
  formatDate, 
  formatFileSize, 
  formatCount, 
  formatCurrency,
  formatRelativeTime,
  truncateText,
  format 
} from '@/utils'

// 日期格式化
const dateStr = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
const relativeTime = formatRelativeTime(new Date(Date.now() - 3600000)) // "1小时前"

// 数字和文件大小格式化
const sizeStr = formatFileSize(1024 * 1024) // "1.00 MB"
const countStr = formatCount(12345) // "1.2万"
const priceStr = formatCurrency(99.99) // "¥99.99"

// 文本处理
const shortText = truncateText('这是一段很长的文本内容', 10) // "这是一段很长的..."

// 链式格式化
const result = format(new Date())
  .date('YYYY-MM-DD')
  .toString()
```

### 8. Performance - 性能优化工具

提供防抖、节流、缓存等性能优化功能。

```javascript
import { 
  debounce, 
  throttle, 
  MemoryCache, 
  RequestCache,
  LazyLoader,
  PaginationLoader,
  globalRequestCache 
} from '@/utils'

// 防抖和节流
const debouncedSearch = debounce((query) => {
  // 搜索逻辑
}, 300)

const throttledScroll = throttle(() => {
  // 滚动处理
}, 100)

// 缓存使用
const cache = new MemoryCache()
cache.set('user-data', userData, 5000) // 5秒过期
const cachedData = cache.get('user-data')

// 请求缓存
const requestCache = new RequestCache()
const cachedResult = await requestCache.dedupe('/api/users', {}, async () => {
  return await httpClient.get('/api/users')
})

// 懒加载
const lazyLoader = new LazyLoader()
lazyLoader.observe(element, (el) => {
  // 元素进入视口时的回调
})

// 分页加载
const paginationLoader = new PaginationLoader({
  pageSize: 20
})
const nextPage = await paginationLoader.loadNext(async (page, size) => {
  return await httpClient.get('/api/books', { page, size })
})
```

### 9. FileUtils - 文件处理工具

提供文件上传、验证、压缩等功能。

```javascript
import { 
  validateFile, 
  compressImage, 
  generateImagePreview,
  FileUploader,
  downloadFile,
  createFileSelector,
  FILE_TYPES 
} from '@/utils'

// 文件验证
const validation = validateFile(file, {
  allowedTypes: ['image'],
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedExtensions: ['jpg', 'png', 'gif']
})

// 图片处理
const compressedFile = await compressImage(imageFile, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8
})

const previewUrl = await generateImagePreview(imageFile, {
  maxWidth: 200,
  maxHeight: 200
})

// 文件上传
const uploader = new FileUploader({
  url: '/api/files/upload',
  concurrent: 3
})

uploader.onProgress = (taskId, progress) => {
  console.log(`上传进度: ${progress}%`)
}

uploader.onSuccess = (taskId, result) => {
  console.log('上传成功:', result)
}

const taskIds = uploader.addFiles([file1, file2])

// 文件选择
const files = await createFileSelector({
  accept: 'image/*',
  multiple: true
})

// 文件下载
downloadFile('/api/files/download/123', 'document.pdf')
```

### 10. UrlUtils - URL和参数处理工具

提供URL构建和参数处理功能。

```javascript
import { 
  parseQueryParams, 
  buildUrl, 
  updateQueryParams,
  UrlBuilder, 
  deepLinkManager,
  stateSyncManager 
} from '@/utils'

// 查询参数处理
const params = parseQueryParams('?page=1&size=10&tags=1&tags=2')
const queryString = buildQueryString({ page: 1, size: 10 })

// URL构建
const apiUrl = buildUrl('/api/users', '', { page: 1, size: 10 })

// URL构建器
const complexUrl = UrlBuilder.create('/api')
  .path('users')
  .path('123')
  .query('include', 'profile')
  .query({ expand: 'stats' })
  .hash('section1')
  .build()

// 更新当前页面URL参数
const newUrl = updateQueryParams({ 
  page: 2, 
  keyword: 'search' 
})

// 深度链接管理
deepLinkManager.addListener('bookList', (newState, oldState) => {
  // 处理URL变化，更新组件状态
  if (newState.params.page !== oldState.params.page) {
    loadBooks(newState.params.page)
  }
})

// 状态同步
stateSyncManager.addSyncRule('bookPage', {
  paramName: 'page',
  statePath: 'book.currentPage',
  serialize: (value) => String(value),
  deserialize: (value) => parseInt(value) || 1
})
```

## 拦截器系统

### 请求拦截器

- **认证拦截器**: 自动添加JWT令牌到请求头
- **加载状态拦截器**: 管理请求的加载状态
- **请求ID拦截器**: 为每个请求添加唯一ID
- **内容类型拦截器**: 自动设置Content-Type
- **令牌刷新拦截器**: 自动刷新即将过期的令牌

### 响应拦截器

- **状态检查拦截器**: 检查HTTP状态码
- **响应格式拦截器**: 统一处理响应格式
- **日志拦截器**: 记录响应日志
- **加载状态拦截器**: 结束加载状态

### 自定义拦截器

```javascript
import { httpClient, RequestInterceptors, ResponseInterceptors } from '@/utils'

// 添加自定义请求拦截器
httpClient.addRequestInterceptor((url, options) => {
  options.headers['X-Custom-Header'] = 'custom-value'
  return { url, options }
})

// 添加自定义响应拦截器
httpClient.addResponseInterceptor((response) => {
  console.log('自定义响应处理:', response)
  return response
})
```

## 配置

### API配置

在 `src/config/api-config.js` 中配置API相关设置：

```javascript
export const API_CONFIG = {
  baseURL: 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  auth: {
    tokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
    tokenPrefix: 'Bearer '
  },
  errorCodes: {
    200: '操作成功',
    201: '未授权访问',
    // ...更多错误码
  }
}
```

### 环境变量

在 `.env.development` 和 `.env.production` 中配置环境变量：

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=30000
VITE_APP_TITLE=阅创集
VITE_APP_VERSION=1.0.0
```

## 使用指南

### 导入方式

```javascript
// 导入单个工具
import { httpClient } from '@/utils/http-client.js'
import { validateEmail } from '@/utils/validators.js'

// 导入多个工具
import { 
  httpClient, 
  TokenManager, 
  validateEmail,
  formatDate,
  debounce
} from '@/utils'

// 命名空间导入
import { utils } from '@/utils'
const isValid = utils.validators.validateEmail('test@example.com')
```

## 错误处理

### 错误类型

1. **HTTP错误**: 4xx, 5xx状态码
2. **网络错误**: 连接失败、超时等
3. **业务错误**: 后端返回的业务错误码
4. **JavaScript错误**: 运行时错误

### 错误处理流程

1. 响应拦截器捕获错误
2. 解析错误信息和错误码
3. 特殊错误处理（如401自动登出）
4. 显示用户友好的错误通知
5. 记录错误日志

## 最佳实践

### 1. 使用统一的响应格式

确保后端API返回统一的Result格式：

```javascript
{
  code: 200,
  message: "操作成功",
  data: { /* 实际数据 */ },
  timestamp: 1760700624525
}
```

### 2. 合理使用加载状态

```javascript
// 全局加载 - 用于页面级别的操作
await httpClient.get('/api/books', {}, { showGlobalLoading: true })

// 局部加载 - 用于组件级别的操作
await httpClient.get('/api/books', {}, { localLoadingKey: 'books-list' })
```

### 3. 表单验证

```javascript
// 使用验证器进行表单验证
const validator = new FormValidator()
validator.addRule('email', [createValidationRules.email()])
validator.addRule('password', [createValidationRules.password({ minLength: 8 })])

const handleSubmit = (formData) => {
  if (validator.validate(formData)) {
    // 提交表单
  } else {
    // 显示验证错误
    const errors = validator.getAllErrors()
  }
}
```

### 4. 性能优化

```javascript
// 使用防抖优化搜索
const debouncedSearch = debounce(async (keyword) => {
  const results = await httpClient.get('/api/search', { keyword })
  // 更新搜索结果
}, 300)

// 使用缓存减少重复请求
const getCachedUserData = async (userId) => {
  const cacheKey = `user-${userId}`
  let userData = globalRequestCache.get('/api/users/' + userId, {})
  
  if (!userData) {
    userData = await httpClient.get(`/api/users/${userId}`)
    globalRequestCache.set('/api/users/' + userId, {}, userData, 5 * 60 * 1000) // 5分钟缓存
  }
  
  return userData
}
```

### 5. 文件处理

```javascript
// 文件上传前验证和压缩
const handleFileUpload = async (file) => {
  // 验证文件
  const validation = validateFile(file, {
    allowedTypes: ['image'],
    maxSize: 5 * 1024 * 1024
  })
  
  if (!validation.isValid) {
    showError(validation.errors.join(', '))
    return
  }
  
  // 压缩图片
  let processedFile = file
  if (file.type.startsWith('image/')) {
    processedFile = await compressImage(file, {
      maxWidth: 1920,
      quality: 0.8
    })
  }
  
  // 上传文件
  const uploader = new FileUploader()
  const taskIds = uploader.addFiles([processedFile])
  
  return taskIds[0]
}
```

## 与Pinia集成

```javascript
// 在Pinia store中使用
import { defineStore } from 'pinia'
import { httpClient, debounce, formatRelativeTime } from '@/utils'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    isAuthenticated: false,
    searchResults: [],
    searchKeyword: ''
  }),
  
  getters: {
    formattedLastLogin: (state) => {
      return state.currentUser?.lastLoginTime 
        ? formatRelativeTime(state.currentUser.lastLoginTime)
        : ''
    }
  },
  
  actions: {
    async login(credentials) {
      const response = await httpClient.post('/api/auth/login', credentials)
      this.currentUser = response.user
      this.isAuthenticated = true
      return response
    },
    
    // 防抖搜索
    searchUsers: debounce(async function(keyword) {
      this.searchKeyword = keyword
      if (keyword.trim()) {
        this.searchResults = await httpClient.get('/api/users/search', { keyword })
      } else {
        this.searchResults = []
      }
    }, 300),
    
    async logout() {
      await httpClient.post('/api/auth/logout')
      this.currentUser = null
      this.isAuthenticated = false
    }
  }
})
```

## 调试和日志

在开发环境下，HTTP客户端会自动记录详细的请求和响应日志。可以在浏览器控制台中查看：

- 📡 Request logs: 请求详情
- 📡 Response logs: 响应详情
- 🚨 Error logs: 错误详情

## 性能优化

1. **请求去重**: 自动防止重复请求
2. **请求缓存**: 缓存GET请求结果
3. **令牌刷新**: 自动刷新即将过期的令牌
4. **加载状态优化**: 防止加载状态闪烁
5. **防抖节流**: 优化用户交互响应
6. **懒加载**: 按需加载内容
7. **虚拟滚动**: 处理大数据集
8. **文件压缩**: 减少上传文件大小