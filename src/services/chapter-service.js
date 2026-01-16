/**
 * 章节服务类
 * 处理章节管理相关的API请求，包括章节CRUD、发布管理等
 */

import { httpClient } from '@/utils/http-client.js'

/**
 * 章节服务类
 * 对应后端 /api/chapters 接口
 */
export class ChapterService {

  /**
   * 创建章节
   * @param {Object} createRequest - 创建请求参数
   * @param {number} createRequest.bookId - 书籍ID
   * @param {string} createRequest.title - 章节标题
   * @param {string} createRequest.content - 章节内容
   * @param {number} [createRequest.sortOrder] - 章节序号
   * @param {string} [createRequest.status='draft'] - 章节状态
   * @param {boolean} [createRequest.publishImmediately=false] - 是否立即发布
   * @returns {Promise<Object>} 创建的章节信息
   */
  static async createChapter(createRequest) {
    return await httpClient.post('/api/chapters', createRequest)
  }

  /**
   * 根据ID获取章节详情
   * @param {number} chapterId - 章节ID
   * @returns {Promise<Object>} 章节详情
   */
  static async getChapterById(chapterId) {
    return await httpClient.get(`/api/chapters/${chapterId}`)
  }

  /**
   * 更新章节信息
   * @param {number} chapterId - 章节ID
   * @param {Object} updateRequest - 更新请求参数
   * @param {string} [updateRequest.title] - 章节标题
   * @param {string} [updateRequest.content] - 章节内容
   * @param {number} [updateRequest.sortOrder] - 章节序号
   * @param {string} [updateRequest.status] - 章节状态
   * @param {string} [updateRequest.versionNote] - 版本说明
   * @param {boolean} [updateRequest.createVersion=false] - 是否创建版本备份
   * @returns {Promise<Object>} 更新后的章节信息
   */
  static async updateChapter(chapterId, updateRequest) {
    return await httpClient.put(`/api/chapters/${chapterId}`, updateRequest)
  }

  /**
   * 删除章节
   * @param {number} chapterId - 章节ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteChapter(chapterId) {
    return await httpClient.delete(`/api/chapters/${chapterId}`)
  }

  /**
   * 获取书籍章节列表
   * @param {number} bookId - 书籍ID
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 章节列表分页数据
   */
  static async getChaptersByBookId(bookId, page = 1, size = 10) {
    return await httpClient.get(`/api/chapters/book/${bookId}`, { page, size })
  }

  /**
   * 发布章节
   * @param {number} chapterId - 章节ID
   * @returns {Promise<boolean>} 发布结果
   */
  static async publishChapter(chapterId) {
    return await httpClient.post(`/api/chapters/${chapterId}/publish`)
  }

  /**
   * 取消发布章节
   * @param {number} chapterId - 章节ID
   * @returns {Promise<boolean>} 取消发布结果
   */
  static async unpublishChapter(chapterId) {
    return await httpClient.post(`/api/chapters/${chapterId}/unpublish`)
  }

  /**
   * 提交章节审核
   * @param {number} chapterId - 章节ID
   * @returns {Promise<boolean>} 提交结果
   */
  static async submitChapterForReview(chapterId) {
    return await httpClient.post(`/api/chapters/${chapterId}/submit-review`)
  }

  /**
   * 获取章节版本历史
   * @param {number} chapterId - 章节ID
   * @returns {Promise<Array>} 版本历史列表
   */
  static async getChapterVersions(chapterId) {
    return await httpClient.get(`/api/chapters/${chapterId}/versions`)
  }

  /**
   * 恢复章节版本
   * @param {number} chapterId - 章节ID
   * @param {number} versionId - 版本ID
   * @returns {Promise<boolean>} 恢复结果
   */
  static async restoreChapterVersion(chapterId, versionId) {
    return await httpClient.post(`/api/chapters/${chapterId}/versions/${versionId}/restore`)
  }
}