/**
 * 类型验证工具函数
 * 用于验证API请求参数和响应数据的类型正确性
 */

import { 
  USER_ROLES, 
  USER_STATUS, 
  BOOK_STATUS, 
  CHAPTER_STATUS, 
  COMMENT_STATUS,
  NOTIFICATION_STATUS,
  NOTIFICATION_TYPES,
  TAG_STATUS
} from './index.js'

/**
 * 验证用户角色
 * @param {string} role - 用户角色
 * @returns {boolean} 是否有效
 */
export function isValidUserRole(role) {
  return Object.values(USER_ROLES).includes(role)
}

/**
 * 验证用户状态
 * @param {string} status - 用户状态
 * @returns {boolean} 是否有效
 */
export function isValidUserStatus(status) {
  return Object.values(USER_STATUS).includes(status)
}

/**
 * 验证书籍状态
 * @param {string} status - 书籍状态
 * @returns {boolean} 是否有效
 */
export function isValidBookStatus(status) {
  return Object.values(BOOK_STATUS).includes(status)
}

/**
 * 验证章节状态
 * @param {string} status - 章节状态
 * @returns {boolean} 是否有效
 */
export function isValidChapterStatus(status) {
  return Object.values(CHAPTER_STATUS).includes(status)
}

/**
 * 验证评论状态
 * @param {string} status - 评论状态
 * @returns {boolean} 是否有效
 */
export function isValidCommentStatus(status) {
  return Object.values(COMMENT_STATUS).includes(status)
}

/**
 * 验证通知状态
 * @param {string} status - 通知状态
 * @returns {boolean} 是否有效
 */
export function isValidNotificationStatus(status) {
  return Object.values(NOTIFICATION_STATUS).includes(status)
}

/**
 * 验证通知类型
 * @param {string} type - 通知类型
 * @returns {boolean} 是否有效
 */
export function isValidNotificationType(type) {
  return Object.values(NOTIFICATION_TYPES).includes(type)
}

/**
 * 验证标签状态
 * @param {string} status - 标签状态
 * @returns {boolean} 是否有效
 */
export function isValidTagStatus(status) {
  return Object.values(TAG_STATUS).includes(status)
}

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证用户名格式
 * @param {string} username - 用户名
 * @returns {boolean} 是否有效
 */
export function isValidUsername(username) {
  // 用户名：3-20位，只能包含字母、数字、下划线
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {boolean} 是否有效
 */
export function isValidPassword(password) {
  // 密码：至少8位，包含字母和数字
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
  return passwordRegex.test(password)
}

/**
 * 验证分页参数
 * @param {Object} pageParams - 分页参数
 * @returns {boolean} 是否有效
 */
export function isValidPageParams(pageParams) {
  const { current, size } = pageParams
  return (
    (!current || (Number.isInteger(current) && current > 0)) &&
    (!size || (Number.isInteger(size) && size > 0 && size <= 100))
  )
}

/**
 * 验证排序参数
 * @param {string} sortOrder - 排序方向
 * @returns {boolean} 是否有效
 */
export function isValidSortOrder(sortOrder) {
  return ['asc', 'desc'].includes(sortOrder)
}

/**
 * 验证文件类型
 * @param {string} mimeType - 文件MIME类型
 * @param {string[]} allowedTypes - 允许的类型列表
 * @returns {boolean} 是否有效
 */
export function isValidFileType(mimeType, allowedTypes) {
  return allowedTypes.includes(mimeType)
}

/**
 * 验证文件大小
 * @param {number} size - 文件大小(字节)
 * @param {number} maxSize - 最大允许大小(字节)
 * @returns {boolean} 是否有效
 */
export function isValidFileSize(size, maxSize) {
  return size > 0 && size <= maxSize
}

/**
 * 验证ID格式
 * @param {*} id - ID值
 * @returns {boolean} 是否有效
 */
export function isValidId(id) {
  return Number.isInteger(id) && id > 0
}

/**
 * 验证ID数组
 * @param {Array} ids - ID数组
 * @returns {boolean} 是否有效
 */
export function isValidIdArray(ids) {
  return Array.isArray(ids) && ids.every(id => isValidId(id))
}

/**
 * 验证字符串长度
 * @param {string} str - 字符串
 * @param {number} minLength - 最小长度
 * @param {number} maxLength - 最大长度
 * @returns {boolean} 是否有效
 */
export function isValidStringLength(str, minLength = 0, maxLength = Infinity) {
  return typeof str === 'string' && str.length >= minLength && str.length <= maxLength
}

/**
 * 验证评分范围
 * @param {number} rating - 评分
 * @returns {boolean} 是否有效
 */
export function isValidRating(rating) {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5
}

/**
 * 验证年龄范围
 * @param {number} age - 年龄
 * @returns {boolean} 是否有效
 */
export function isValidAge(age) {
  return Number.isInteger(age) && age >= 0 && age <= 200
}

/**
 * 验证温度参数 (AI生成)
 * @param {number} temperature - 温度值
 * @returns {boolean} 是否有效
 */
export function isValidTemperature(temperature) {
  return typeof temperature === 'number' && temperature >= 0 && temperature <= 1
}

/**
 * 验证令牌数量 (AI生成)
 * @param {number} tokens - 令牌数量
 * @returns {boolean} 是否有效
 */
export function isValidTokens(tokens) {
  return Number.isInteger(tokens) && tokens > 0 && tokens <= 4000
}