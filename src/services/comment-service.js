/**
 * 评论服务类
 * 处理评论管理相关的API请求，包括评论CRUD、点赞等
 */

import { httpClient } from '@/utils/http-client.js'

/**
 * 评论服务类
 * 对应后端 /api/comments 接口
 */
export class CommentService {

  /**
   * 获取书籍评论列表
   * @param {number} bookId - 书籍ID
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 评论列表分页数据
   */
  static async getBookComments(bookId, page = 1, size = 10) {
    return await httpClient.get(`/api/comments/book/${bookId}`, { page, size })
  }

  /**
   * 添加评论
   * @param {number} bookId - 书籍ID
   * @param {Object} createRequest - 创建请求参数
   * @param {string} createRequest.content - 评论内容
   * @param {number} [createRequest.rating] - 评分
   * @param {number} [createRequest.parentId] - 父评论ID（回复评论时使用）
   * @returns {Promise<Object>} 创建的评论信息
   */
  static async addComment(bookId, createRequest) {
    return await httpClient.post(`/api/comments/book/${bookId}`, createRequest)
  }

  /**
   * 更新评论
   * @param {number} commentId - 评论ID
   * @param {Object} updateRequest - 更新请求参数
   * @param {string} [updateRequest.content] - 评论内容
   * @param {number} [updateRequest.rating] - 评分
   * @returns {Promise<Object>} 更新后的评论信息
   */
  static async updateComment(commentId, updateRequest) {
    return await httpClient.put(`/api/comments/${commentId}`, updateRequest)
  }

  /**
   * 删除评论
   * @param {number} commentId - 评论ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteComment(commentId) {
    return await httpClient.delete(`/api/comments/${commentId}`)
  }

  /**
   * 点赞评论
   * @param {number} commentId - 评论ID
   * @returns {Promise<boolean>} 点赞结果（true表示点赞，false表示取消点赞）
   */
  static async likeComment(commentId) {
    return await httpClient.post(`/api/comments/${commentId}/like`)
  }

  /**
   * 获取用户在指定书籍的评论
   * @param {number} bookId - 书籍ID
   * @returns {Promise<Object>} 用户评论信息
   */
  static async getUserComment(bookId) {
    return await httpClient.get(`/api/comments/book/${bookId}/user-comment`)
  }
}