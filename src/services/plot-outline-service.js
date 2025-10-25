/**
 * 情节大纲服务类
 * 处理情节大纲相关的API请求
 */

import { httpClient } from '@/utils/http-client.js'

/**
 * 情节大纲服务类
 * 对应后端 /api/plot-outlines 接口
 */
export class PlotOutlineService {

  /**
   * 获取书籍的情节大纲列表
   * @param {number} bookId - 书籍ID
   * @returns {Promise<Array>} 情节大纲列表
   */
  static async getOutlinesByBookId(bookId) {
    return await httpClient.get(`/api/books/${bookId}/plot-outlines`)
  }

  /**
   * 根据ID获取情节大纲详情
   * @param {number} outlineId - 情节大纲ID
   * @returns {Promise<Object>} 情节大纲详情
   */
  static async getOutlineById(outlineId) {
    return await httpClient.get(`/api/plot-outlines/${outlineId}`)
  }

  /**
   * 创建情节大纲
   * @param {Object} outlineData - 情节大纲数据
   * @param {number} outlineData.bookId - 书籍ID
   * @param {string} outlineData.title - 大纲标题
   * @param {string} [outlineData.description] - 大纲描述
   * @param {string} outlineData.content - 大纲内容
   * @param {string} [outlineData.type] - 大纲类型 (main_plot, sub_plot, character_arc)
   * @param {number} [outlineData.parentId] - 父大纲ID
   * @param {number} [outlineData.chapterStart] - 起始章节
   * @param {number} [outlineData.chapterEnd] - 结束章节
   * @param {string} [outlineData.status] - 状态 (draft, in_progress, completed)
   * @param {Array<string>} [outlineData.tags] - 标签列表
   * @param {number} [outlineData.sortOrder] - 排序顺序
   * @returns {Promise<Object>} 创建的情节大纲信息
   */
  static async createOutline(outlineData) {
    return await httpClient.post('/api/plot-outlines', outlineData)
  }

  /**
   * 更新情节大纲
   * @param {number} outlineId - 情节大纲ID
   * @param {Object} outlineData - 更新数据
   * @param {string} [outlineData.title] - 大纲标题
   * @param {string} [outlineData.description] - 大纲描述
   * @param {string} [outlineData.content] - 大纲内容
   * @param {string} [outlineData.type] - 大纲类型
   * @param {number} [outlineData.parentId] - 父大纲ID
   * @param {number} [outlineData.chapterStart] - 起始章节
   * @param {number} [outlineData.chapterEnd] - 结束章节
   * @param {string} [outlineData.status] - 状态
   * @param {Array<string>} [outlineData.tags] - 标签列表
   * @param {number} [outlineData.sortOrder] - 排序顺序
   * @returns {Promise<Object>} 更新后的情节大纲信息
   */
  static async updateOutline(outlineId, outlineData) {
    return await httpClient.put(`/api/plot-outlines/${outlineId}`, outlineData)
  }

  /**
   * 删除情节大纲
   * @param {number} outlineId - 情节大纲ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteOutline(outlineId) {
    return await httpClient.delete(`/api/plot-outlines/${outlineId}`)
  }

  /**
   * 批量删除情节大纲
   * @param {Array<number>} outlineIds - 情节大纲ID列表
   * @returns {Promise<Object>} 批量操作结果
   */
  static async batchDeleteOutlines(outlineIds) {
    return await httpClient.post('/api/plot-outlines/batch/delete', { outlineIds })
  }

  /**
   * 获取大纲树结构
   * @param {number} bookId - 书籍ID
   * @returns {Promise<Array>} 大纲树数据
   */
  static async getOutlineTree(bookId) {
    return await httpClient.get(`/api/books/${bookId}/plot-outlines/tree`)
  }

  /**
   * 移动大纲到新的父级
   * @param {number} outlineId - 大纲ID
   * @param {number} newParentId - 新父级ID
   * @param {number} [newPosition] - 新位置
   * @returns {Promise<boolean>} 移动结果
   */
  static async moveOutline(outlineId, newParentId, newPosition = null) {
    const data = { parentId: newParentId }
    if (newPosition !== null) {
      data.position = newPosition
    }
    return await httpClient.put(`/api/plot-outlines/${outlineId}/move`, data)
  }

  /**
   * 复制情节大纲
   * @param {number} outlineId - 源大纲ID
   * @param {Object} [options] - 复制选项
   * @param {string} [options.newTitle] - 新大纲标题
   * @param {number} [options.targetBookId] - 目标书籍ID
   * @param {boolean} [options.includeChildren=true] - 是否包含子大纲
   * @returns {Promise<Object>} 复制的大纲信息
   */
  static async duplicateOutline(outlineId, options = {}) {
    return await httpClient.post(`/api/plot-outlines/${outlineId}/duplicate`, options)
  }

  /**
   * 搜索情节大纲
   * @param {Object} params - 搜索参数
   * @param {number} [params.bookId] - 书籍ID
   * @param {string} [params.keyword] - 搜索关键词
   * @param {string} [params.type] - 大纲类型筛选
   * @param {string} [params.status] - 状态筛选
   * @param {Array<string>} [params.tags] - 标签筛选
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页大小
   * @returns {Promise<Object>} 搜索结果分页数据
   */
  static async searchOutlines(params = {}) {
    const queryParams = {
      page: params.page || 1,
      size: params.size || 10,
      ...params
    }
    
    return await httpClient.get('/api/plot-outlines/search', queryParams)
  }

