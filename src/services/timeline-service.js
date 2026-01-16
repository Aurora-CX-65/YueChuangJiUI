import { httpClient } from '@/utils/http-client.js'

export class TimelineService {
  /**
   * 获取书籍的时间线事件列表
   * @param {number} bookId
   */
  static async getEvents(bookId) {
    return await httpClient.get(`/api/timelines/book/${bookId}`)
  }

  /**
   * 创建事件
   * @param {Object} data
   */
  static async createEvent(data) {
    return await httpClient.post('/api/timelines', data)
  }

  /**
   * 更新事件
   * @param {number} id
   * @param {Object} data
   */
  static async updateEvent(id, data) {
    return await httpClient.put(`/api/timelines/${id}`, data)
  }

  /**
   * 删除事件
   * @param {number} id
   */
  static async deleteEvent(id) {
    return await httpClient.delete(`/api/timelines/${id}`)
  }

  /**
   * 更新排序
   * @param {number} id
   * @param {number} newOrder
   */
  static async updateOrder(id, newOrder) {
    return await httpClient.put(`/api/timelines/${id}/order`, { sortOrder: newOrder })
  }
}
