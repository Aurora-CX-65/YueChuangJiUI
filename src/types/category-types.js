/**
 * 分类相关数据类型定义
 */

/**
 * 分类响应信息
 * @typedef {Object} CategoryResponse
 * @property {number} id - 分类ID
 * @property {string} name - 分类名称
 * @property {string} [description] - 分类描述
 * @property {number} [parentId] - 父分类ID
 * @property {number} sortOrder - 排序序号
 * @property {number} bookCount - 书籍数量
 * @property {string} status - 状态 (active/inactive)
 * @property {string} createdTime - 创建时间
 * @property {string} updatedTime - 更新时间
 * @property {CategoryResponse[]} [children] - 子分类列表
 */

/**
 * 分类创建请求
 * @typedef {Object} CategoryCreateRequest
 * @property {string} name - 分类名称
 * @property {string} [description] - 分类描述
 * @property {number} [parentId] - 父分类ID
 * @property {number} [sortOrder] - 排序序号
 */

/**
 * 分类更新请求
 * @typedef {Object} CategoryUpdateRequest
 * @property {string} [name] - 分类名称
 * @property {string} [description] - 分类描述
 * @property {number} [parentId] - 父分类ID
 * @property {number} [sortOrder] - 排序序号
 * @property {string} [status] - 状态
 */

/**
 * 标签响应信息
 * @typedef {Object} TagResponse
 * @property {number} id - 标签ID
 * @property {string} name - 标签名称
 * @property {string} [color] - 标签颜色
 * @property {number} usageCount - 使用次数
 * @property {string} status - 状态 (active/inactive)
 * @property {string} createdTime - 创建时间
 * @property {string} updatedTime - 更新时间
 */

/**
 * 标签创建请求
 * @typedef {Object} TagCreateRequest
 * @property {string} name - 标签名称
 * @property {string} [color] - 标签颜色
 */

/**
 * 标签更新请求
 * @typedef {Object} TagUpdateRequest
 * @property {string} [name] - 标签名称
 * @property {string} [color] - 标签颜色
 * @property {string} [status] - 状态
 */

/**
 * 管理员标签响应 (包含更多管理信息)
 * @typedef {Object} AdminTagResponse
 * @property {number} id - 标签ID
 * @property {string} name - 标签名称
 * @property {string} [color] - 标签颜色
 * @property {number} usageCount - 使用次数
 * @property {string} status - 状态
 * @property {number} createdBy - 创建者ID
 * @property {string} createdTime - 创建时间
 * @property {string} updatedTime - 更新时间
 */