/**
 * 通知相关数据类型定义
 */

/**
 * 通知响应信息
 * @typedef {Object} NotificationResponse
 * @property {number} id - 通知ID
 * @property {number} userId - 接收用户ID
 * @property {string} title - 通知标题
 * @property {string} content - 通知内容
 * @property {string} type - 通知类型 (system/comment_reply/follow_update/audit_result/book_update)
 * @property {number} [relatedId] - 关联对象ID
 * @property {string} status - 状态 (unread/read/deleted)
 * @property {string} createdAt - 创建时间
 * @property {string} [readAt] - 阅读时间
 */

/**
 * 通知设置响应
 * @typedef {Object} NotificationSettingsResponse
 * @property {boolean} systemNotifications - 系统通知
 * @property {boolean} commentReplyNotifications - 评论回复通知
 * @property {boolean} followUpdateNotifications - 关注更新通知
 * @property {boolean} auditResultNotifications - 审核结果通知
 * @property {boolean} bookUpdateNotifications - 书籍更新通知
 * @property {boolean} emailNotifications - 邮件通知
 */

/**
 * 通知设置请求
 * @typedef {Object} NotificationSettingsRequest
 * @property {boolean} [systemNotifications] - 系统通知
 * @property {boolean} [commentReplyNotifications] - 评论回复通知
 * @property {boolean} [followUpdateNotifications] - 关注更新通知
 * @property {boolean} [auditResultNotifications] - 审核结果通知
 * @property {boolean} [bookUpdateNotifications] - 书籍更新通知
 * @property {boolean} [emailNotifications] - 邮件通知
 */

/**
 * 通知查询参数
 * @typedef {Object} NotificationQueryParams
 * @property {string} [type] - 通知类型
 * @property {string} [status] - 通知状态
 * @property {number} [current] - 当前页码
 * @property {number} [size] - 每页大小
 */

/**
 * 通知统计信息
 * @typedef {Object} NotificationStats
 * @property {number} unreadCount - 未读通知数
 * @property {number} totalCount - 总通知数
 */