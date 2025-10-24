/**
 * 用户服务类
 * 处理用户管理相关的API请求，包括用户信息获取、更新、关注等
 */

import { httpClient } from '@/utils/http-client.js'

/**
 * 用户服务类
 * 对应后端 /api/users 接口
 */
export class UserService {

  /**
   * 获取当前用户信息
   * @returns {Promise<Object>} 当前用户信息
   */
  static async getCurrentUserProfile() {
    return await httpClient.get('/api/users/profile')
  }

  /**
   * 根据用户ID获取用户信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 用户信息
   */
  static async getUserById(userId) {
    return await httpClient.get(`/api/users/${userId}`)
  }

  /**
   * 根据用户名获取用户信息
   * @param {string} username - 用户名
   * @returns {Promise<Object>} 用户信息
   */
  static async getUserByUsername(username) {
    return await httpClient.get(`/api/users/username/${username}`)
  }

  /**
   * 更新用户信息
   * @param {Object} updateRequest - 更新请求参数
   * @param {string} [updateRequest.nickname] - 昵称
   * @param {string} [updateRequest.email] - 邮箱
   * @param {string} [updateRequest.phone] - 手机号
   * @param {string} [updateRequest.avatar] - 头像URL
   * @param {string} [updateRequest.bio] - 个人简介
   * @returns {Promise<Object>} 更新后的用户信息
   */
  static async updateUserInfo(updateRequest) {
    return await httpClient.put('/api/users/profile', updateRequest)
  }

  /**
   * 上传用户头像
   * @param {File} file - 头像文件
   * @returns {Promise<string>} 头像URL
   */
  static async uploadAvatar(file) {
    const formData = new FormData()
    formData.append('file', file)
    return await httpClient.upload('/api/users/avatar', formData)
  }

  /**
   * 关注用户
   * @param {number} userId - 被关注用户ID
   * @returns {Promise<boolean>} 关注结果
   */
  static async followUser(userId) {
    return await httpClient.post(`/api/users/${userId}/follow`)
  }

  /**
   * 取消关注用户
   * @param {number} userId - 被取消关注用户ID
   * @returns {Promise<boolean>} 取消关注结果
   */
  static async unfollowUser(userId) {
    return await httpClient.delete(`/api/users/${userId}/follow`)
  }

  /**
   * 检查关注状态
   * @param {number} userId - 用户ID
   * @returns {Promise<boolean>} 是否已关注
   */
  static async checkFollowStatus(userId) {
    return await httpClient.get(`/api/users/${userId}/follow/status`)
  }

  /**
   * 获取用户关注列表
   * @param {number} userId - 用户ID
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 关注列表分页数据
   */
  static async getUserFollowing(userId, page = 1, size = 10) {
    return await httpClient.get(`/api/users/${userId}/following`, { page, size })
  }

  /**
   * 获取用户粉丝列表
   * @param {number} userId - 用户ID
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 粉丝列表分页数据
   */
  static async getUserFollowers(userId, page = 1, size = 10) {
    return await httpClient.get(`/api/users/${userId}/followers`, { page, size })
  }

  /**
   * 获取用户统计信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 用户统计信息
   */
  static async getUserStats(userId) {
    return await httpClient.get(`/api/users/${userId}/stats`)
  }

  /**
   * 搜索用户
   * @param {string} keyword - 搜索关键词
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 搜索结果分页数据
   */
  static async searchUsers(keyword, page = 1, size = 10) {
    return await httpClient.get('/api/users/search', { keyword, page, size })
  }

  /**
   * 获取当前用户关注列表
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 关注列表分页数据
   */
  static async getCurrentUserFollowing(page = 1, size = 10) {
    return await httpClient.get('/api/users/following', { page, size })
  }

  /**
   * 获取当前用户粉丝列表
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 粉丝列表分页数据
   */
  static async getCurrentUserFollowers(page = 1, size = 10) {
    return await httpClient.get('/api/users/followers', { page, size })
  }

  /**
   * 获取当前用户收藏书籍列表
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 收藏书籍列表分页数据
   */
  static async getCurrentUserFavorites(page = 1, size = 10) {
    return await httpClient.get('/api/users/favorites', { page, size })
  }

  /**
   * 获取指定用户收藏书籍列表
   * @param {number} userId - 用户ID
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 收藏书籍列表分页数据
   */
  static async getUserFavorites(userId, page = 1, size = 10) {
    return await httpClient.get(`/api/users/${userId}/favorites`, { page, size })
  }

  // === 作者申请相关方法 ===

  /**
   * 申请成为作者
   * @param {Object} applicationRequest - 申请请求参数
   * @returns {Promise<Object>} 申请结果
   */
  static async applyForAuthor(applicationRequest) {
    return await httpClient.post('/api/users/apply-author', applicationRequest)
  }

  /**
   * 获取当前用户的申请记录
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 申请记录分页数据
   */
  static async getUserApplications(page = 1, size = 10) {
    return await httpClient.get('/api/users/author-applications', { page, size })
  }

  /**
   * 获取最新的申请记录
   * @returns {Promise<Object>} 最新申请记录
   */
  static async getLatestApplication() {
    return await httpClient.get('/api/users/author-application/latest')
  }

  /**
   * 检查是否可以申请作者身份
   * @returns {Promise<boolean>} 是否可以申请
   */
  static async canApplyForAuthor() {
    return await httpClient.get('/api/users/author-application/can-apply')
  }

  /**
   * 检查笔名是否可用
   * @param {string} penName - 笔名
   * @returns {Promise<boolean>} 是否可用
   */
  static async checkPenNameAvailability(penName) {
    return await httpClient.get('/api/users/author-application/check-pen-name', { penName })
  }

  /**
   * 撤销申请
   * @param {number} applicationId - 申请ID
   * @returns {Promise<boolean>} 撤销结果
   */
  static async withdrawApplication(applicationId) {
    return await httpClient.delete(`/api/users/author-applications/${applicationId}`)
  }
}