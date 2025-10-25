/**
 * 人物设定服务类
 * 处理人物设定相关的API请求
 */

import { httpClient } from '@/utils/http-client.js'

/**
 * 人物设定服务类
 * 对应后端 /api/character-settings 接口
 */
export class CharacterSettingService {

  /**
   * 获取书籍的人物设定列表
   * @param {number} bookId - 书籍ID
   * @returns {Promise<Array>} 人物设定列表
   */
  static async getCharactersByBookId(bookId) {
    return await httpClient.get(`/api/books/${bookId}/character-settings`)
  }

  /**
   * 根据ID获取人物设定详情
   * @param {number} characterId - 人物设定ID
   * @returns {Promise<Object>} 人物设定详情
   */
  static async getCharacterById(characterId) {
    return await httpClient.get(`/api/character-settings/${characterId}`)
  }

  /**
   * 创建人物设定
   * @param {Object} characterData - 人物设定数据
   * @param {number} characterData.bookId - 书籍ID
   * @param {string} characterData.name - 人物姓名
   * @param {string} [characterData.nickname] - 人物昵称
   * @param {string} [characterData.gender] - 性别
   * @param {number} [characterData.age] - 年龄
   * @param {string} [characterData.appearance] - 外貌描述
   * @param {string} [characterData.personality] - 性格描述
   * @param {string} [characterData.background] - 背景故事
   * @param {string} [characterData.relationships] - 人物关系
   * @param {string} [characterData.abilities] - 特殊能力
   * @param {string} [characterData.notes] - 备注
   * @param {string} [characterData.avatar] - 头像URL
   * @param {number} [characterData.sortOrder] - 排序顺序
   * @returns {Promise<Object>} 创建的人物设定信息
   */
  static async createCharacter(characterData) {
    return await httpClient.post('/api/character-settings', characterData)
  }

  /**
   * 更新人物设定
   * @param {number} characterId - 人物设定ID
   * @param {Object} characterData - 更新数据
   * @param {string} [characterData.name] - 人物姓名
   * @param {string} [characterData.nickname] - 人物昵称
   * @param {string} [characterData.gender] - 性别
   * @param {number} [characterData.age] - 年龄
   * @param {string} [characterData.appearance] - 外貌描述
   * @param {string} [characterData.personality] - 性格描述
   * @param {string} [characterData.background] - 背景故事
   * @param {string} [characterData.relationships] - 人物关系
   * @param {string} [characterData.abilities] - 特殊能力
   * @param {string} [characterData.notes] - 备注
   * @param {string} [characterData.avatar] - 头像URL
   * @param {number} [characterData.sortOrder] - 排序顺序
   * @returns {Promise<Object>} 更新后的人物设定信息
   */
  static async updateCharacter(characterId, characterData) {
    return await httpClient.put(`/api/character-settings/${characterId}`, characterData)
  }

  /**
   * 删除人物设定
   * @param {number} characterId - 人物设定ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteCharacter(characterId) {
    return await httpClient.delete(`/api/character-settings/${characterId}`)
  }

  /**
   * 批量删除人物设定
   * @param {Array<number>} characterIds - 人物设定ID列表
   * @returns {Promise<Object>} 批量操作结果
   */
  static async batchDeleteCharacters(characterIds) {
    return await httpClient.post('/api/character-settings/batch/delete', { characterIds })
  }

  /**
   * 复制人物设定
   * @param {number} characterId - 源人物设定ID
   * @param {Object} [options] - 复制选项
   * @param {string} [options.newName] - 新人物名称
   * @param {number} [options.targetBookId] - 目标书籍ID
   * @returns {Promise<Object>} 复制的人物设定信息
   */
  static async duplicateCharacter(characterId, options = {}) {
    return await httpClient.post(`/api/character-settings/${characterId}/duplicate`, options)
  }

  /**
   * 搜索人物设定
   * @param {Object} params - 搜索参数
   * @param {number} [params.bookId] - 书籍ID
   * @param {string} [params.keyword] - 搜索关键词
   * @param {string} [params.gender] - 性别筛选
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.size=10] - 每页大小
   * @returns {Promise<Object>} 搜索结果分页数据
   */
  static async searchCharacters(params = {}) {
    const queryParams = {
      page: params.page || 1,
      size: params.size || 10,
      ...params
    }
    
    return await httpClient.get('/api/character-settings/search', queryParams)
  }

  /**
   * 更新人物设定排序
   * @param {number} bookId - 书籍ID
   * @param {Array<Object>} sortData - 排序数据
   * @param {number} sortData[].id - 人物设定ID
   * @param {number} sortData[].sortOrder - 新的排序顺序
   * @returns {Promise<boolean>} 更新结果
   */
  static async updateCharacterSort(bookId, sortData) {
    return await httpClient.put(`/api/books/${bookId}/character-settings/sort`, { characters: sortData })
  }

  /**
   * 验证人物名称唯一性
   * @param {number} bookId - 书籍ID
   * @param {string} name - 人物名称
   * @param {number} [excludeId] - 排除的人物设定ID（用于更新时验证）
   * @returns {Promise<boolean>} 是否可用
   */
  static async validateCharacterName(bookId, name, excludeId = null) {
    const params = { bookId, name }
    if (excludeId) {
      params.excludeId = excludeId
    }
    return await httpClient.get('/api/character-settings/validate-name', params)
  }

  /**
   * 获取人物关系图数据
   * @param {number} bookId - 书籍ID
   * @returns {Promise<Object>} 人物关系图数据
   */
  static async getCharacterRelationships(bookId) {
    return await httpClient.get(`/api/books/${bookId}/character-settings/relationships`)
  }

  /**
   * 更新人物关系
   * @param {number} bookId - 书籍ID
   * @param {Array<Object>} relationships - 关系数据
   * @param {number} relationships[].fromCharacterId - 源人物ID
   * @param {number} relationships[].toCharacterId - 目标人物ID
   * @param {string} relationships[].relationshipType - 关系类型
   * @param {string} [relationships[].description] - 关系描述
   * @returns {Promise<boolean>} 更新结果
   */
  static async updateCharacterRelationships(bookId, relationships) {
    return await httpClient.put(`/api/books/${bookId}/character-settings/relationships`, { relationships })
  }

  /**
   * 导出人物设定
   * @param {number} bookId - 书籍ID
   * @param {string} [format='json'] - 导出格式 (json, csv, pdf)
   * @returns {Promise<Blob>} 导出文件
   */
  static async exportCharacters(bookId, format = 'json') {
    return await httpClient.get(`/api/books/${bookId}/character-settings/export`, { format }, {
      responseType: 'blob'
    })
  }

  /**
   * 导入人物设定
   * @param {number} bookId - 书籍ID
   * @param {File} file - 导入文件
   * @param {Object} [options] - 导入选项
   * @param {boolean} [options.overwrite=false] - 是否覆盖同名人物
   * @returns {Promise<Object>} 导入结果
   */
  static async importCharacters(bookId, file, options = {}) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('options', JSON.stringify(options))
    
    return await httpClient.post(`/api/books/${bookId}/character-settings/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}