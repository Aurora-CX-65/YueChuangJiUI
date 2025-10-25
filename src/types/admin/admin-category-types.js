/**
 * 管理员分类管理相关数据类型定义
 */

/**
 * 管理员分类响应数据
 * @typedef {Object} AdminCategoryType
 * @property {number} id - 分类ID
 * @property {string} name - 分类名称
 * @property {string} description - 分类描述
 * @property {number} [parentId] - 父分类ID
 * @property {string} [parentName] - 父分类名称
 * @property {number} level - 分类层级 (0为顶级)
 * @property {number} sortOrder - 排序顺序
 * @property {boolean} isActive - 是否启用
 * @property {string} icon - 分类图标
 * @property {string} coverUrl - 分类封面图
 * @property {number} bookCount - 书籍数量
 * @property {string} createdTime - 创建时间
 * @property {string} updatedTime - 更新时间
 * @property {number} createdBy - 创建者ID
 * @property {string} creatorName - 创建者用户名
 * @property {AdminCategoryType[]} [children] - 子分类列表
 */

/**
 * 分类创建请求
 * @typedef {Object} CategoryCreateRequest
 * @property {string} name - 分类名称
 * @property {string} [description] - 分类描述
 * @property {number} [parentId] - 父分类ID
 * @property {number} [sortOrder] - 排序顺序
 * @property {boolean} [isActive] - 是否启用，默认true
 * @property {string} [icon] - 分类图标
 * @property {string} [coverUrl] - 分类封面图
 */

/**
 * 分类更新请求
 * @typedef {Object} CategoryUpdateRequest
 * @property {string} [name] - 分类名称
 * @property {string} [description] - 分类描述
 * @property {number} [parentId] - 父分类ID
 * @property {number} [sortOrder] - 排序顺序
 * @property {boolean} [isActive] - 是否启用
 * @property {string} [icon] - 分类图标
 * @property {string} [coverUrl] - 分类封面图
 */

/**
 * 分类查询参数
 * @typedef {Object} CategoryQueryParams
 * @property {number} [page] - 页码
 * @property {number} [size] - 每页大小
 * @property {string} [keyword] - 搜索关键词
 * @property {number} [parentId] - 父分类ID筛选
 * @property {number} [level] - 分类层级筛选
 * @property {boolean} [isActive] - 是否启用筛选
 * @property {string} [sortBy] - 排序字段 (name/bookCount/createdTime/sortOrder)
 * @property {string} [sortOrder] - 排序方向 (asc/desc)
 * @property {boolean} [includeChildren] - 是否包含子分类
 */

/**
 * 分类树节点
 * @typedef {Object} CategoryTreeNode
 * @property {number} id - 分类ID
 * @property {string} name - 分类名称
 * @property {string} description - 分类描述
 * @property {number} level - 分类层级
 * @property {number} sortOrder - 排序顺序
 * @property {boolean} isActive - 是否启用
 * @property {string} icon - 分类图标
 * @property {number} bookCount - 书籍数量
 * @property {CategoryTreeNode[]} children - 子分类列表
 * @property {boolean} expanded - 是否展开 (UI状态)
 * @property {boolean} selected - 是否选中 (UI状态)
 */

/**
 * 分类统计数据
 * @typedef {Object} CategoryStatsType
 * @property {number} totalCategories - 总分类数
 * @property {number} activeCategories - 启用分类数
 * @property {number} inactiveCategories - 禁用分类数
 * @property {number} topLevelCategories - 顶级分类数
 * @property {number} maxLevel - 最大层级
 * @property {CategoryUsageStats[]} topCategories - 使用最多的分类
 * @property {CategoryUsageStats[]} recentCategories - 最近创建的分类
 */

/**
 * 分类使用统计
 * @typedef {Object} CategoryUsageStats
 * @property {number} id - 分类ID
 * @property {string} name - 分类名称
 * @property {string} icon - 分类图标
 * @property {number} bookCount - 书籍数量
 * @property {number} recentBookCount - 最近书籍数量(30天内)
 * @property {number} level - 分类层级
 */

/**
 * 批量分类操作请求
 * @typedef {Object} BatchCategoryOperationRequest
 * @property {number[]} categoryIds - 分类ID列表
 * @property {string} operation - 操作类型 (ACTIVATE/DEACTIVATE/DELETE/MOVE/UPDATE_SORT)
 * @property {Object} [data] - 操作数据
 * @property {string} [reason] - 操作原因
 */

/**
 * 分类验证结果
 * @typedef {Object} CategoryValidationResult
 * @property {boolean} isValid - 是否有效
 * @property {string} [error] - 错误信息
 * @property {string[]} [warnings] - 警告信息
 * @property {string[]} [suggestions] - 建议的分类名称
 */

/**
 * 分类关联信息
 * @typedef {Object} CategoryRelationInfo
 * @property {number} categoryId - 分类ID
 * @property {string} categoryName - 分类名称
 * @property {number} directBookCount - 直接关联书籍数量
 * @property {number} totalBookCount - 总书籍数量(包含子分类)
 * @property {BookBasicInfo[]} recentBooks - 最近该分类的书籍
 * @property {CategoryTreeNode[]} subcategories - 子分类信息
 */

/**
 * 分类移动请求
 * @typedef {Object} CategoryMoveRequest
 * @property {number} categoryId - 要移动的分类ID
 * @property {number} [newParentId] - 新父分类ID (null表示移动到顶级)
 * @property {number} [newSortOrder] - 新排序顺序
 */

/**
 * 分类路径信息
 * @typedef {Object} CategoryPath
 * @property {CategoryPathNode[]} path - 分类路径
 * @property {string} fullPath - 完整路径字符串
 */

/**
 * 分类路径节点
 * @typedef {Object} CategoryPathNode
 * @property {number} id - 分类ID
 * @property {string} name - 分类名称
 * @property {number} level - 层级
 */

