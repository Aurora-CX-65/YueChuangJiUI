/**
 * 书籍服务类
 * 处理书籍管理相关的API请求，包括书籍CRUD、搜索、点赞收藏等
 */

import { httpClient } from '@/utils/http-client.js'

/**
 * 书籍服务类
 * 对应后端 /api/books 接口
 */
export class BookService {

  /**
   * 创建书籍
   * @param {Object} createRequest - 创建请求参数
   * @param {string} createRequest.title - 书籍标题
   * @param {string} [createRequest.penName] - 笔名
   * @param {string} [createRequest.description] - 书籍简介
   * @param {string} [createRequest.coverImage] - 封面图片URL
   * @param {number} createRequest.categoryId - 分类ID
   * @param {number[]} [createRequest.tagIds] - 标签ID列表
   * @returns {Promise<Object>} 创建的书籍信息
   */
  static async createBook(createRequest) {
    return await httpClient.post('/api/books', createRequest)
  }

  /**
   * 根据ID获取书籍详情
   * @param {number} bookId - 书籍ID
   * @returns {Promise<Object>} 书籍详情
   */
  static async getBookById(bookId) {
    return await httpClient.get(`/api/books/${bookId}`)
  }

  /**
   * 更新书籍信息
   * @param {number} bookId - 书籍ID
   * @param {Object} updateRequest - 更新请求参数
   * @param {string} [updateRequest.title] - 书籍标题
   * @param {string} [updateRequest.penName] - 笔名
   * @param {string} [updateRequest.description] - 书籍简介
   * @param {string} [updateRequest.coverImage] - 封面图片URL
   * @param {number} [updateRequest.categoryId] - 分类ID
   * @param {string} [updateRequest.status] - 书籍状态
   * @param {number[]} [updateRequest.tagIds] - 标签ID列表
   * @returns {Promise<Object>} 更新后的书籍信息
   */
  static async updateBook(bookId, updateRequest) {
    return await httpClient.put(`/api/books/${bookId}`, updateRequest)
  }

  /**
   * 删除书籍
   * @param {number} bookId - 书籍ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteBook(bookId) {
    return await httpClient.delete(`/api/books/${bookId}`)
  }

  /**
   * 获取书籍列表
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @param {string} [keyword] - 搜索关键词
   * @param {number} [categoryId] - 分类ID
   * @param {string} [status] - 书籍状态
   * @returns {Promise<Object>} 书籍列表分页数据
   */
  static async getBooks(page = 1, size = 10, keyword, categoryId, status) {
    const params = { page, size }
    if (keyword) params.keyword = keyword
    if (categoryId) params.categoryId = categoryId
    if (status) params.status = status
    
    return await httpClient.get('/api/books', params)
  }

  /**
   * 复杂搜索书籍
   * @param {Object} searchRequest - 搜索请求参数
   * @param {string} [searchRequest.keyword] - 搜索关键词
   * @param {number} [searchRequest.categoryId] - 分类ID
   * @param {number[]} [searchRequest.tagIds] - 标签ID列表
   * @param {string} [searchRequest.status] - 书籍状态
   * @param {number} [searchRequest.authorId] - 作者ID
   * @param {string} [searchRequest.sortBy='latest'] - 排序方式
   * @param {number} [searchRequest.page=1] - 页码
   * @param {number} [searchRequest.size=10] - 每页大小
   * @returns {Promise<Object>} 搜索结果分页数据
   */
  static async searchBooks(searchRequest) {
    return await httpClient.post('/api/books/search', searchRequest)
  }

  /**
   * 根据作者获取书籍列表
   * @param {number} authorId - 作者ID
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 作者书籍列表分页数据
   */
  static async getBooksByAuthor(authorId, page = 1, size = 10) {
    return await httpClient.get(`/api/books/author/${authorId}`, { page, size })
  }

  /**
   * 根据分类获取书籍列表
   * @param {number} categoryId - 分类ID
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 分类书籍列表分页数据
   */
  static async getBooksByCategory(categoryId, page = 1, size = 10) {
    return await httpClient.get(`/api/books/category/${categoryId}`, { page, size })
  }

  /**
   * 根据标签获取书籍列表
   * @param {number[]} tagIds - 标签ID列表
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 标签书籍列表分页数据
   */
  static async getBooksByTags(tagIds, page = 1, size = 10) {
    return await httpClient.get('/api/books/tags', { tagIds, page, size })
  }

  /**
   * 点赞书籍
   * @param {number} bookId - 书籍ID
   * @returns {Promise<boolean>} 点赞结果
   */
  static async likeBook(bookId) {
    return await httpClient.post(`/api/books/${bookId}/like`)
  }

  /**
   * 取消点赞书籍
   * @param {number} bookId - 书籍ID
   * @returns {Promise<boolean>} 取消点赞结果
   */
  static async unlikeBook(bookId) {
    return await httpClient.delete(`/api/books/${bookId}/like`)
  }

  /**
   * 检查点赞状态
   * @param {number} bookId - 书籍ID
   * @returns {Promise<boolean>} 是否已点赞
   */
  static async checkLikeStatus(bookId) {
    return await httpClient.get(`/api/books/${bookId}/like/status`)
  }

  /**
   * 收藏书籍
   * @param {number} bookId - 书籍ID
   * @returns {Promise<boolean>} 收藏结果
   */
  static async favoriteBook(bookId) {
    return await httpClient.post(`/api/books/${bookId}/favorite`)
  }

  /**
   * 取消收藏书籍
   * @param {number} bookId - 书籍ID
   * @returns {Promise<boolean>} 取消收藏结果
   */
  static async unfavoriteBook(bookId) {
    return await httpClient.delete(`/api/books/${bookId}/favorite`)
  }

  /**
   * 检查收藏状态
   * @param {number} bookId - 书籍ID
   * @returns {Promise<boolean>} 是否已收藏
   */
  static async checkFavoriteStatus(bookId) {
    return await httpClient.get(`/api/books/${bookId}/favorite/status`)
  }

  /**
   * 获取热门书籍
   * @param {number} [limit=10] - 限制数量
   * @returns {Promise<Array>} 热门书籍列表
   */
  static async getHotBooks(limit = 10) {
    return await httpClient.get('/api/books/hot', { limit })
  }

  /**
   * 获取最新书籍
   * @param {number} [limit=10] - 限制数量
   * @returns {Promise<Array>} 最新书籍列表
   */
  static async getLatestBooks(limit = 10) {
    return await httpClient.get('/api/books/latest', { limit })
  }

  /**
   * 获取收藏书籍列表
   * @param {number} [page=1] - 页码
   * @param {number} [size=10] - 每页大小
   * @returns {Promise<Object>} 收藏书籍列表分页数据
   */
  static async getFavoriteBooks(page = 1, size = 10) {
    return await httpClient.get('/api/books/favorites', { page, size })
  }

  /**
   * 上传书籍封面
   * @param {number} bookId - 书籍ID
   * @param {File} file - 封面文件
   * @returns {Promise<string>} 封面URL
   */
  static async uploadBookCover(bookId, file) {
    const formData = new FormData()
    formData.append('file', file)
    return await httpClient.upload(`/api/books/${bookId}/cover`, formData)
  }
}