  /**
   * 更新大纲排序
   * @param {number} bookId - 书籍ID
   * @param {Array<Object>} sortData - 排序数据
   * @param {number} sortData[].id - 大纲ID
   * @param {number} sortData[].sortOrder - 新的排序顺序
   * @param {number} [sortData[].parentId] - 父级ID
   * @returns {Promise<boolean>} 更新结果
   */
  static async updateOutlineSort(bookId, sortData) {
    return await httpClient.put(`/api/books/${bookId}/plot-outlines/sort`, { outlines: sortData })
  }

  /**
   * 获取大纲统计信息
   * @param {number} bookId - 书籍ID
   * @returns {Promise<Object>} 统计信息
   */
  static async getOutlineStats(bookId) {
    return await httpClient.get(`/api/books/${bookId}/plot-outlines/stats`)
  }

  /**
   * 生成大纲模板
   * @param {Object} templateData - 模板数据
   * @param {number} templateData.bookId - 书籍ID
   * @param {string} templateData.templateType - 模板类型 (three_act, hero_journey, freytag_pyramid)
   * @param {Object} [templateData.customSettings] - 自定义设置
   * @returns {Promise<Array>} 生成的大纲列表
   */
  static async generateOutlineTemplate(templateData) {
    return await httpClient.post('/api/plot-outlines/generate-template', templateData)
  }

  /**
   * 关联章节到大纲
   * @param {number} outlineId - 大纲ID
   * @param {Array<number>} chapterIds - 章节ID列表
   * @returns {Promise<boolean>} 关联结果
   */
  static async linkChaptersToOutline(outlineId, chapterIds) {
    return await httpClient.post(`/api/plot-outlines/${outlineId}/link-chapters`, { chapterIds })
  }

  /**
   * 取消章节与大纲的关联
   * @param {number} outlineId - 大纲ID
   * @param {Array<number>} chapterIds - 章节ID列表
   * @returns {Promise<boolean>} 取消关联结果
   */
  static async unlinkChaptersFromOutline(outlineId, chapterIds) {
    return await httpClient.post(`/api/plot-outlines/${outlineId}/unlink-chapters`, { chapterIds })
  }

  /**
   * 获取大纲关联的章节
   * @param {number} outlineId - 大纲ID
   * @returns {Promise<Array>} 关联的章节列表
   */
  static async getLinkedChapters(outlineId) {
    return await httpClient.get(`/api/plot-outlines/${outlineId}/chapters`)
  }

  /**
   * 导出情节大纲
   * @param {number} bookId - 书籍ID
   * @param {string} [format='json'] - 导出格式 (json, markdown, pdf, docx)
   * @param {Object} [options] - 导出选项
   * @param {boolean} [options.includeContent=true] - 是否包含详细内容
   * @param {boolean} [options.includeStats=false] - 是否包含统计信息
   * @returns {Promise<Blob>} 导出文件
   */
  static async exportOutlines(bookId, format = 'json', options = {}) {
    return await httpClient.get(`/api/books/${bookId}/plot-outlines/export`, { 
      format, 
      ...options 
    }, {
      responseType: 'blob'
    })
  }

  /**
   * 导入情节大纲
   * @param {number} bookId - 书籍ID
   * @param {File} file - 导入文件
   * @param {Object} [options] - 导入选项
   * @param {boolean} [options.overwrite=false] - 是否覆盖同名大纲
   * @param {boolean} [options.preserveStructure=true] - 是否保持层级结构
   * @returns {Promise<Object>} 导入结果
   */
  static async importOutlines(bookId, file, options = {}) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('options', JSON.stringify(options))
    
    return await httpClient.post(`/api/books/${bookId}/plot-outlines/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  /**
   * 更新大纲状态
   * @param {number} outlineId - 大纲ID
   * @param {string} status - 新状态 (draft, in_progress, completed)
   * @returns {Promise<boolean>} 更新结果
   */
  static async updateOutlineStatus(outlineId, status) {
    return await httpClient.put(`/api/plot-outlines/${outlineId}/status`, { status })
  }

  /**
   * 批量更新大纲状态
   * @param {Array<number>} outlineIds - 大纲ID列表
   * @param {string} status - 新状态
   * @returns {Promise<Object>} 批量更新结果
   */
  static async batchUpdateOutlineStatus(outlineIds, status) {
    return await httpClient.post('/api/plot-outlines/batch/update-status', { 
      outlineIds, 
      status 
    })
  }

  /**
   * 获取大纲版本历史
   * @param {number} outlineId - 大纲ID
   * @returns {Promise<Array>} 版本历史列表
   */
  static async getOutlineVersions(outlineId) {
    return await httpClient.get(`/api/plot-outlines/${outlineId}/versions`)
  }

  /**
   * 恢复大纲到指定版本
   * @param {number} outlineId - 大纲ID
   * @param {number} versionId - 版本ID
   * @returns {Promise<Object>} 恢复后的大纲信息
   */
  static async restoreOutlineVersion(outlineId, versionId) {
    return await httpClient.post(`/api/plot-outlines/${outlineId}/restore`, { versionId })
  }
}