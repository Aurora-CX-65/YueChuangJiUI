/**
 * AI服务类
 * 处理DeepSeek AI功能相关的API请求
 */

import { httpClient } from '@/utils/http-client.js'

/**
 * AI服务类
 * 对应后端 /api/ai 接口
 */
export class AiService {

  /**
   * 自动纠错功能
   * @param {string} content - 需要纠错的文本内容
   * @returns {Promise<string>} 纠错后的文本
   */
  static async autoCorrect(content) {
    return await httpClient.post('/api/ai/auto-correct', { content })
  }

  /**
   * 内容续写功能
   * @param {string} content - 需要续写的文本内容
   * @param {number} [wordCount=200] - 续写字数
   * @returns {Promise<string>} 续写后的文本
   */
  static async contentContinue(content, wordCount = 200) {
    return await httpClient.post('/api/ai/content-continue', { content, wordCount })
  }

  /**
   * 情节建议功能
   * @param {string} content - 故事情节描述
   * @returns {Promise<string>} 情节建议
   */
  static async plotSuggest(content) {
    return await httpClient.post('/api/ai/plot-suggest', { content })
  }

  /**
   * 人物发展建议功能
   * @param {string} content - 人物描述
   * @returns {Promise<string>} 人物发展建议
   */
  static async characterDevelop(content) {
    return await httpClient.post('/api/ai/character-develop', { content })
  }

  /**
   * 获取AI使用记录
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 使用记录分页数据
   */
  static async getUsageLogs(page = 1, size = 10) {
    return await httpClient.get('/api/ai/usage-logs', { page, size })
  }

  /**
   * 获取AI使用统计
   * @returns {Promise<Object>} 使用统计信息
   */
  static async getUsageStats() {
    return await httpClient.get('/api/ai/usage-stats')
  }
}