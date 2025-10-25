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

  // === 管理员功能 ===

  /**
   * 获取管理员分类列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页大小
   * @returns {Promise<Object>} 分类列表分页数据
   */
  static async getAdminCategories(params = {}) {
    const queryParams = {
      page: params.page || 1,
      size: params.size || 10
    }
    
    return await httpClient.get('/api/admin/categories', queryParams)
  }

  /**
   * 创建分类（管理员）
   * @param {Object} categoryData - 分类数据
   * @param {string} categoryData.name - 分类名称
   * @param {string} [categoryData.description] - 分类描述
   * @param {number} [categoryData.parentId] - 父分类ID
   * @param {number} [categoryData.sortOrder] - 排序顺序
   * @returns {Promise<Object>} 创建的分类信息
   */
  static async createCategory(categoryData) {
    return await httpClient.post('/api/admin/categories', categoryData)
  }

  /**
   * 更新分类（管理员）
   * @param {number} categoryId - 分类ID
   * @param {Object} categoryData - 更新数据
   * @param {string} [categoryData.name] - 分类名称
   * @param {string} [categoryData.description] - 分类描述
   * @param {number} [categoryData.parentId] - 父分类ID
   * @param {number} [categoryData.sortOrder] - 排序顺序
   * @returns {Promise<Object>} 更新后的分类信息
   */
  static async updateCategory(categoryId, categoryData) {
    return await httpClient.put(`/api/admin/categories/${categoryId}`, categoryData)
  }

  /**
   * 删除分类（管理员）
   * @param {number} categoryId - 分类ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteCategory(categoryId) {
    return await httpClient.delete(`/api/admin/categories/${categoryId}`)
  }

  /**
   * 获取分类树结构（管理员）
   * ❌ 后端缺失：GET /api/admin/categories/tree
   * @returns {Promise<Array>} 分类树数据
   */
  static async getCategoryTree() {
    return await httpClient.get('/api/admin/categories/tree')
  }

  /**
   * 获取分类使用统计
   * ❌ 后端缺失：GET /api/admin/categories/{id}/stats
   * @param {number} categoryId - 分类ID
   * @returns {Promise<Object>} 分类使用统计数据
   */
  static async getCategoryStats(categoryId) {
    return await httpClient.get(`/api/admin/categories/${categoryId}/stats`)
  }

  /**
   * 批量删除分类
   * ❌ 后端缺失：POST /api/admin/categories/batch/delete
   * @param {Array<number>} categoryIds - 分类ID列表
   * @returns {Promise<Object>} 批量操作结果
   */
  static async batchDeleteCategories(categoryIds) {
    return await httpClient.post('/api/admin/categories/batch/delete', { categoryIds })
  }

  /**
   * 验证分类名称唯一性
   * ❌ 后端缺失：GET /api/admin/categories/validate-name
   * @param {string} name - 分类名称
   * @param {number} [parentId] - 父分类ID
   * @param {number} [excludeId] - 排除的分类ID（用于更新时验证）
   * @returns {Promise<boolean>} 是否可用
   */
  static async validateCategoryName(name, parentId = null, excludeId = null) {
    const params = { name }
    if (parentId) {
      params.parentId = parentId
    }
    if (excludeId) {
      params.excludeId = excludeId
    }
    return await httpClient.get('/api/admin/categories/validate-name', params)
  }

  /**
   * 移动分类到新的父分类
   * ❌ 后端缺失：PUT /api/admin/categories/{id}/move
   * @param {number} categoryId - 分类ID
   * @param {number} newParentId - 新父分类ID
   * @returns {Promise<boolean>} 移动结果
   */
  static async moveCategory(categoryId, newParentId) {
    return await httpClient.put(`/api/admin/categories/${categoryId}/move`, { 
      parentId: newParentId 
    })
  }

  /**
   * 更新分类排序
   * ❌ 后端缺失：PUT /api/admin/categories/sort
   * @param {Array<Object>} sortData - 排序数据
   * @param {number} sortData[].id - 分类ID
   * @param {number} sortData[].sortOrder - 新的排序顺序
   * @returns {Promise<boolean>} 更新结果
   */
  static async updateCategorySort(sortData) {
    return await httpClient.put('/api/admin/categories/sort', { categories: sortData })
  }
}