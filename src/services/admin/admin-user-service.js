/**
 * 管理员用户服务类
 * 处理管理员用户管理相关的API请求，包括用户列表、状态更新、角色管理、封禁等
 */

import { httpClient } from '@/utils/http-client.js'

/**
 * 管理员用户服务类
 * 对应后端 /api/admin/users 接口
 */
export class AdminUserService {

  /**
   * 获取用户列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页大小
   * @param {string} [params.keyword] - 搜索关键词
   * @param {string} [params.status] - 用户状态
   * @param {string} [params.role] - 用户角色
   * @returns {Promise<Object>} 用户列表分页数据
   */
  static async getUsers(params = {}) {
    const queryParams = {
      page: params.page || 1,
      size: params.size || 10,
      ...(params.keyword && { keyword: params.keyword }),
      ...(params.status && { status: params.status }),
      ...(params.role && { role: params.role })
    }
    
    return await httpClient.get('/api/admin/users', queryParams)
  }

  /**
   * 根据用户ID获取用户详情
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 用户详情信息
   */
  static async getUserById(userId) {
    return await httpClient.get(`/api/admin/users/${userId}`)
  }

  /**
   * 更新用户状态
   * @param {number} userId - 用户ID
   * @param {Object} statusData - 状态更新数据
   * @param {string} statusData.status - 新状态
   * @param {string} [statusData.reason] - 状态变更原因
   * @returns {Promise<boolean>} 更新结果
   */
  static async updateUserStatus(userId, statusData) {
    return await httpClient.put(`/api/admin/users/${userId}/status`, statusData)
  }

  /**
   * 更新用户角色
   * @param {number} userId - 用户ID
   * @param {Object} roleData - 角色更新数据
   * @param {string} roleData.role - 新角色
   * @param {string} [roleData.reason] - 角色变更原因
   * @returns {Promise<boolean>} 更新结果
   */
  static async updateUserRole(userId, roleData) {
    return await httpClient.put(`/api/admin/users/${userId}/role`, roleData)
  }

  /**
   * 重置用户密码
   * @param {number} userId - 用户ID
   * @returns {Promise<string>} 新密码
   */
  static async resetUserPassword(userId) {
    return await httpClient.post(`/api/admin/users/${userId}/reset-password`)
  }

  /**
   * 临时封禁用户
   * @param {number} userId - 用户ID
   * @param {Object} suspendData - 封禁数据
   * @param {string} suspendData.reason - 封禁原因
   * @param {string} suspendData.until - 封禁结束时间
   * @returns {Promise<boolean>} 封禁结果
   */
  static async suspendUser(userId, suspendData) {
    return await httpClient.post(`/api/admin/users/${userId}/suspend`, suspendData)
  }

  /**
   * 永久封禁用户
   * @param {number} userId - 用户ID
   * @param {Object} banData - 封禁数据
   * @param {string} banData.reason - 封禁原因
   * @returns {Promise<boolean>} 封禁结果
   */
  static async banUser(userId, banData) {
    return await httpClient.post(`/api/admin/users/${userId}/ban`, banData)
  }

  /**
   * 解除用户封禁
   * @param {number} userId - 用户ID
   * @returns {Promise<boolean>} 解封结果
   */
  static async unbanUser(userId) {
    return await httpClient.post(`/api/admin/users/${userId}/unban`)
  }

  /**
   * 获取用户封禁历史
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>} 封禁历史记录列表
   */
  static async getUserBanLogs(userId) {
    return await httpClient.get(`/api/admin/users/${userId}/ban-logs`)
  }

  /**
   * 获取用户统计信息
   * @returns {Promise<Object>} 用户统计数据
   */
  static async getUserStats() {
    return await httpClient.get('/api/admin/stats/users')
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
   * 批量更新用户状态
   * @param {Array<number>} userIds - 用户ID列表
   * @param {Object} statusData - 状态更新数据
   * @param {string} statusData.status - 新状态
   * @param {string} [statusData.reason] - 状态变更原因
   * @returns {Promise<Object>} 批量操作结果
   */
  static async batchUpdateUserStatus(userIds, statusData) {
    return await httpClient.post('/api/admin/users/batch/status', {
      userIds,
      ...statusData
    })
  }

  /**
   * 批量封禁用户
   * @param {Array<number>} userIds - 用户ID列表
   * @param {Object} banData - 封禁数据
   * @param {string} banData.reason - 封禁原因
   * @param {string} [banData.until] - 封禁结束时间（临时封禁）
   * @returns {Promise<Object>} 批量操作结果
   */
  static async batchBanUsers(userIds, banData) {
    const endpoint = banData.until ? '/api/admin/users/batch/suspend' : '/api/admin/users/batch/ban'
    return await httpClient.post(endpoint, {
      userIds,
      ...banData
    })
  }

  /**
   * 批量解封用户
   * @param {Array<number>} userIds - 用户ID列表
   * @returns {Promise<Object>} 批量操作结果
   */
  static async batchUnbanUsers(userIds) {
    return await httpClient.post('/api/admin/users/batch/unban', { userIds })
  }

  /**
   * 导出用户数据
   * @param {Object} params - 导出参数
   * @param {string} [params.format='excel'] - 导出格式
   * @param {string} [params.status] - 用户状态过滤
   * @param {string} [params.role] - 用户角色过滤
   * @returns {Promise<Blob>} 导出文件数据
   */
  static async exportUsers(params = {}) {
    const queryParams = {
      format: params.format || 'excel',
      ...(params.status && { status: params.status }),
      ...(params.role && { role: params.role })
    }
    
    return await httpClient.get('/api/admin/users/export', queryParams, {
      headers: {
        'Accept': 'application/octet-stream'
      }
    })
  }
}