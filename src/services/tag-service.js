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
}