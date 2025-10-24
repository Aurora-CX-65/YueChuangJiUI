/**
 * 通知服务类
 * 处理通知管理相关的API请求
 */

import { httpClient } from '@/utils/http-client.js'

/**
 * 通知服务类
 * 对应后端 /api/notifications 接口
 */
export class NotificationService {

  /**
   * 获取通知列表
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 通知列表分页数据
   */
  static async getNotifications(page = 1, size = 10) {
    return await httpClient.get('/api/notifications', { page, size })
  }

  /**
   * 获取未读通知数
   * @returns {Promise<number>} 未读通知数量
   */
  static async getUnreadCount() {
    return await httpClient.get('/api/notifications/unread-count')
  }

  /**
   * 标记通知已读
   * @param {number} id - 通知ID
   * @returns {Promise<boolean>} 操作结果
   */
  static async markAsRead(id) {
    return await httpClient.put(`/api/notifications/${id}/read`)
  }

  /**
   * 批量标记已读
   * @param {number[]} ids - 通知ID列表
   * @returns {Promise<boolean>} 操作结果
   */
  static async batchMarkAsRead(ids) {
    return await httpClient.put('/api/notifications/batch-read', ids)
  }

  /**
   * 全部标记已读
   * @returns {Promise<boolean>} 操作结果
   */
  static async markAllAsRead() {
    return await httpClient.put('/api/notifications/read-all')
  }

  /**
   * 删除通知
   * @param {number} id - 通知ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteNotification(id) {
    return await httpClient.delete(`/api/notifications/${id}`)
  }

  /**
   * 批量删除通知
   * @param {number[]} ids - 通知ID列表
   * @returns {Promise<boolean>} 删除结果
   */
  static async batchDeleteNotifications(ids) {
    return await httpClient.delete('/api/notifications/batch-delete', ids)
  }

  /**
   * 清空所有通知
   * @returns {Promise<boolean>} 操作结果
   */
  static async clearAllNotifications() {
    return await httpClient.delete('/api/notifications/clear-all')
  }

  /**
   * 获取通知设置
   * @returns {Promise<Object>} 通知设置
   */
  static async getNotificationSettings() {
    return await httpClient.get('/api/notifications/settings')
  }

  /**
   * 更新通知设置
   * @param {Object} settings - 通知设置
   * @returns {Promise<boolean>} 更新结果
   */
  static async updateNotificationSettings(settings) {
    return await httpClient.put('/api/notifications/settings', settings)
  }

  /**
   * 获取通知统计
   * @returns {Promise<Object>} 通知统计信息
   */
  static async getNotificationStats() {
    return await httpClient.get('/api/notifications/stats')
  }

  /**
   * 创建系统通知（管理员功能）
   * @param {Object} notificationRequest - 系统通知请求
   * @returns {Promise<boolean>} 创建结果
   */
  static async createSystemNotification(notificationRequest) {
    return await httpClient.post('/api/notifications/system', notificationRequest)
  }

  /**
   * 获取通知详情
   * @param {number} id - 通知ID
   * @returns {Promise<Object>} 通知详情
   */
  static async getNotificationById(id) {
    return await httpClient.get(`/api/notifications/${id}`)
  }

  /**
   * 获取实时通知信息
   * @returns {Promise<Object>} 实时通知状态信息
   */
  static async getRealtimeInfo() {
    return await httpClient.get('/api/notifications/realtime-info')
  }

  /**
   * 测试通知功能
   * @returns {Promise<boolean>} 测试结果
   */
  static async testNotification() {
    return await httpClient.post('/api/notifications/test')
  }
}