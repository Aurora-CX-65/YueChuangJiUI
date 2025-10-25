/**
 * 搜索服务类
 * 处理搜索相关的功能，包括搜索历史、热门关键词、搜索建议等
 */

import { httpClient } from '@/utils/http-client.js'

/**
 * 搜索服务类
 */
export class SearchService {

  /**
   * 本地存储键名
   */
  static SEARCH_HISTORY_KEY = 'book-search-history'
  static MAX_HISTORY_COUNT = 10

  /**
   * 获取搜索历史
   * @returns {Array<string>} 搜索历史列表
   */
  static getSearchHistory() {
    try {
      const history = localStorage.getItem(this.SEARCH_HISTORY_KEY)
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.error('获取搜索历史失败:', error)
      return []
    }
  }

  /**
   * 添加搜索历史
   * @param {string} keyword - 搜索关键词
   */
  static addSearchHistory(keyword) {
    if (!keyword || keyword.trim() === '') return

    try {
      let history = this.getSearchHistory()
      
      // 移除已存在的相同关键词
      history = history.filter(item => item !== keyword.trim())
      
      // 添加到开头
      history.unshift(keyword.trim())
      
      // 限制历史记录数量
      if (history.length > this.MAX_HISTORY_COUNT) {
        history = history.slice(0, this.MAX_HISTORY_COUNT)
      }
      
      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(history))
    } catch (error) {
      console.error('保存搜索历史失败:', error)
    }
  }

  /**
   * 清除搜索历史
   */
  static clearSearchHistory() {
    try {
      localStorage.removeItem(this.SEARCH_HISTORY_KEY)
    } catch (error) {
      console.error('清除搜索历史失败:', error)
    }
  }

  /**
   * 删除指定搜索历史
   * @param {string} keyword - 要删除的关键词
   */
  static removeSearchHistory(keyword) {
    try {
      let history = this.getSearchHistory()
      history = history.filter(item => item !== keyword)
      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(history))
    } catch (error) {
      console.error('删除搜索历史失败:', error)
    }
  }

  /**
   * 获取热门搜索关键词
   * @param {number} [limit=10] - 限制数量
   * @returns {Promise<Array<string>>} 热门关键词列表
   */
  static async getHotKeywords(limit = 10) {
    try {
      return await httpClient.get('/api/search/hot-keywords', { limit })
    } catch (error) {
      console.error('获取热门关键词失败:', error)
      // 返回默认热门关键词
      return ['玄幻', '都市', '言情', '历史', '科幻', '悬疑', '武侠', '仙侠']
    }
  }

  /**
   * 获取搜索建议
   * @param {string} keyword - 搜索关键词
   * @param {number} [limit=5] - 限制数量
   * @returns {Promise<Array<string>>} 搜索建议列表
   */
  static async getSearchSuggestions(keyword, limit = 5) {
    if (!keyword || keyword.trim() === '') {
      return []
    }

    try {
      return await httpClient.get('/api/search/suggestions', { 
        keyword: keyword.trim(), 
        limit 
      })
    } catch (error) {
      console.error('获取搜索建议失败:', error)
      return []
    }
  }

  /**
   * 记录搜索行为（用于统计）
   * @param {string} keyword - 搜索关键词
   * @param {number} [resultCount=0] - 搜索结果数量
   */
  static async recordSearch(keyword, resultCount = 0) {
    try {
      await httpClient.post('/api/search/record', {
        keyword: keyword.trim(),
        resultCount,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('记录搜索行为失败:', error)
      // 不影响用户体验，静默失败
    }
  }

  /**
   * 获取搜索统计信息
   * @returns {Promise<Object>} 搜索统计信息
   */
  static async getSearchStats() {
    try {
      return await httpClient.get('/api/search/stats')
    } catch (error) {
      console.error('获取搜索统计失败:', error)
      return {
        totalSearches: 0,
        uniqueKeywords: 0,
        topKeywords: []
      }
    }
  }
}