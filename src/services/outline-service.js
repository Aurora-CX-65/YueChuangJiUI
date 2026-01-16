import { httpClient } from '@/utils/http-client.js'

export class OutlineService {
  /**
   * 获取书籍的大纲列表
   * @param {number} bookId
   * @param {Object} params - { page, size }
   */
  static async getOutlines(bookId, params = {}) {
    return await httpClient.get(`/api/books/${bookId}/outlines`, params)
  }

  /**
   * 创建大纲
   * @param {Object} data - 必须包含 bookId
   */
  static async createOutline(data) {
    return await httpClient.post(`/api/books/${data.bookId}/outlines`, data)
  }

  /**
   * 更新大纲
   * @param {number} bookId
   * @param {number} id
   * @param {Object} data
   */
  static async updateOutline(bookId, id, data) {
    return await httpClient.put(`/api/books/${bookId}/outlines/${id}`, data)
  }

  /**
   * 删除大纲
   * @param {number} bookId
   * @param {number} id
   */
  static async deleteOutline(bookId, id) {
    return await httpClient.delete(`/api/books/${bookId}/outlines/${id}`)
  }

  /**
   * 更新大纲排序
   * @param {number} bookId
   * @param {number} id
   * @param {number} newOrder
   */
  static async updateOrder(bookId, id, newOrder) {
    return await httpClient.put(`/api/books/${bookId}/outlines/${id}/sort`, { sortOrder: newOrder })
  }
}
