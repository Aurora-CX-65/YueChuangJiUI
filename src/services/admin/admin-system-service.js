/**
 * 管理员系统服务类
 * 处理系统统计、日志查询、设置管理等功能
 */

import { httpClient } from '@/utils/http-client.js'

/**
 * 管理员系统服务类
 * 对应后端 /api/admin 系统管理相关接口
 */
export class AdminSystemService {

  /**
   * 获取系统统计数据
   * @returns {Promise<Object>} 系统统计信息
   */
  static async getSystemStats() {
    return await httpClient.get('/api/admin/stats')
  }

  /**
   * 获取系统概览统计
   * @returns {Promise<Object>} 系统概览统计数据
   */
  static async getOverviewStats() {
    return await httpClient.get('/api/admin/stats/overview')
  }

  /**
   * 获取用户统计数据
   * @returns {Promise<Object>} 用户统计信息
   */
  static async getUserStats() {
    return await httpClient.get('/api/admin/stats/users')
  }

  /**
   * 获取书籍统计数据
   * @returns {Promise<Object>} 书籍统计信息
   */
  static async getBookStats() {
    return await httpClient.get('/api/admin/stats/books')
  }

  /**
   * 获取操作日志
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页大小
   * @param {string} [params.operation] - 操作类型
   * @param {string} [params.username] - 用户名
   * @param {string} [params.startDate] - 开始日期
   * @param {string} [params.endDate] - 结束日期
   * @returns {Promise<Object>} 操作日志分页数据
   */
  static async getOperationLogs(params = {}) {
    const queryParams = {
      page: params.page || 1,
      size: params.size || 10,
      ...(params.operation && { operation: params.operation }),
      ...(params.username && { username: params.username }),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate })
    }
    
    return await httpClient.get('/api/admin/logs', queryParams)
  }

  /**
   * 获取系统设置
   * @returns {Promise<Object>} 系统设置信息
   */
  static async getSystemSettings() {
    return await httpClient.get('/api/admin/settings')
  }

  /**
   * 更新系统设置
   * @param {Object} settingsData - 设置数据
   * @returns {Promise<boolean>} 更新结果
   */
  static async updateSystemSettings(settingsData) {
    return await httpClient.put('/api/admin/settings', settingsData)
  }

  /**
   * 获取审核统计
   * @returns {Promise<Object>} 审核统计数据
   */
  static async getReviewStats() {
    return await httpClient.get('/api/admin/review/stats')
  }

  /**
   * 获取审核项目列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页大小
   * @param {string} [params.type] - 审核类型
   * @param {string} [params.status] - 审核状态
   * @returns {Promise<Object>} 审核项目列表分页数据
   */
  static async getReviewItems(params = {}) {
    const queryParams = {
      page: params.page || 1,
      size: params.size || 10,
      ...(params.type && { type: params.type }),
      ...(params.status && { status: params.status })
    }
    
    return await httpClient.get('/api/admin/review/items', queryParams)
  }

  /**
   * 获取审核项目详情
   * @param {number} itemId - 审核项目ID
   * @returns {Promise<Object>} 审核项目详情
   */
  static async getReviewItemById(itemId) {
    return await httpClient.get(`/api/admin/review/items/${itemId}`)
  }

  /**
   * 审核通过
   * @param {number} itemId - 审核项目ID
   * @param {Object} [decisionData] - 审核决定数据
   * @param {string} [decisionData.comment] - 审核意见
   * @returns {Promise<boolean>} 审核结果
   */
  static async approveReviewItem(itemId, decisionData = {}) {
    return await httpClient.post(`/api/admin/review/items/${itemId}/approve`, decisionData)
  }

  /**
   * 审核拒绝
   * @param {number} itemId - 审核项目ID
   * @param {Object} decisionData - 审核决定数据
   * @param {string} decisionData.comment - 拒绝原因
   * @returns {Promise<boolean>} 审核结果
   */
  static async rejectReviewItem(itemId, decisionData) {
    return await httpClient.post(`/api/admin/review/items/${itemId}/reject`, decisionData)
  }

  /**
   * 批量审核
   * @param {Object} batchData - 批量审核数据
   * @param {Array<number>} batchData.itemIds - 审核项目ID列表
   * @param {string} batchData.result - 审核结果 (APPROVED/REJECTED)
   * @param {string} [batchData.comment] - 审核意见
   * @returns {Promise<boolean>} 批量审核结果
   */
  static async batchReview(batchData) {
    return await httpClient.post('/api/admin/review/batch', batchData)
  }

  /**
   * 获取审核历史
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页大小
   * @param {string} [params.type] - 审核类型
   * @param {string} [params.reviewer] - 审核员
   * @returns {Promise<Object>} 审核历史分页数据
   */
  static async getReviewHistory(params = {}) {
    const queryParams = {
      page: params.page || 1,
      size: params.size || 10,
      ...(params.type && { type: params.type }),
      ...(params.reviewer && { reviewer: params.reviewer })
    }
    
    return await httpClient.get('/api/admin/review/history', queryParams)
  }

  /**
   * 获取作者申请列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页大小
   * @param {string} [params.status] - 申请状态
   * @returns {Promise<Object>} 作者申请列表分页数据
   */
  static async getAuthorApplications(params = {}) {
    const queryParams = {
      page: params.page || 1,
      size: params.size || 10,
      ...(params.status && { status: params.status })
    }
    
    return await httpClient.get('/api/admin/author-applications', queryParams)
  }

  /**
   * 处理作者申请
   * @param {number} applicationId - 申请ID
   * @param {Object} decisionData - 处理决定数据
   * @param {string} decisionData.result - 处理结果 (APPROVED/REJECTED)
   * @param {string} [decisionData.comment] - 处理意见
   * @returns {Promise<boolean>} 处理结果
   */
  static async processAuthorApplication(applicationId, decisionData) {
    const endpoint = decisionData.result === 'APPROVED' 
      ? `/api/admin/author-applications/${applicationId}/approve`
      : `/api/admin/author-applications/${applicationId}/reject`
    
    return await httpClient.post(endpoint, { comment: decisionData.comment })
  }

  /**
   * 获取系统健康状态
   * @returns {Promise<Object>} 系统健康状态信息
   */
  static async getSystemHealth() {
    return await httpClient.get('/api/admin/system/health')
  }

  /**
   * 获取系统性能指标
   * @param {Object} params - 查询参数
   * @param {string} [params.timeRange='1h'] - 时间范围
   * @returns {Promise<Object>} 系统性能指标数据
   */
  static async getSystemMetrics(params = {}) {
    const queryParams = {
      timeRange: params.timeRange || '1h'
    }
    
    return await httpClient.get('/api/admin/system/metrics', queryParams)
  }

  /**
   * 清理系统缓存
   * @param {Object} cacheData - 缓存清理数据
   * @param {Array<string>} [cacheData.types] - 要清理的缓存类型
   * @returns {Promise<boolean>} 清理结果
   */
  static async clearSystemCache(cacheData = {}) {
    return await httpClient.post('/api/admin/system/cache/clear', cacheData)
  }

  /**
   * 导出系统数据
   * @param {Object} exportData - 导出参数
   * @param {string} exportData.type - 导出类型 (users/books/logs)
   * @param {string} [exportData.format='excel'] - 导出格式
   * @param {Object} [exportData.filters] - 过滤条件
   * @returns {Promise<Blob>} 导出文件数据
   */
  static async exportSystemData(exportData) {
    return await httpClient.post('/api/admin/system/export', exportData, {
      headers: {
        'Accept': 'application/octet-stream'
      }
    })
  }

  /**
   * 获取系统公告列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页大小
   * @returns {Promise<Object>} 系统公告列表分页数据
   */
  static async getSystemAnnouncements(params = {}) {
    const queryParams = {
      page: params.page || 1,
      size: params.size || 10
    }
    
    return await httpClient.get('/api/admin/system/announcements', queryParams)
  }

  /**
   * 创建系统公告
   * @param {Object} announcementData - 公告数据
   * @param {string} announcementData.title - 公告标题
   * @param {string} announcementData.content - 公告内容
   * @param {string} [announcementData.type] - 公告类型
   * @param {boolean} [announcementData.isActive] - 是否激活
   * @returns {Promise<Object>} 创建的公告信息
   */
  static async createSystemAnnouncement(announcementData) {
    return await httpClient.post('/api/admin/system/announcements', announcementData)
  }

  /**
   * 更新系统公告
   * @param {number} announcementId - 公告ID
   * @param {Object} announcementData - 更新数据
   * @returns {Promise<Object>} 更新后的公告信息
   */
  static async updateSystemAnnouncement(announcementId, announcementData) {
    return await httpClient.put(`/api/admin/system/announcements/${announcementId}`, announcementData)
  }

  /**
   * 删除系统公告
   * @param {number} announcementId - 公告ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteSystemAnnouncement(announcementId) {
    return await httpClient.delete(`/api/admin/system/announcements/${announcementId}`)
  }
}