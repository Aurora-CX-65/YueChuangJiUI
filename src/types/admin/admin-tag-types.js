/**
 * 管理员标签管理相关数据类型定义
 */

/**
 * 管理员标签响应数据
 * @typedef {Object} AdminTagType
 * @property {number} id - 标签ID
 * @property {string} name - 标签名称
 * @property {string} description - 标签描述
 * @property {string} color - 标签颜色 (十六进制颜色码)
 * @property {number} usageCount - 使用次数
 * @property {boolean} isActive - 是否启用
 * @property {number} sortOrder - 排序顺序
 * @property {string} createdTime - 创建时间
 * @property {string} updatedTime - 更新时间
 * @property {number} createdBy - 创建者ID
 * @property {string} creatorName - 创建者用户名
 */

/**
 * 标签创建请求
 * @typedef {Object} TagCreateRequest
 * @property {string} name - 标签名称
 * @property {string} [description] - 标签描述
 * @property {string} [color] - 标签颜色
 * @property {number} [sortOrder] - 排序顺序
 * @property {boolean} [isActive] - 是否启用，默认true
 */

/**
 * 标签更新请求
 * @typedef {Object} TagUpdateRequest
 * @property {string} [name] - 标签名称
 * @property {string} [description] - 标签描述
 * @property {string} [color] - 标签颜色
 * @property {number} [sortOrder] - 排序顺序
 * @property {boolean} [isActive] - 是否启用
 */

/**
 * 标签查询参数
 * @typedef {Object} TagQueryParams
 * @property {number} [page] - 页码
 * @property {number} [size] - 每页大小
 * @property {string} [keyword] - 搜索关键词
 * @property {boolean} [isActive] - 是否启用筛选
 * @property {string} [sortBy] - 排序字段 (name/usageCount/createdTime)
 * @property {string} [sortOrder] - 排序方向 (asc/desc)
 */

/**
 * 标签统计数据
 * @typedef {Object} TagStatsType
 * @property {number} totalTags - 总标签数
 * @property {number} activeTags - 启用标签数
 * @property {number} inactiveTags - 禁用标签数
 * @property {number} totalUsage - 总使用次数
 * @property {TagUsageStats[]} topUsedTags - 使用最多的标签
 * @property {TagUsageStats[]} recentTags - 最近创建的标签
 */

/**
 * 标签使用统计
 * @typedef {Object} TagUsageStats
 * @property {number} id - 标签ID
 * @property {string} name - 标签名称
 * @property {string} color - 标签颜色
 * @property {number} usageCount - 使用次数
 * @property {number} recentUsage - 最近使用次数(30天内)
 */

/**
 * 批量标签操作请求
 * @typedef {Object} BatchTagOperationRequest
 * @property {number[]} tagIds - 标签ID列表
 * @property {string} operation - 操作类型 (ACTIVATE/DEACTIVATE/DELETE/UPDATE_COLOR)
 * @property {Object} [data] - 操作数据
 * @property {string} [reason] - 操作原因
 */

/**
 * 标签验证结果
 * @typedef {Object} TagValidationResult
 * @property {boolean} isValid - 是否有效
 * @property {string} [error] - 错误信息
 * @property {string[]} [suggestions] - 建议的标签名称
 */

/**
 * 标签关联信息
 * @typedef {Object} TagRelationInfo
 * @property {number} tagId - 标签ID
 * @property {string} tagName - 标签名称
 * @property {number} bookCount - 关联书籍数量
 * @property {BookBasicInfo[]} recentBooks - 最近使用该标签的书籍
 */

/**
 * 书籍基本信息
 * @typedef {Object} BookBasicInfo
 * @property {number} id - 书籍ID
 * @property {string} title - 书籍标题
 * @property {string} authorName - 作者名称
 * @property {string} coverUrl - 封面URL
 * @property {string} createdTime - 创建时间
 */

export {
  // 主要类型导出
  AdminTagType,
  TagCreateRequest,
  TagUpdateRequest,
  TagQueryParams,
  TagStatsType,
  TagUsageStats,
  BatchTagOperationRequest,
  TagValidationResult,
  TagRelationInfo,
  BookBasicInfo
};