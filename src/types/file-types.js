/**
 * 文件上传相关数据类型定义
 */

/**
 * 文件上传响应
 * @typedef {Object} FileUploadResponse
 * @property {string} url - 文件访问URL
 * @property {string} filename - 文件名
 * @property {string} originalName - 原始文件名
 * @property {number} size - 文件大小(字节)
 * @property {string} mimeType - 文件MIME类型
 * @property {string} uploadTime - 上传时间
 */

/**
 * 文件上传进度
 * @typedef {Object} FileUploadProgress
 * @property {number} loaded - 已上传字节数
 * @property {number} total - 总字节数
 * @property {number} percentage - 上传进度百分比 (0-100)
 * @property {string} status - 上传状态 (uploading/success/error)
 */

/**
 * 文件类型配置
 * @typedef {Object} FileTypeConfig
 * @property {string[]} allowedTypes - 允许的文件类型
 * @property {number} maxSize - 最大文件大小(字节)
 * @property {string} uploadPath - 上传路径
 */

/**
 * 图片上传配置
 */
export const IMAGE_UPLOAD_CONFIG = {
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 5 * 1024 * 1024, // 5MB
  uploadPath: '/api/files/upload/image'
}

/**
 * 头像上传配置
 */
export const AVATAR_UPLOAD_CONFIG = {
  allowedTypes: ['image/jpeg', 'image/png'],
  maxSize: 2 * 1024 * 1024, // 2MB
  uploadPath: '/api/users/avatar'
}

/**
 * 书籍封面上传配置
 */
export const BOOK_COVER_UPLOAD_CONFIG = {
  allowedTypes: ['image/jpeg', 'image/png'],
  maxSize: 3 * 1024 * 1024, // 3MB
  uploadPath: '/api/books/{bookId}/cover'
}