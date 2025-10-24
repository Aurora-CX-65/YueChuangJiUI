/**
 * 分类服务类
 * 处理书籍分类相关的API请求
 */

import { httpClient } from '@/utils/http-client.js'

/**
 * 分类服务类
 * 对应后端 /api/categories 接口
 */
export class CategoryService {

  /**
   * 获取分类列表
   * @returns {Promise<Array>} 分类列表
   */
  static async getCategories() {
    return await httpClient.get('/api/categories')
  }

  /**
   * 根据ID获取分类详情
   * @param {number} categoryId - 分类ID
   * @returns {Promise<Object>} 分类详情
   */
  static async getCategoryById(categoryId) {
    return await httpClient.get(`/api/categories/${categoryId}`)
  }

  /**
   * 获取根分类列表
   * @returns {Promise<Array>} 根分类列表
   */
  static async getRootCategories() {
    return await httpClient.get('/api/categories/root')
  }

  /**
   * 根据父分类ID获取子分类列表
   * @param {number} parentId - 父分类ID
   * @returns {Promise<Array>} 子分类列表
   */
  static async getCategoriesByParentId(parentId) {
    return await httpClient.get(`/api/categories/${parentId}/children`)
  }
}