/**
 * AI功能相关数据类型定义
 */

/**
 * AI生成请求
 * @typedef {Object} AIGenerateRequest
 * @property {string} prompt - 生成提示词
 * @property {string} type - 生成类型 (character/plot/chapter/title/description)
 * @property {number} [maxTokens] - 最大生成长度
 * @property {number} [temperature] - 生成温度 (0-1)
 * @property {Object} [context] - 上下文信息
 */

/**
 * AI生成响应
 * @typedef {Object} AIGenerateResponse
 * @property {string} content - 生成的内容
 * @property {number} tokensUsed - 使用的token数量
 * @property {string} model - 使用的模型
 * @property {number} requestTime - 请求耗时(毫秒)
 */

/**
 * 人物设定响应
 * @typedef {Object} CharacterSettingResponse
 * @property {number} id - 人物设定ID
 * @property {number} bookId - 书籍ID
 * @property {string} name - 人物姓名
 * @property {string} [nickname] - 人物昵称
 * @property {number} age - 年龄
 * @property {string} gender - 性别
 * @property {string} [appearance] - 外貌描述
 * @property {string} [personality] - 性格描述
 * @property {string} [background] - 背景故事
 * @property {string} [relationships] - 人物关系
 * @property {string} [abilities] - 特殊能力
 * @property {string} [notes] - 备注信息
 * @property {string} createdTime - 创建时间
 * @property {string} updatedTime - 更新时间
 */

/**
 * 人物设定创建请求
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
 * 人物设定更新请求
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
 * 情节大纲响应
 * @typedef {Object} PlotOutlineResponse
 * @property {number} id - 大纲ID
 * @property {number} bookId - 书籍ID
 * @property {string} title - 大纲标题
 * @property {string} content - 大纲内容
 * @property {number} sortOrder - 排序序号
 * @property {string} status - 状态 (planned/in_progress/completed)
 * @property {string} createdTime - 创建时间
 * @property {string} updatedTime - 更新时间
 */

/**
 * 情节大纲创建请求
 * @typedef {Object} PlotOutlineCreateRequest
 * @property {number} bookId - 书籍ID
 * @property {string} title - 大纲标题
 * @property {string} content - 大纲内容
 * @property {number} [sortOrder] - 排序序号
 */

/**
 * 情节大纲更新请求
 * @typedef {Object} PlotOutlineUpdateRequest
 * @property {string} [title] - 大纲标题
 * @property {string} [content] - 大纲内容
 * @property {number} [sortOrder] - 排序序号
 * @property {string} [status] - 状态
 */