/**
 * 标签服务类
 * 处理书籍标签相关的API请求
 */

import { httpClient } from '@/utils/http-client.js'

/**
 * 标签服务类
 * 对应后端 /api/tags 接口
 */
export class TagService {

  /**
   * 获取标签列表
   * @returns {Promise<Array>} 标签列表
   */
  static async getTags() {
    return await httpClient.get('/api/tags')
  }

  /**
   * 根据ID获取标签详情
   * @param {number} tagId - 标签ID
   * @returns {Promise<Object>} 标签详情
   */
  static async getTagById(tagId) {
    return await httpClient.get(`/api/tags/${tagId}`)
  }

  /**
   * 获取热门标签列表
   * @param {number} [limit=20] - 限制数量
   * @returns {Promise<Array>} 热门标签列表
   */
  static async getHotTags(limit = 20) {
    return await httpClient.get('/api/tags/hot', { limit })
  }

  /**
   * 根据书籍ID获取关联的标签列表
   * @param {number} bookId - 书籍ID
   * @returns {Promise<Array>} 书籍标签列表
   */
  static async getTagsByBookId(bookId) {
    return await httpClient.get(`/api/tags/book/${bookId}`)
  }

  /**
   * 搜索标签
   * @param {string} keyword - 搜索关键词
   * @param {number} [limit=10] - 限制数量
   * @returns {Promise<Array>} 搜索结果
   */
  static async searchTags(keyword, limit = 10) {
    return await httpClient.get('/api/tags/search', { keyword, limit })
  }

  // === 管理员功能 ===

  /**
   * 获取管理员标签列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页大小
   * @returns {Promise<Object>} 标签列表分页数据
   */
  static async getAdminTags(params = {}) {
    const queryParams = {
      page: params.page || 1,
      size: params.size || 10
    }
    
    return await httpClient.get('/api/admin/tags', queryParams)
  }

  /**
   * 创建标签（管理员）
   * @param {Object} tagData - 标签数据
   * @param {string} tagData.name - 标签名称
   * @param {string} [tagData.description] - 标签描述
   * @param {string} [tagData.color] - 标签颜色
   * @returns {Promise<Object>} 创建的标签信息
   */
  static async createTag(tagData) {
    return await httpClient.post('/api/admin/tags', tagData)
  }

  /**
   * 更新标签（管理员）
   * @param {number} tagId - 标签ID
   * @param {Object} tagData - 更新数据
   * @param {string} [tagData.name] - 标签名称
   * @param {string} [tagData.description] - 标签描述
   * @param {string} [tagData.color] - 标签颜色
   * @returns {Promise<Object>} 更新后的标签信息
   */
  static async updateTag(tagId, tagData) {
    return await httpClient.put(`/api/admin/tags/${tagId}`, tagData)
  }

  /**
   * 删除标签（管理员）
   * @param {number} tagId - 标签ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteTag(tagId) {
    return await httpClient.delete(`/api/admin/tags/${tagId}`)
  }

  /**
   * 获取标签使用统计
   * ❌ 后端缺失：GET /api/admin/tags/{id}/stats
   * @param {number} tagId - 标签ID
   * @returns {Promise<Object>} 标签使用统计数据
   */
  static async getTagStats(tagId) {
    return await httpClient.get(`/api/admin/tags/${tagId}/stats`)
  }

  /**
   * 批量删除标签
   * ❌ 后端缺失：POST /api/admin/tags/batch/delete
   * @param {Array<number>} tagIds - 标签ID列表
   * @returns {Promise<Object>} 批量操作结果
   */
  static async batchDeleteTags(tagIds) {
    return await httpClient.post('/api/admin/tags/batch/delete', { tagIds })
  }

  /**
   * 验证标签名称唯一性
   * ❌ 后端缺失：GET /api/admin/tags/validate-name
   * @param {string} name - 标签名称
   * @param {number} [excludeId] - 排除的标签ID（用于更新时验证）
   * @returns {Promise<boolean>} 是否可用
   */
  static async validateTagName(name, excludeId = null) {
    const params = { name }
    if (excludeId) {
      params.excludeId = excludeId
    }
    return await httpClient.get('/api/admin/tags/validate-name', params)
  }
}