/**
 * API请求参数类型定义
 * 包含所有API接口的请求参数类型
 */

// ==================== 认证相关请求参数 ====================

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
 * 刷新令牌请求参数
 * @typedef {Object} RefreshTokenRequest
 * @property {string} refreshToken - 刷新令牌
 */

/**
 * 发送邮箱验证码请求参数
 * @typedef {Object} SendEmailCodeRequest
 * @property {string} email - 邮箱地址
 * @property {string} type - 验证码类型 (REGISTER/RESET_PASSWORD)
 */

/**
 * 验证邮箱验证码请求参数
 * @typedef {Object} VerifyEmailCodeRequest
 * @property {string} email - 邮箱地址
 * @property {string} code - 验证码
 * @property {string} type - 验证码类型
 */

/**
 * 重置密码请求参数
 * @typedef {Object} ResetPasswordRequest
 * @property {string} email - 邮箱
 * @property {string} emailCode - 邮箱验证码
 * @property {string} newPassword - 新密码
 */

// ==================== 用户相关请求参数 ====================

/**
 * 用户信息更新请求参数
 * @typedef {Object} UserUpdateRequest
 * @property {string} [nickname] - 昵称
 * @property {string} [bio] - 个人简介
 * @property {string} [avatar] - 头像URL
 */

/**
 * 用户搜索请求参数
 * @typedef {Object} UserSearchRequest
 * @property {string} keyword - 搜索关键词
 * @property {number} [current] - 当前页码
 * @property {number} [size] - 每页大小
 */

// ==================== 书籍相关请求参数 ====================

/**
 * 书籍创建请求参数
 * @typedef {Object} BookCreateRequest
 * @property {string} title - 书籍标题
 * @property {string} description - 书籍描述
 * @property {number} categoryId - 分类ID
 * @property {number[]} [tagIds] - 标签ID列表
 * @property {string} [coverImage] - 封面图片URL
 */

/**
 * 书籍更新请求参数
 * @typedef {Object} BookUpdateRequest
 * @property {string} [title] - 书籍标题
 * @property {string} [description] - 书籍描述
 * @property {number} [categoryId] - 分类ID
 * @property {number[]} [tagIds] - 标签ID列表
 * @property {string} [coverImage] - 封面图片URL
 * @property {string} [status] - 书籍状态
 */

/**
 * 书籍搜索请求参数
 * @typedef {Object} BookSearchRequest
 * @property {string} [keyword] - 搜索关键词
 * @property {number} [categoryId] - 分类ID
 * @property {number[]} [tagIds] - 标签ID列表
 * @property {string} [status] - 书籍状态
 * @property {string} [sortBy] - 排序字段 (createdTime/updatedTime/viewCount/likeCount)
 * @property {string} [sortOrder] - 排序方向 (asc/desc)
 * @property {number} [current] - 当前页码
 * @property {number} [size] - 每页大小
 */

/**
 * 书籍查询参数
 * @typedef {Object} BookQueryParams
 * @property {number} [page] - 页码
 * @property {number} [size] - 每页大小
 * @property {string} [keyword] - 搜索关键词
 * @property {number} [categoryId] - 分类ID
 * @property {string} [status] - 书籍状态
 * @property {string} [sortBy] - 排序字段
 * @property {string} [sortOrder] - 排序方向
 */

// ==================== 章节相关请求参数 ====================

/**
 * 章节创建请求参数
 * @typedef {Object} ChapterCreateRequest
 * @property {string} title - 章节标题
 * @property {string} content - 章节内容
 * @property {number} bookId - 书籍ID
 * @property {number} [orderNum] - 章节序号
 */

/**
 * 章节更新请求参数
 * @typedef {Object} ChapterUpdateRequest
 * @property {string} [title] - 章节标题
 * @property {string} [content] - 章节内容
 * @property {number} [orderNum] - 章节序号
 * @property {string} [status] - 章节状态
 */

/**
 * 章节查询参数
 * @typedef {Object} ChapterQueryParams
 * @property {number} bookId - 书籍ID
 * @property {string} [status] - 章节状态
 * @property {number} [current] - 当前页码
 * @property {number} [size] - 每页大小
 */

// ==================== 评论相关请求参数 ====================

/**
 * 评论创建请求参数
 * @typedef {Object} CommentCreateRequest
 * @property {string} content - 评论内容
 * @property {number} bookId - 书籍ID
 * @property {number} [chapterId] - 章节ID
 * @property {number} [parentId] - 父评论ID
 * @property {number} [rating] - 评分(1-5分)
 */

/**
 * 评论更新请求参数
 * @typedef {Object} CommentUpdateRequest
 * @property {string} content - 评论内容
 */

/**
 * 评论查询参数
 * @typedef {Object} CommentQueryParams
 * @property {number} [bookId] - 书籍ID
 * @property {number} [chapterId] - 章节ID
 * @property {number} [parentId] - 父评论ID
 * @property {string} [status] - 评论状态
 * @property {string} [sortBy] - 排序字段 (createdTime/likeCount)
 * @property {string} [sortOrder] - 排序方向 (asc/desc)
 * @property {number} [current] - 当前页码
 * @property {number} [size] - 每页大小
 */

// ==================== 通知相关请求参数 ====================

/**
 * 通知设置请求参数
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

// ==================== 阅读管理相关请求参数 ====================

/**
 * 更新阅读进度请求参数
 * @typedef {Object} UpdateProgressRequest
 * @property {number} bookId - 书籍ID
 * @property {number} chapterId - 章节ID
 * @property {number} position - 阅读位置
 * @property {number} [readingTime] - 本次阅读时长(秒)
 */

/**
 * 创建书签请求参数
 * @typedef {Object} CreateBookmarkRequest
 * @property {number} bookId - 书籍ID
 * @property {number} chapterId - 章节ID
 * @property {number} position - 书签位置
 * @property {string} [note] - 书签备注
 */

