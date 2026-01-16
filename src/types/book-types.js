/**
 * 书籍相关数据类型定义
 */

/**
 * 书籍响应信息
 * @typedef {Object} BookResponse
 * @property {number} id - 书籍ID
 * @property {string} title - 书籍标题
 * @property {string} description - 书籍描述
 * @property {string} coverImage - 封面图片URL
 * @property {AuthorInfo} author - 作者信息
 * @property {CategoryInfo} category - 分类信息
 * @property {TagInfo[]} tags - 标签列表
 * @property {string} status - 书籍状态 (draft/pending_review/published/serializing/completed/suspended)
 * @property {number} wordCount - 字数
 * @property {number} chapterCount - 章节数
 * @property {number} viewCount - 阅读量
 * @property {number} likeCount - 点赞数
 * @property {number} favoriteCount - 收藏数
 * @property {boolean} isLiked - 是否已点赞
 * @property {boolean} isFavorited - 是否已收藏
 * @property {string} createdTime - 创建时间
 * @property {string} updatedTime - 更新时间
 */

/**
 * 作者信息
 * @typedef {Object} AuthorInfo
 * @property {number} id - 作者ID
 * @property {string} nickname - 作者昵称
 * @property {string} avatar - 作者头像URL
 */

/**
 * 分类信息
 * @typedef {Object} CategoryInfo
 * @property {number} id - 分类ID
 * @property {string} name - 分类名称
 * @property {string} [description] - 分类描述
 */

/**
 * 标签信息
 * @typedef {Object} TagInfo
 * @property {number} id - 标签ID
 * @property {string} name - 标签名称
 * @property {string} [color] - 标签颜色
 */

/**
 * 书籍创建请求
 * @typedef {Object} BookCreateRequest
 * @property {string} title - 书籍标题
 * @property {string} description - 书籍描述
 * @property {number} categoryId - 分类ID
 * @property {number[]} [tagIds] - 标签ID列表
 * @property {string} [coverImage] - 封面图片URL
 */

/**
 * 书籍更新请求
 * @typedef {Object} BookUpdateRequest
 * @property {string} [title] - 书籍标题
 * @property {string} [description] - 书籍描述
 * @property {number} [categoryId] - 分类ID
 * @property {number[]} [tagIds] - 标签ID列表
 * @property {string} [coverImage] - 封面图片URL
 * @property {string} [status] - 书籍状态
 */

/**
 * 书籍搜索请求
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
 * 章节响应信息
 * @typedef {Object} ChapterResponse
 * @property {number} id - 章节ID
 * @property {string} title - 章节标题
 * @property {string} content - 章节内容
 * @property {number} bookId - 书籍ID
 * @property {string} bookTitle - 书籍标题
 * @property {number} authorId - 作者ID
 * @property {string} authorName - 作者昵称
 * @property {number} sortOrder - 章节序号
 * @property {number} wordCount - 字数
 * @property {number} viewCount - 阅读量
 * @property {string} status - 章节状态 (draft/pending_review/published)
 * @property {string} createdAt - 创建时间
 * @property {string} updatedAt - 更新时间
 */

/**
 * 章节创建请求
 * @typedef {Object} ChapterCreateRequest
 * @property {string} title - 章节标题
 * @property {string} content - 章节内容
 * @property {number} bookId - 书籍ID
 * @property {number} [sortOrder] - 章节序号
 */

/**
 * 章节更新请求
 * @typedef {Object} ChapterUpdateRequest
 * @property {string} [title] - 章节标题
 * @property {string} [content] - 章节内容
 * @property {number} [sortOrder] - 章节序号
 * @property {string} [status] - 章节状态
 */

/**
 * 点赞状态响应
 * @typedef {Object} LikeStatusResponse
 * @property {boolean} isLiked - 是否已点赞
 * @property {string} [likeTime] - 点赞时间
 */

/**
 * 收藏状态响应
 * @typedef {Object} FavoriteStatusResponse
 * @property {boolean} isFavorited - 是否已收藏
 * @property {string} [favoriteTime] - 收藏时间
 */