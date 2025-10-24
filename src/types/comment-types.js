/**
 * 评论相关数据类型定义
 */

/**
 * 评论响应信息
 * @typedef {Object} CommentResponse
 * @property {number} id - 评论ID
 * @property {string} content - 评论内容
 * @property {number} userId - 用户ID
 * @property {string} username - 用户名
 * @property {string} userNickname - 用户昵称
 * @property {string} userAvatar - 用户头像
 * @property {number} bookId - 书籍ID
 * @property {string} bookTitle - 书籍标题
 * @property {number} [chapterId] - 章节ID
 * @property {string} [chapterTitle] - 章节标题
 * @property {number} [parentId] - 父评论ID
 * @property {number} likeCount - 点赞数
 * @property {boolean} isLiked - 是否已点赞
 * @property {string} status - 评论状态 (pending/approved/rejected/deleted)
 * @property {string} createdTime - 创建时间
 * @property {string} updatedTime - 更新时间
 * @property {CommentResponse[]} [replies] - 回复列表
 */

/**
 * 评论创建请求
 * @typedef {Object} CommentCreateRequest
 * @property {string} content - 评论内容
 * @property {number} bookId - 书籍ID
 * @property {number} [chapterId] - 章节ID
 * @property {number} [parentId] - 父评论ID
 */

/**
 * 评论更新请求
 * @typedef {Object} CommentUpdateRequest
 * @property {string} content - 评论内容
 */

/**
 * 评论查询参数
 * @typedef {Object} CommentQueryParams
 * @property {number} [bookId] - 书籍ID
 * @property {number} [chapterId] - 章节ID
 * @property {number} [parentId] - 父评论ID
 * @property {string} [sortBy] - 排序字段 (createdTime/likeCount)
 * @property {string} [sortOrder] - 排序方向 (asc/desc)
 * @property {number} [current] - 当前页码
 * @property {number} [size] - 每页大小
 */