/**
 * 更新书签备注请求参数
 * @typedef {Object} UpdateBookmarkNoteRequest
 * @property {string} note - 书签备注
 */

/**
 * 阅读查询参数
 * @typedef {Object} ReadingQueryParams
 * @property {number} [bookId] - 书籍ID
 * @property {string} [startDate] - 开始日期
 * @property {string} [endDate] - 结束日期
 * @property {number} [current] - 当前页码
 * @property {number} [size] - 每页大小
 */

// ==================== 分类标签相关请求参数 ====================

/**
 * 分类创建请求参数
 * @typedef {Object} CategoryCreateRequest
 * @property {string} name - 分类名称
 * @property {string} [description] - 分类描述
 * @property {number} [parentId] - 父分类ID
 * @property {number} [sortOrder] - 排序序号
 */

/**
 * 分类更新请求参数
 * @typedef {Object} CategoryUpdateRequest
 * @property {string} [name] - 分类名称
 * @property {string} [description] - 分类描述
 * @property {number} [parentId] - 父分类ID
 * @property {number} [sortOrder] - 排序序号
 * @property {string} [status] - 状态
 */

/**
 * 标签创建请求参数
 * @typedef {Object} TagCreateRequest
 * @property {string} name - 标签名称
 * @property {string} [color] - 标签颜色
 */

/**
 * 标签更新请求参数
 * @typedef {Object} TagUpdateRequest
 * @property {string} [name] - 标签名称
 * @property {string} [color] - 标签颜色
 * @property {string} [status] - 状态
 */

// ==================== AI功能相关请求参数 ====================

/**
 * AI生成请求参数
 * @typedef {Object} AIGenerateRequest
 * @property {string} prompt - 生成提示词
 * @property {string} type - 生成类型 (character/plot/chapter/title/description)
 * @property {number} [maxTokens] - 最大生成长度
 * @property {number} [temperature] - 生成温度 (0-1)
 * @property {Object} [context] - 上下文信息
 */

/**
 * 人物设定创建请求参数
 * @typedef {Object} CharacterSettingCreateRequest
 * @property {number} bookId - 书籍ID
 * @property {string} name - 人物姓名
 * @property {string} [nickname] - 人物昵称
 * @property {number} [age] - 年龄
 * @property {string} [gender] - 性别
 * @property {string} [appearance] - 外貌描述
 * @property {string} [personality] - 性格描述
 * @property {string} [background] - 背景故事
 * @property {string} [relationships] - 人物关系
 * @property {string} [abilities] - 特殊能力
 * @property {string} [notes] - 备注信息
 */

/**
 * 人物设定更新请求参数
 * @typedef {Object} CharacterSettingUpdateRequest
 * @property {string} [name] - 人物姓名
 * @property {string} [nickname] - 人物昵称
 * @property {number} [age] - 年龄
 * @property {string} [gender] - 性别
 * @property {string} [appearance] - 外貌描述
 * @property {string} [personality] - 性格描述
 * @property {string} [background] - 背景故事
 * @property {string} [relationships] - 人物关系
 * @property {string} [abilities] - 特殊能力
 * @property {string} [notes] - 备注信息
 */

/**
 * 情节大纲创建请求参数
 * @typedef {Object} PlotOutlineCreateRequest
 * @property {number} bookId - 书籍ID
 * @property {string} title - 大纲标题
 * @property {string} content - 大纲内容
 * @property {number} [sortOrder] - 排序序号
 */

/**
 * 情节大纲更新请求参数
 * @typedef {Object} PlotOutlineUpdateRequest
 * @property {string} [title] - 大纲标题
 * @property {string} [content] - 大纲内容
 * @property {number} [sortOrder] - 排序序号
 * @property {string} [status] - 状态
 */

// ==================== 管理员功能相关请求参数 ====================

/**
 * 用户状态更新请求参数 (管理员)
 * @typedef {Object} UserStatusUpdateRequest
 * @property {string} status - 新状态 (active/suspended/banned)
 * @property {string} [reason] - 状态变更原因
 * @property {string} [banUntil] - 封禁截止时间 (临时封禁时使用)
 */

/**
 * 用户角色更新请求参数 (管理员)
 * @typedef {Object} UserRoleUpdateRequest
 * @property {string} role - 新角色 (reader/author/editor/admin)
 */

// ==================== 审核管理相关请求参数 ====================

/**
 * 审核请求参数
 * @typedef {Object} ReviewRequest
 * @property {string} action - 审核动作 (approve/reject)
 * @property {string} [reason] - 审核理由
 * @property {string} [feedback] - 审核反馈
 */

/**
 * 审核查询参数
 * @typedef {Object} ReviewQueryParams
 * @property {string} [type] - 审核类型 (book/chapter/comment)
 * @property {string} [status] - 审核状态 (pending/approved/rejected)
 * @property {number} [current] - 当前页码
 * @property {number} [size] - 每页大小
 */

// ==================== 通用查询参数 ====================

/**
 * 分页查询参数
 * @typedef {Object} PageQuery
 * @property {number} [current] - 当前页码，默认1
 * @property {number} [size] - 每页大小，默认10
 * @property {string} [keyword] - 搜索关键词
 * @property {string} [sortBy] - 排序字段
 * @property {string} [sortOrder] - 排序方向 (asc/desc)
 */

/**
 * ID列表参数
 * @typedef {Object} IdListParams
 * @property {number[]} ids - ID列表
 */

/**
 * 批量操作参数
 * @typedef {Object} BatchOperationParams
 * @property {number[]} ids - 操作对象ID列表
 * @property {string} action - 操作类型
 * @property {Object} [params] - 操作参数
 */