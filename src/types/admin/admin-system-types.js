/**
 * 管理员系统管理相关数据类型定义
 */

/**
 * 系统统计数据
 * @typedef {Object} SystemStatsType
 * @property {UserSystemStats} userStats - 用户统计
 * @property {BookSystemStats} bookStats - 书籍统计
 * @property {ContentSystemStats} contentStats - 内容统计
 * @property {SystemPerformanceStats} performanceStats - 性能统计
 * @property {SystemResourceStats} resourceStats - 资源统计
 * @property {string} lastUpdated - 最后更新时间
 */

/**
 * 用户系统统计
 * @typedef {Object} UserSystemStats
 * @property {number} totalUsers - 总用户数
 * @property {number} activeUsers - 活跃用户数
 * @property {number} newUsersToday - 今日新增用户
 * @property {number} newUsersThisWeek - 本周新增用户
 * @property {number} newUsersThisMonth - 本月新增用户
 * @property {number} onlineUsers - 在线用户数
 * @property {number} suspendedUsers - 被暂停用户数
 * @property {number} bannedUsers - 被封禁用户数
 * @property {UserRoleDistribution} roleDistribution - 角色分布
 */

/**
 * 用户角色分布
 * @typedef {Object} UserRoleDistribution
 * @property {number} readers - 读者数量
 * @property {number} authors - 作者数量
 * @property {number} admins - 管理员数量
 */

/**
 * 书籍系统统计
 * @typedef {Object} BookSystemStats
 * @property {number} totalBooks - 总书籍数
 * @property {number} publishedBooks - 已发布书籍数
 * @property {number} draftBooks - 草稿书籍数
 * @property {number} reviewingBooks - 审核中书籍数
 * @property {number} newBooksToday - 今日新增书籍
 * @property {number} newBooksThisWeek - 本周新增书籍
 * @property {number} newBooksThisMonth - 本月新增书籍
 * @property {number} totalChapters - 总章节数
 * @property {number} totalWords - 总字数
 * @property {BookCategoryDistribution[]} categoryDistribution - 分类分布
 */

/**
 * 书籍分类分布
 * @typedef {Object} BookCategoryDistribution
 * @property {string} categoryName - 分类名称
 * @property {number} bookCount - 书籍数量
 * @property {number} percentage - 占比百分比
 */

/**
 * 内容系统统计
 * @typedef {Object} ContentSystemStats
 * @property {number} totalComments - 总评论数
 * @property {number} newCommentsToday - 今日新增评论
 * @property {number} totalLikes - 总点赞数
 * @property {number} totalCollections - 总收藏数
 * @property {number} totalReadingTime - 总阅读时长(分钟)
 * @property {number} averageReadingTime - 平均阅读时长(分钟)
 * @property {number} pendingReviews - 待审核内容数
 */

/**
 * 系统性能统计
 * @typedef {Object} SystemPerformanceStats
 * @property {number} cpuUsage - CPU使用率(百分比)
 * @property {number} memoryUsage - 内存使用率(百分比)
 * @property {number} diskUsage - 磁盘使用率(百分比)
 * @property {number} networkIn - 网络入流量(MB)
 * @property {number} networkOut - 网络出流量(MB)
 * @property {number} responseTime - 平均响应时间(毫秒)
 * @property {number} errorRate - 错误率(百分比)
 * @property {number} requestsPerSecond - 每秒请求数
 */

/**
 * 系统资源统计
 * @typedef {Object} SystemResourceStats
 * @property {number} totalStorage - 总存储空间(GB)
 * @property {number} usedStorage - 已用存储空间(GB)
 * @property {number} imageStorage - 图片存储(GB)
 * @property {number} documentStorage - 文档存储(GB)
 * @property {number} backupStorage - 备份存储(GB)
 * @property {number} databaseSize - 数据库大小(GB)
 * @property {number} cacheSize - 缓存大小(MB)
 */

/**
 * 操作日志类型
 * @typedef {Object} OperationLogType
 * @property {number} id - 日志ID
 * @property {string} operation - 操作类型
 * @property {string} operationName - 操作名称
 * @property {string} module - 模块名称
 * @property {string} description - 操作描述
 * @property {number} userId - 操作用户ID
 * @property {string} username - 操作用户名
 * @property {string} userRole - 用户角色
 * @property {string} ipAddress - IP地址
 * @property {string} userAgent - 用户代理
 * @property {string} requestUrl - 请求URL
 * @property {string} requestMethod - 请求方法
 * @property {Object} requestParams - 请求参数
 * @property {Object} responseData - 响应数据
 * @property {number} responseTime - 响应时间(毫秒)
 * @property {string} status - 操作状态 (SUCCESS/FAILED/ERROR)
 * @property {string} [errorMessage] - 错误信息
 * @property {string} createdTime - 创建时间
 */

/**
 * 操作日志查询参数
 * @typedef {Object} OperationLogQueryParams
 * @property {number} [page] - 页码
 * @property {number} [size] - 每页大小
 * @property {string} [operation] - 操作类型筛选
 * @property {string} [module] - 模块筛选
 * @property {string} [username] - 用户名筛选
 * @property {string} [status] - 状态筛选
 * @property {string} [startTime] - 开始时间
 * @property {string} [endTime] - 结束时间
 * @property {string} [ipAddress] - IP地址筛选
 * @property {string} [sortBy] - 排序字段
 * @property {string} [sortOrder] - 排序方向
 */

/**
 * 系统设置响应数据
 * @typedef {Object} SystemSettingsResponse
 * @property {GeneralSettings} general - 通用设置
 * @property {SecuritySettings} security - 安全设置
 * @property {ContentSettings} content - 内容设置
 * @property {NotificationSettings} notification - 通知设置
 * @property {StorageSettings} storage - 存储设置
 * @property {string} lastUpdated - 最后更新时间
 * @property {string} updatedBy - 更新者
 */

