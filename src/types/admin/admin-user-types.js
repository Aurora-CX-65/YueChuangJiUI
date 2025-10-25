/**
 * 管理员用户管理相关数据类型定义
 */

/**
 * 管理员用户响应数据
 * @typedef {Object} AdminUserType
 * @property {number} id - 用户ID
 * @property {string} username - 用户名
 * @property {string} email - 邮箱
 * @property {string} nickname - 昵称
 * @property {string} avatar - 头像URL
 * @property {string} bio - 个人简介
 * @property {string} role - 用户角色 (USER/AUTHOR/ADMIN)
 * @property {string} status - 用户状态 (ACTIVE/SUSPENDED/BANNED)
 * @property {string} createdTime - 创建时间
 * @property {string} updatedTime - 更新时间
 * @property {string} lastLoginTime - 最后登录时间
 * @property {number} booksCount - 作品数量
 * @property {number} commentsCount - 评论数量
 * @property {number} followingCount - 关注数
 * @property {number} followersCount - 粉丝数
 * @property {boolean} isBanned - 是否被封禁
 * @property {string} [banReason] - 封禁原因
 * @property {string} [banUntil] - 封禁到期时间
 */

/**
 * 用户状态更新请求
 * @typedef {Object} UserStatusUpdateRequest
 * @property {string} status - 新状态 (ACTIVE/SUSPENDED/BANNED)
 * @property {string} [reason] - 状态变更原因
 */

/**
 * 用户角色更新请求
 * @typedef {Object} UserRoleUpdateRequest
 * @property {string} role - 新角色 (USER/AUTHOR/ADMIN)
 * @property {string} [reason] - 角色变更原因
 */

/**
 * 用户临时封禁请求
 * @typedef {Object} SuspendUserRequest
 * @property {string} reason - 封禁原因
 * @property {string} until - 封禁到期时间 (ISO 8601格式)
 */

/**
 * 用户永久封禁请求
 * @typedef {Object} BanUserRequest
 * @property {string} reason - 封禁原因
 */

/**
 * 用户解封请求
 * @typedef {Object} UnbanUserRequest
 * @property {string} [reason] - 解封原因
 */

/**
 * 封禁日志响应数据
 * @typedef {Object} BanLogResponse
 * @property {number} id - 日志ID
 * @property {number} userId - 被封禁用户ID
 * @property {string} username - 被封禁用户名
 * @property {string} action - 操作类型 (SUSPEND/BAN/UNBAN)
 * @property {string} reason - 操作原因
 * @property {string} [until] - 封禁到期时间
 * @property {number} operatorId - 操作员ID
 * @property {string} operatorName - 操作员用户名
 * @property {string} createdTime - 操作时间
 */

/**
 * 用户查询参数
 * @typedef {Object} UserQueryParams
 * @property {number} [page] - 页码
 * @property {number} [size] - 每页大小
 * @property {string} [keyword] - 搜索关键词
 * @property {string} [status] - 用户状态筛选
 * @property {string} [role] - 用户角色筛选
 */

/**
 * 用户统计数据
 * @typedef {Object} UserStatsType
 * @property {number} totalUsers - 总用户数
 * @property {number} activeUsers - 活跃用户数
 * @property {number} suspendedUsers - 被暂停用户数
 * @property {number} bannedUsers - 被封禁用户数
 * @property {number} todayRegistrations - 今日注册数
 * @property {number} todayActiveUsers - 今日活跃用户数
 * @property {UserRoleStats} roleStats - 角色统计
 */

/**
 * 用户角色统计
 * @typedef {Object} UserRoleStats
 * @property {number} readers - 读者数量
 * @property {number} authors - 作者数量
 * @property {number} admins - 管理员数量
 */

/**
 * 密码重置响应
 * @typedef {Object} PasswordResetResponse
 * @property {string} newPassword - 新密码
 * @property {string} message - 提示信息
 */

/**
 * 批量用户操作请求
 * @typedef {Object} BatchUserOperationRequest
 * @property {number[]} userIds - 用户ID列表
 * @property {string} operation - 操作类型 (UPDATE_STATUS/UPDATE_ROLE/DELETE)
 * @property {Object} data - 操作数据
 * @property {string} [reason] - 操作原因
 */

/**
 * 批量操作结果
 * @typedef {Object} BatchOperationResult
 * @property {number} total - 总数
 * @property {number} success - 成功数
 * @property {number} failed - 失败数
 * @property {BatchOperationError[]} errors - 错误详情
 */

/**
 * 批量操作错误
 * @typedef {Object} BatchOperationError
 * @property {number} userId - 用户ID
 * @property {string} error - 错误信息
 */

/**
 * 用户详情扩展信息
 * @typedef {Object} UserDetailExtension
 * @property {string[]} recentLoginIps - 最近登录IP
 * @property {string} lastLoginDevice - 最后登录设备
 * @property {number} totalLoginCount - 总登录次数
 * @property {BanLogResponse[]} banHistory - 封禁历史
 * @property {UserActivityStats} activityStats - 活动统计
 */

/**
 * 用户活动统计
 * @typedef {Object} UserActivityStats
 * @property {number} totalReadingTime - 总阅读时长(分钟)
 * @property {number} totalWritingTime - 总写作时长(分钟)
 * @property {number} booksPublished - 发布作品数
 * @property {number} chaptersWritten - 写作章节数
 * @property {number} commentsPosted - 发表评论数
 * @property {number} likesReceived - 获得点赞数
 */

export {
  // 主要类型导出，供其他模块使用
  AdminUserType,
  UserStatusUpdateRequest,
  UserRoleUpdateRequest,
  SuspendUserRequest,
  BanUserRequest,
  UnbanUserRequest,
  BanLogResponse,
  UserQueryParams,
  UserStatsType,
  UserRoleStats,
  PasswordResetResponse,
  BatchUserOperationRequest,
  BatchOperationResult,
  BatchOperationError,
  UserDetailExtension,
  UserActivityStats
};