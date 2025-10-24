/**
 * 阅读管理相关数据类型定义
 */

/**
 * 阅读进度响应
 * @typedef {Object} ReadingProgressResponse
 * @property {number} id - 进度记录ID
 * @property {number} userId - 用户ID
 * @property {number} bookId - 书籍ID
 * @property {string} bookTitle - 书籍标题
 * @property {number} chapterId - 当前章节ID
 * @property {string} chapterTitle - 当前章节标题
 * @property {number} position - 阅读位置
 * @property {number} progress - 阅读进度百分比 (0-100)
 * @property {number} totalReadingTime - 总阅读时长(秒)
 * @property {string} lastReadTime - 最后阅读时间
 * @property {string} createdTime - 创建时间
 * @property {string} updatedTime - 更新时间
 */

/**
 * 更新阅读进度请求
 * @typedef {Object} UpdateProgressRequest
 * @property {number} bookId - 书籍ID
 * @property {number} chapterId - 章节ID
 * @property {number} position - 阅读位置
 * @property {number} [readingTime] - 本次阅读时长(秒)
 */

/**
 * 书签响应
 * @typedef {Object} BookmarkResponse
 * @property {number} id - 书签ID
 * @property {number} userId - 用户ID
 * @property {number} bookId - 书籍ID
 * @property {string} bookTitle - 书籍标题
 * @property {number} chapterId - 章节ID
 * @property {string} chapterTitle - 章节标题
 * @property {number} position - 书签位置
 * @property {string} [note] - 书签备注
 * @property {string} createdTime - 创建时间
 * @property {string} updatedTime - 更新时间
 */

/**
 * 创建书签请求
 * @typedef {Object} CreateBookmarkRequest
 * @property {number} bookId - 书籍ID
 * @property {number} chapterId - 章节ID
 * @property {number} position - 书签位置
 * @property {string} [note] - 书签备注
 */

/**
 * 更新书签备注请求
 * @typedef {Object} UpdateBookmarkNoteRequest
 * @property {string} note - 书签备注
 */

/**
 * 阅读历史响应
 * @typedef {Object} ReadingHistoryResponse
 * @property {number} id - 历史记录ID
 * @property {number} userId - 用户ID
 * @property {number} bookId - 书籍ID
 * @property {string} bookTitle - 书籍标题
 * @property {string} bookCover - 书籍封面
 * @property {number} chapterId - 章节ID
 * @property {string} chapterTitle - 章节标题
 * @property {number} readingTime - 阅读时长(秒)
 * @property {string} readTime - 阅读时间
 */

/**
 * 阅读统计响应
 * @typedef {Object} ReadingStatsResponse
 * @property {number} totalBooks - 总阅读书籍数
 * @property {number} totalChapters - 总阅读章节数
 * @property {number} totalReadingTime - 总阅读时长(秒)
 * @property {number} averageReadingTime - 平均每日阅读时长(秒)
 * @property {number} currentStreak - 当前连续阅读天数
 * @property {number} longestStreak - 最长连续阅读天数
 * @property {Object[]} dailyStats - 每日阅读统计
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