import { httpClient } from '@/utils/http-client.js'

export class BookmarkService {
  /**
   * 添加书签
   * @param {Object} data
   * @param {number} data.bookId
   * @param {number} data.chapterId
   * @param {number} data.position
   * @param {string} [data.note]
   * @returns {Promise<number>} 书签ID
   */
  static async addBookmark(data) {
    return await httpClient.post('/api/reading/bookmarks', data)
  }

  /**
   * 更新书签备注
   * @param {number} bookmarkId
   * @param {string} note
   * @returns {Promise<boolean>}
   */
  static async updateBookmarkNote(bookmarkId, note) {
    return await httpClient.put(`/api/reading/bookmarks/${bookmarkId}/note`, { note })
  }

  /**
   * 删除书签
   * @param {number} bookmarkId
   * @returns {Promise<boolean>}
   */
  static async deleteBookmark(bookmarkId) {
    return await httpClient.delete(`/api/reading/bookmarks/${bookmarkId}`)
  }

  /**
   * 获取用户书签列表
   * @param {number} page
   * @param {number} size
   * @returns {Promise<Array>}
   */
  static async getUserBookmarks(page = 1, size = 10) {
    return await httpClient.get('/api/reading/bookmarks', { page, size })
  }

  /**
   * 获取书籍书签列表
   * @param {number} bookId
   * @returns {Promise<Array>}
   */
  static async getBookBookmarks(bookId) {
    return await httpClient.get(`/api/reading/bookmarks/book/${bookId}`)
  }

  /**
   * 获取书签详情
   * @param {number} bookmarkId
   * @returns {Promise<Object>}
   */
  static async getBookmarkDetail(bookmarkId) {
    return await httpClient.get(`/api/reading/bookmarks/${bookmarkId}`)
  }
}
