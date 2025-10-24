/**
 * 工具函数库统一导出
 * 提供所有工具函数的便捷访问
 */

// 导入现有工具的类和实例
import { HttpClient, httpClient } from './http-client.js';
import { TokenManager } from './token-manager.js';
import { ErrorHandler } from './error-handler.js';
import { LoadingManager, loadingManager } from './loading-manager.js';
import { NotificationManager, notificationManager } from './notification-manager.js';

// 新增工具函数库 - 使用命名导出
export * from './validators.js';
export * from './formatters.js';
export * from './performance.js';
export * from './file-utils.js';
export * from './url-utils.js';

// 现有工具 - 导出类和实例
export { 
  HttpClient, 
  httpClient,
  TokenManager,
  ErrorHandler,
  LoadingManager,
  loadingManager,
  NotificationManager,
  notificationManager
};

// 导入拦截器
export * from './interceptors.js';

/**
 * 工具函数集合对象
 * 提供命名空间访问方式
 */
import * as validators from './validators.js';
import * as formatters from './formatters.js';
import * as performance from './performance.js';
import * as fileUtils from './file-utils.js';
import * as urlUtils from './url-utils.js';

export const utils = {
  validators,
  formatters,
  performance,
  fileUtils,
  urlUtils
};

/**
 * 常用工具函数快捷访问
 */
export { 
  // 验证
  validateEmail,
  validatePhone,
  validatePassword,
  validateUsername,
  FormValidator,
  defaultValidator
} from './validators.js';

export {
  // 格式化
  formatDate,
  formatRelativeTime,
  formatNumber,
  formatFileSize,
  formatCurrency,
  formatPercentage,
  truncateText,
  formatCount,
  Formatter,
  format
} from './formatters.js';

export {
  // 性能优化
  debounce,
  throttle,
  MemoryCache,
  RequestCache,
  LazyLoader,
  PaginationLoader,
  globalRequestCache,
  globalLazyLoader,
  performanceMonitor
} from './performance.js';

export {
  // 文件处理
  validateFile,
  readFile,
  compressImage,
  generateImagePreview,
  FileUploader,
  downloadFile,
  createFileSelector,
  defaultUploader,
  FILE_TYPES,
  getFileType,
  getFileExtension
} from './file-utils.js';

export {
  // URL处理
  parseQueryParams,
  buildQueryString,
  buildUrl,
  updateQueryParams,
  removeQueryParams,
  parsePathParams,
  buildPath,
  isAbsoluteUrl,
  isRelativeUrl,
  DeepLinkManager,
  StateSyncManager,
  UrlBuilder,
  deepLinkManager,
  stateSyncManager
} from './url-utils.js';