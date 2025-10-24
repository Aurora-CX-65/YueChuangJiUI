/**
 * 基础类型定义
 * 定义项目中使用的通用数据类型
 */

/**
 * 统一响应格式
 * @typedef {Object} Result
 * @property {number} code - 响应码 (200: 成功, 201: 未授权, 400: 参数错误, 403: 权限不足, 404: 资源不存在, 409: 资源冲突, 429: 请求频率过高, 500: 服务器错误)
 * @property {string} message - 响应消息
 * @property {*} data - 响应数据
 * @property {number} timestamp - 时间戳
 */

/**
 * 分页响应格式
 * @typedef {Object} PageResult
 * @property {Array} records - 数据列表
 * @property {number} total - 总记录数
 * @property {number} current - 当前页码
 * @property {number} size - 每页大小
 */

/**
 * 分页查询参数
 * @typedef {Object} PageQuery
 * @property {number} current - 当前页码，默认1
 * @property {number} size - 每页大小，默认10
 * @property {string} [keyword] - 搜索关键词
 * @property {string} [sortBy] - 排序字段
 * @property {string} [sortOrder] - 排序方向 (asc/desc)
 */

/**
 * 错误响应码映射
 */
export const ERROR_CODES = {
    200: '操作成功',
    201: '未授权访问',
    400: '请求参数错误',
    403: '权限不足',
    404: '资源不存在',
    409: '资源冲突',
    429: '请求频率过高',
    500: '服务器内部错误'
}

// 导出所有类型定义模块
export * from './user-types.js'
export * from './book-types.js'
export * from './comment-types.js'
export * from './notification-types.js'
export * from './category-types.js'
export * from './reading-types.js'
export * from './ai-types.js'
export * from './file-types.js'
export * from './request-types.js'
export * from './type-validators.js'

/**
 * HTTP请求方法枚举
 */
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH'
}

/**
 * 用户角色枚举
 */
export const USER_ROLES = {
    READER: 'reader',
    AUTHOR: 'author',
    EDITOR: 'editor',
    ADMIN: 'admin'
}

/**
 * 用户状态枚举
 */
export const USER_STATUS = {
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    BANNED: 'banned'
}

/**
 * 书籍状态枚举
 */
export const BOOK_STATUS = {
    DRAFT: 'draft',
    PENDING_REVIEW: 'pending_review',
    PUBLISHED: 'published',
    SERIALIZING: 'serializing',
    COMPLETED: 'completed',
    SUSPENDED: 'suspended'
}

/**
 * 章节状态枚举
 */
export const CHAPTER_STATUS = {
    DRAFT: 'draft',
    PENDING_REVIEW: 'pending_review',
    PUBLISHED: 'published'
}

/**
 * 评论状态枚举
 */
export const COMMENT_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    DELETED: 'deleted'
}

/**
 * 通知状态枚举
 */
export const NOTIFICATION_STATUS = {
    UNREAD: 'unread',
    READ: 'read',
    DELETED: 'deleted'
}

/**
 * 通知类型枚举
 */
export const NOTIFICATION_TYPES = {
    SYSTEM: 'system',
    COMMENT_REPLY: 'comment_reply',
    FOLLOW_UPDATE: 'follow_update',
    AUDIT_RESULT: 'audit_result',
    BOOK_UPDATE: 'book_update'
}

/**
 * 标签状态枚举
 */
export const TAG_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
}