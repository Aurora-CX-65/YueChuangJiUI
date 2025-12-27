import { httpClient } from '@/utils/http-client.js'

export class ReadingProgressService {
  /**
   * 记录阅读进度
   * @param {Object} data
   * @param {number} data.bookId
   * @param {number} data.chapterId
   * @param {number} data.position
   * @param {number} data.readingTime
   * @returns {Promise<boolean>}
   */
  static async recordReading(data) {
    return await httpClient.post('/api/reading-progress/record', data)
  }

  /**
   * 获取某本书的阅读进度
   * @param {number} bookId
   * @returns {Promise<Object>}
   */
  static async getReadingProgress(bookId) {
    return await httpClient.get(`/api/reading-progress/${bookId}`)
  }

  /**
   * 获取阅读历史列表
   * @param {number} page
   * @param {number} size
   * @returns {Promise<Array>}
   */
  static async getReadingHistory(page = 1, size = 10) {
    return await httpClient.get('/api/reading-progress/summary', { page, size })
  }

  /**
   * 获取阅读统计
   * @returns {Promise<Object>}
   */
  static async getReadingStatistics() {
    return await httpClient.get('/api/reading-progress/statistics')
  }

  /**
   * 删除阅读记录
   * @param {number} bookId
   * @returns {Promise<boolean>}
   */
  static async deleteReadingProgress(bookId) {
    return await httpClient.delete(`/api/reading-progress/${bookId}`)
  }
}