/**
 * 通用设置
 * @typedef {Object} GeneralSettings
 * @property {string} siteName - 站点名称
 * @property {string} siteDescription - 站点描述
 * @property {string} siteKeywords - 站点关键词
 * @property {string} siteLogo - 站点Logo
 * @property {string} siteIcon - 站点图标
 * @property {boolean} maintenanceMode - 维护模式
 * @property {string} maintenanceMessage - 维护提示信息
 * @property {string} timezone - 时区设置
 * @property {string} language - 默认语言
 */

/**
 * 安全设置
 * @typedef {Object} SecuritySettings
 * @property {boolean} enableRegistration - 是否允许注册
 * @property {boolean} requireEmailVerification - 是否需要邮箱验证
 * @property {number} passwordMinLength - 密码最小长度
 * @property {boolean} passwordRequireSpecialChar - 密码是否需要特殊字符
 * @property {number} maxLoginAttempts - 最大登录尝试次数
 * @property {number} lockoutDuration - 锁定时长(分钟)
 * @property {number} sessionTimeout - 会话超时时间(分钟)
 * @property {boolean} enableTwoFactor - 是否启用双因子认证
 * @property {string[]} allowedIpRanges - 允许的IP范围
 * @property {string[]} blockedIpRanges - 禁止的IP范围
 */

/**
 * 内容设置
 * @typedef {Object} ContentSettings
 * @property {boolean} enableContentReview - 是否启用内容审核
 * @property {boolean} autoPublishAfterReview - 审核通过后自动发布
 * @property {number} maxBookTitleLength - 书籍标题最大长度
 * @property {number} maxChapterTitleLength - 章节标题最大长度
 * @property {number} maxChapterContentLength - 章节内容最大长度
 * @property {string[]} bannedWords - 禁用词汇
 * @property {string[]} sensitiveWords - 敏感词汇
 * @property {boolean} enableComments - 是否允许评论
 * @property {boolean} enableRating - 是否允许评分
 * @property {number} maxCommentLength - 评论最大长度
 */

/**
 * 通知设置
 * @typedef {Object} NotificationSettings
 * @property {boolean} enableEmailNotification - 是否启用邮件通知
 * @property {boolean} enableSmsNotification - 是否启用短信通知
 * @property {boolean} enablePushNotification - 是否启用推送通知
 * @property {string} emailSender - 邮件发送者
 * @property {string} emailTemplate - 邮件模板
 * @property {NotificationTrigger[]} triggers - 通知触发器
 */

/**
 * 通知触发器
 * @typedef {Object} NotificationTrigger
 * @property {string} event - 事件类型
 * @property {string} eventName - 事件名称
 * @property {boolean} emailEnabled - 邮件通知启用
 * @property {boolean} smsEnabled - 短信通知启用
 * @property {boolean} pushEnabled - 推送通知启用
 */

/**
 * 存储设置
 * @typedef {Object} StorageSettings
 * @property {string} storageType - 存储类型 (LOCAL/OSS/S3)
 * @property {number} maxFileSize - 最大文件大小(MB)
 * @property {string[]} allowedFileTypes - 允许的文件类型
 * @property {string} uploadPath - 上传路径
 * @property {boolean} enableImageCompression - 是否启用图片压缩
 * @property {number} imageQuality - 图片质量(1-100)
 * @property {boolean} enableCdn - 是否启用CDN
 * @property {string} cdnDomain - CDN域名
 */

/**
 * 系统设置更新请求
 * @typedef {Object} SystemSettingsRequest
 * @property {GeneralSettings} [general] - 通用设置
 * @property {SecuritySettings} [security] - 安全设置
 * @property {ContentSettings} [content] - 内容设置
 * @property {NotificationSettings} [notification] - 通知设置
 * @property {StorageSettings} [storage] - 存储设置
 */

/**
 * 系统健康检查结果
 * @typedef {Object} SystemHealthCheck
 * @property {string} status - 整体状态 (HEALTHY/WARNING/ERROR)
 * @property {HealthCheckItem[]} checks - 检查项目
 * @property {string} lastCheck - 最后检查时间
 */

/**
 * 健康检查项目
 * @typedef {Object} HealthCheckItem
 * @property {string} name - 检查项目名称
 * @property {string} status - 状态 (PASS/WARN/FAIL)
 * @property {string} [message] - 状态信息
 * @property {number} [responseTime] - 响应时间
 * @property {Object} [details] - 详细信息
 */

/**
 * 系统备份信息
 * @typedef {Object} SystemBackupInfo
 * @property {BackupRecord[]} backups - 备份记录
 * @property {BackupSettings} settings - 备份设置
 * @property {string} nextBackupTime - 下次备份时间
 */

/**
 * 备份记录
 * @typedef {Object} BackupRecord
 * @property {string} id - 备份ID
 * @property {string} name - 备份名称
 * @property {string} type - 备份类型 (FULL/INCREMENTAL)
 * @property {number} size - 备份大小(MB)
 * @property {string} status - 备份状态 (SUCCESS/FAILED/IN_PROGRESS)
 * @property {string} createdTime - 创建时间
 * @property {string} [errorMessage] - 错误信息
 */

/**
 * 备份设置
 * @typedef {Object} BackupSettings
 * @property {boolean} autoBackup - 自动备份
 * @property {string} backupFrequency - 备份频率 (DAILY/WEEKLY/MONTHLY)
 * @property {number} retentionDays - 保留天数
 * @property {string} backupPath - 备份路径
 * @property {boolean} compressBackup - 压缩备份
 */

