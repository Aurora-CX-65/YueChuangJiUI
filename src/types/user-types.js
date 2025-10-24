/**
 * 用户相关数据类型定义
 */

/**
 * 登录请求参数
 * @typedef {Object} LoginRequest
 * @property {string} username - 用户名
 * @property {string} password - 密码
 */

/**
 * 注册请求参数
 * @typedef {Object} RegisterRequest
 * @property {string} username - 用户名
 * @property {string} email - 邮箱
 * @property {string} password - 密码
 * @property {string} nickname - 昵称
 * @property {string} emailCode - 邮箱验证码
 */

/**
 * 登录响应数据
 * @typedef {Object} LoginResponse
 * @property {string} accessToken - 访问令牌
 * @property {string} refreshToken - 刷新令牌
 * @property {string} tokenType - 令牌类型 (Bearer)
 * @property {number} expiresIn - 过期时间（秒）
 * @property {UserResponse} user - 用户信息
 */

/**
 * 用户响应信息
 * @typedef {Object} UserResponse
 * @property {number} id - 用户ID
 * @property {string} username - 用户名
 * @property {string} email - 邮箱
 * @property {string} nickname - 昵称
 * @property {string} avatar - 头像URL
 * @property {string} bio - 个人简介
 * @property {string} role - 用户角色 (reader/author/editor/admin)
 * @property {string} status - 用户状态 (active/suspended/banned)
 * @property {string} createdTime - 创建时间
 * @property {string} updatedTime - 更新时间
 * @property {UserStats} [stats] - 用户统计信息
 */

/**
 * 用户统计信息
 * @typedef {Object} UserStats
 * @property {number} followingCount - 关注数
 * @property {number} followersCount - 粉丝数
 * @property {number} bookCount - 作品数
 * @property {number} totalWordCount - 总字数
 */

/**
 * 用户更新请求
 * @typedef {Object} UserUpdateRequest
 * @property {string} [nickname] - 昵称
 * @property {string} [bio] - 个人简介
 * @property {string} [avatar] - 头像URL
 */

/**
 * 密码重置请求
 * @typedef {Object} ResetPasswordRequest
 * @property {string} email - 邮箱
 * @property {string} emailCode - 邮箱验证码
 * @property {string} newPassword - 新密码
 */

/**
 * 邮箱验证码发送请求
 * @typedef {Object} SendEmailCodeRequest
 * @property {string} email - 邮箱地址
 * @property {string} type - 验证码类型 (REGISTER/RESET_PASSWORD)
 */

/**
 * 邮箱验证码验证请求
 * @typedef {Object} VerifyEmailCodeRequest
 * @property {string} email - 邮箱地址
 * @property {string} code - 验证码
 * @property {string} type - 验证码类型
 */

/**
 * 用户状态更新请求 (管理员)
 * @typedef {Object} UserStatusUpdateRequest
 * @property {string} status - 新状态 (active/suspended/banned)
 * @property {string} [reason] - 状态变更原因
 */

/**
 * 用户角色更新请求 (管理员)
 * @typedef {Object} UserRoleUpdateRequest
 * @property {string} role - 新角色 (reader/author/editor/admin)
 */

/**
 * 关注状态响应
 * @typedef {Object} FollowStatusResponse
 * @property {boolean} isFollowing - 是否已关注
 * @property {string} followTime - 关注时间
 */