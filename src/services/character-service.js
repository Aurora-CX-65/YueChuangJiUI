import { httpClient } from '@/utils/http-client.js'

export class CharacterService {
  /**
   * 获取书籍的角色列表
   * @param {number} bookId
   * @param {Object} params - { page, size, name }
   */
  static async getCharacters(bookId, params = {}) {
    return await httpClient.get(`/api/books/${bookId}/characters`, params)
  }

  /**
   * 创建角色
   * @param {Object} data - 必须包含 bookId
   */
  static async createCharacter(data) {
    return await httpClient.post(`/api/books/${data.bookId}/characters`, data)
  }

  /**
   * 更新角色
   * @param {number} bookId
   * @param {number} id
   * @param {Object} data
   */
  static async updateCharacter(bookId, id, data) {
    return await httpClient.put(`/api/books/${bookId}/characters/${id}`, data)
  }

  /**
   * 删除角色
   * @param {number} bookId
   * @param {number} id
   */
  static async deleteCharacter(bookId, id) {
    return await httpClient.delete(`/api/books/${bookId}/characters/${id}`)
  }

  /**
   * 获取角色详情
   * @param {number} bookId
   * @param {number} id
   */
  static async getCharacter(bookId, id) {
    return await httpClient.get(`/api/books/${bookId}/characters/${id}`)
  }
}
