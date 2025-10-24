/**
 * 书籍状态存储
 * 
 * 管理书籍相关的状态，包括书籍列表、详情、搜索、点赞收藏等
 */

import { defineStore } from 'pinia'
import { BookService } from '@/services/book-service.js'
import { 
  createPersistConfig, 
  createLoadingState, 
  createPaginationState,
  createSearchState,
  createListState,
  createDetailState,
  createErrorHandler,
  createLoadingManager,
  createPaginationManager
} from './store-config.js'

export const useBookStore = defineStore('book', {
  state: () => ({
    // 书籍列表
    books: {
      ...createListState()
    },
    
    // 当前书籍详情
    currentBook: {
      ...createDetailState()
    },
    
    // 热门书籍
    hotBooks: {
      items: [],
      ...createLoadingState()
    },
    
    // 最新书籍
    latestBooks: {
      items: [],
      ...createLoadingState()
    },
    
    // 搜索结果
    searchResults: {
      ...createSearchState()
    },
    
    // 按作者分组的书籍
    booksByAuthor: {
      items: [],
      authorId: null,
      pagination: createPaginationState(),
      ...createLoadingState()
    },
    
    // 按分类分组的书籍
    booksByCategory: {
      items: [],
      categoryId: null,
      pagination: createPaginationState(),
      ...createLoadingState()
    },
    
    // 按标签分组的书籍
    booksByTags: {
      items: [],
      tagIds: [],
      pagination: createPaginationState(),
      ...createLoadingState()
    },
    
    // 收藏的书籍
    favoriteBooks: {
      items: [],
      pagination: createPaginationState(),
      ...createLoadingState()
    },
    
    // 用户创作的书籍
    myBooks: {
      items: [],
      pagination: createPaginationState(),
      ...createLoadingState()
    },
    
    // 书籍状态缓存（点赞、收藏状态）
    bookStatusCache: {},
    
    // 全局加载状态
    ...createLoadingState()
  }),

  getters: {
    /**
     * 获取书籍总数
     */
    totalBooks: (state) => state.books.pagination.total,
    
    /**
     * 是否有更多书籍可加载
     */
    hasMoreBooks: (state) => {
      const { current, pages } = state.books.pagination
      return current < pages
    },
    
    /**
     * 搜索结果总数
     */
    searchResultsTotal: (state) => state.searchResults.pagination.total,
    
    /**
     * 是否有更多搜索结果可加载
     */
    hasMoreSearchResults: (state) => {
      const { current, pages } = state.searchResults.pagination
      return current < pages
    },
    
    /**
     * 当前书籍是否已点赞
     */
    isCurrentBookLiked: (state) => {
      if (!state.currentBook.item?.id) return false
      const status = state.bookStatusCache[state.currentBook.item.id]
      return status?.isLiked || state.currentBook.item.isLiked || false
    },
    
    /**
     * 当前书籍是否已收藏
     */
    isCurrentBookFavorited: (state) => {
      if (!state.currentBook.item?.id) return false
      const status = state.bookStatusCache[state.currentBook.item.id]
      return status?.isFavorited || state.currentBook.item.isFavorited || false
    },
    
    /**
     * 根据ID获取书籍状态
     */
    getBookStatus: (state) => (bookId) => {
      return state.bookStatusCache[bookId] || {}
    },
    
    /**
     * 获取热门书籍列表
     */
    getHotBooksList: (state) => state.hotBooks.items || [],
    
    /**
     * 获取最新书籍列表
     */
    getLatestBooksList: (state) => state.latestBooks.items || [],
    
    /**
     * 收藏书籍总数
     */
    favoriteCount: (state) => state.favoriteBooks.pagination.total,
    
    /**
     * 我的作品总数
     */
    myBooksCount: (state) => state.myBooks.pagination.total
  },

  actions: {
    // 混入通用方法
    ...createLoadingManager(),
    ...createPaginationManager(),
    handleError: createErrorHandler('BookStore'),

    /**
     * 获取书籍列表
     * @param {Object} params - 查询参数
     * @param {number} [params.page=1] - 页码
     * @param {number} [params.size=10] - 每页大小
     * @param {string} [params.keyword] - 搜索关键词
     * @param {number} [params.categoryId] - 分类ID
     * @param {string} [params.status] - 书籍状态
     * @param {boolean} [append=false] - 是否追加到现有列表
     */
    async fetchBooks(params = {}, append = false) {
      try {
        this.books.loading = true
        this.books.error = null
        
        const { page = 1, size = 10, keyword, categoryId, status } = params
        
        const response = await BookService.getBooks(page, size, keyword, categoryId, status)
        
        if (response) {
          if (append && page > 1) {
            this.books.items = [...this.books.items, ...response.records]
          } else {
            this.books.items = response.records
          }
          this.updateBooksPagination(response)
        }
        
        this.books.loading = false
        this.books.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.books.error = error.message
        this.books.loading = false
        this.handleError(error, '获取书籍列表')
        throw error
      }
    },

    /**
     * 获取书籍详情
     * @param {number} bookId - 书籍ID
     * @param {boolean} [forceRefresh=false] - 是否强制刷新
     */
    async fetchBookById(bookId, forceRefresh = false) {
      try {
        // 如果已有数据且不强制刷新，直接返回
        if (!forceRefresh && this.currentBook.item?.id === bookId) {
          return this.currentBook.item
        }
        
        this.currentBook.loading = true
        this.currentBook.error = null
        
        const book = await BookService.getBookById(bookId)
        
        if (book) {
          this.currentBook.item = book
          
          // 缓存书籍状态
          this.bookStatusCache[bookId] = {
            isLiked: book.isLiked,
            isFavorited: book.isFavorited
          }
        }
        
        this.currentBook.loading = false
        this.currentBook.lastUpdated = new Date().toISOString()
        
        return book
      } catch (error) {
        this.currentBook.error = error.message
        this.currentBook.loading = false
        this.handleError(error, '获取书籍详情')
        throw error
      }
    },

    /**
     * 搜索书籍
     * @param {Object} searchParams - 搜索参数
     * @param {boolean} [append=false] - 是否追加到现有结果
     */
    async searchBooks(searchParams, append = false) {
      try {
        this.searchResults.loading = true
        this.searchResults.error = null
        
        const { page = 1 } = searchParams
        
        if (!append || page === 1) {
          this.searchResults.keyword = searchParams.keyword || ''
          this.searchResults.filters = { ...searchParams }
        }
        
        const response = await BookService.searchBooks(searchParams)
        
        if (response) {
          if (append && page > 1) {
            this.searchResults.results = [...this.searchResults.results, ...response.records]
          } else {
            this.searchResults.results = response.records
          }
          this.updateSearchPagination(response)
        }
        
        this.searchResults.loading = false
        this.searchResults.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.searchResults.error = error.message
        this.searchResults.loading = false
        this.handleError(error, '搜索书籍')
        throw error
      }
    },

    /**
     * 获取热门书籍
     * @param {number} [limit=10] - 限制数量
     */
    async fetchHotBooks(limit = 10) {
      try {
        this.hotBooks.loading = true
        this.hotBooks.error = null
        
        const books = await BookService.getHotBooks(limit)
        
        if (books) {
          this.hotBooks.items = books
        }
        
        this.hotBooks.loading = false
        this.hotBooks.lastUpdated = new Date().toISOString()
        
        return books
      } catch (error) {
        this.hotBooks.error = error.message
        this.hotBooks.loading = false
        this.handleError(error, '获取热门书籍')
        throw error
      }
    },

    /**
     * 获取最新书籍
     * @param {number} [limit=10] - 限制数量
     */
    async fetchLatestBooks(limit = 10) {
      try {
        this.latestBooks.loading = true
        this.latestBooks.error = null
        
        const books = await BookService.getLatestBooks(limit)
        
        if (books) {
          this.latestBooks.items = books
        }
        
        this.latestBooks.loading = false
        this.latestBooks.lastUpdated = new Date().toISOString()
        
        return books
      } catch (error) {
        this.latestBooks.error = error.message
        this.latestBooks.loading = false
        this.handleError(error, '获取最新书籍')
        throw error
      }
    },

    /**
     * 根据作者获取书籍
     * @param {number} authorId - 作者ID
     * @param {number} [page=1] - 页码
     * @param {number} [size=10] - 每页大小
     * @param {boolean} [append=false] - 是否追加到现有列表
     */
    async fetchBooksByAuthor(authorId, page = 1, size = 10, append = false) {
      try {
        this.booksByAuthor.loading = true
        this.booksByAuthor.error = null
        
        if (!append || this.booksByAuthor.authorId !== authorId) {
          this.booksByAuthor.authorId = authorId
        }
        
        const response = await BookService.getBooksByAuthor(authorId, page, size)
        
        if (response) {
          if (append && page > 1) {
            this.booksByAuthor.items = [...this.booksByAuthor.items, ...response.records]
          } else {
            this.booksByAuthor.items = response.records
          }
          this.updateAuthorBooksPagination(response)
        }
        
        this.booksByAuthor.loading = false
        this.booksByAuthor.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.booksByAuthor.error = error.message
        this.booksByAuthor.loading = false
        this.handleError(error, '获取作者书籍')
        throw error
      }
    },

    /**
     * 根据分类获取书籍
     * @param {number} categoryId - 分类ID
     * @param {number} [page=1] - 页码
     * @param {number} [size=10] - 每页大小
     * @param {boolean} [append=false] - 是否追加到现有列表
     */
    async fetchBooksByCategory(categoryId, page = 1, size = 10, append = false) {
      try {
        this.booksByCategory.loading = true
        this.booksByCategory.error = null
        
        if (!append || this.booksByCategory.categoryId !== categoryId) {
          this.booksByCategory.categoryId = categoryId
        }
        
        const response = await BookService.getBooksByCategory(categoryId, page, size)
        
        if (response) {
          if (append && page > 1) {
            this.booksByCategory.items = [...this.booksByCategory.items, ...response.records]
          } else {
            this.booksByCategory.items = response.records
          }
          this.updateCategoryBooksPagination(response)
        }
        
        this.booksByCategory.loading = false
        this.booksByCategory.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.booksByCategory.error = error.message
        this.booksByCategory.loading = false
        this.handleError(error, '获取分类书籍')
        throw error
      }
    },

    /**
     * 根据标签获取书籍
     * @param {number[]} tagIds - 标签ID列表
     * @param {number} [page=1] - 页码
     * @param {number} [size=10] - 每页大小
     * @param {boolean} [append=false] - 是否追加到现有列表
     */
    async fetchBooksByTags(tagIds, page = 1, size = 10, append = false) {
      try {
        this.booksByTags.loading = true
        this.booksByTags.error = null
        
        if (!append || JSON.stringify(this.booksByTags.tagIds) !== JSON.stringify(tagIds)) {
          this.booksByTags.tagIds = tagIds
        }
        
        const response = await BookService.getBooksByTags(tagIds, page, size)
        
        if (response) {
          if (append && page > 1) {
            this.booksByTags.items = [...this.booksByTags.items, ...response.records]
          } else {
            this.booksByTags.items = response.records
          }
          this.updateTagBooksPagination(response)
        }
        
        this.booksByTags.loading = false
        this.booksByTags.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.booksByTags.error = error.message
        this.booksByTags.loading = false
        this.handleError(error, '获取标签书籍')
        throw error
      }
    },

    /**
     * 获取收藏书籍
     * @param {number} [page=1] - 页码
     * @param {number} [size=10] - 每页大小
     * @param {boolean} [append=false] - 是否追加到现有列表
     */
    async fetchFavoriteBooks(page = 1, size = 10, append = false) {
      try {
        this.favoriteBooks.loading = true
        this.favoriteBooks.error = null
        
        const response = await BookService.getFavoriteBooks(page, size)
        
        if (response) {
          if (append && page > 1) {
            this.favoriteBooks.items = [...this.favoriteBooks.items, ...response.records]
          } else {
            this.favoriteBooks.items = response.records
          }
          this.updateFavoriteBooksPagination(response)
        }
        
        this.favoriteBooks.loading = false
        this.favoriteBooks.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.favoriteBooks.error = error.message
        this.favoriteBooks.loading = false
        this.handleError(error, '获取收藏书籍')
        throw error
      }
    },

    /**
     * 点赞书籍
     * @param {number} bookId - 书籍ID
     */
    async likeBook(bookId) {
      try {
        const result = await BookService.likeBook(bookId)
        
        if (result) {
          // 更新缓存状态
          this.updateBookStatus(bookId, { isLiked: true })
          
          // 更新当前书籍状态
          if (this.currentBook.item?.id === bookId) {
            this.currentBook.item.isLiked = true
            this.currentBook.item.likeCount = (this.currentBook.item.likeCount || 0) + 1
          }
          
          // 更新列表中的书籍状态
          this.updateBookInLists(bookId, { 
            isLiked: true, 
            likeCount: (this.getBookFromLists(bookId)?.likeCount || 0) + 1 
          })
          
          if (window.notificationManager) {
            window.notificationManager.success('点赞成功')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '点赞书籍')
        throw error
      }
    },

    /**
     * 取消点赞书籍
     * @param {number} bookId - 书籍ID
     */
    async unlikeBook(bookId) {
      try {
        const result = await BookService.unlikeBook(bookId)
        
        if (result) {
          // 更新缓存状态
          this.updateBookStatus(bookId, { isLiked: false })
          
          // 更新当前书籍状态
          if (this.currentBook.item?.id === bookId) {
            this.currentBook.item.isLiked = false
            this.currentBook.item.likeCount = Math.max((this.currentBook.item.likeCount || 0) - 1, 0)
          }
          
          // 更新列表中的书籍状态
          this.updateBookInLists(bookId, { 
            isLiked: false, 
            likeCount: Math.max((this.getBookFromLists(bookId)?.likeCount || 0) - 1, 0)
          })
          
          if (window.notificationManager) {
            window.notificationManager.success('已取消点赞')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '取消点赞')
        throw error
      }
    },

    /**
     * 收藏书籍
     * @param {number} bookId - 书籍ID
     */
    async favoriteBook(bookId) {
      try {
        const result = await BookService.favoriteBook(bookId)
        
        if (result) {
          // 更新缓存状态
          this.updateBookStatus(bookId, { isFavorited: true })
          
          // 更新当前书籍状态
          if (this.currentBook.item?.id === bookId) {
            this.currentBook.item.isFavorited = true
            this.currentBook.item.favoriteCount = (this.currentBook.item.favoriteCount || 0) + 1
          }
          
          // 更新列表中的书籍状态
          this.updateBookInLists(bookId, { 
            isFavorited: true, 
            favoriteCount: (this.getBookFromLists(bookId)?.favoriteCount || 0) + 1 
          })
          
          if (window.notificationManager) {
            window.notificationManager.success('收藏成功')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '收藏书籍')
        throw error
      }
    },

    /**
     * 取消收藏书籍
     * @param {number} bookId - 书籍ID
     */
    async unfavoriteBook(bookId) {
      try {
        const result = await BookService.unfavoriteBook(bookId)
        
        if (result) {
          // 更新缓存状态
          this.updateBookStatus(bookId, { isFavorited: false })
          
          // 更新当前书籍状态
          if (this.currentBook.item?.id === bookId) {
            this.currentBook.item.isFavorited = false
            this.currentBook.item.favoriteCount = Math.max((this.currentBook.item.favoriteCount || 0) - 1, 0)
          }
          
          // 更新列表中的书籍状态
          this.updateBookInLists(bookId, { 
            isFavorited: false, 
            favoriteCount: Math.max((this.getBookFromLists(bookId)?.favoriteCount || 0) - 1, 0)
          })
          
          // 从收藏列表中移除
          this.favoriteBooks.items = this.favoriteBooks.items.filter(book => book.id !== bookId)
          
          if (window.notificationManager) {
            window.notificationManager.success('已取消收藏')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '取消收藏')
        throw error
      }
    },

    /**
     * 检查书籍点赞状态
     * @param {number} bookId - 书籍ID
     */
    async checkLikeStatus(bookId) {
      try {
        const isLiked = await BookService.checkLikeStatus(bookId)
        this.updateBookStatus(bookId, { isLiked })
        return isLiked
      } catch (error) {
        console.warn('检查点赞状态失败:', error)
        return false
      }
    },

    /**
     * 检查书籍收藏状态
     * @param {number} bookId - 书籍ID
     */
    async checkFavoriteStatus(bookId) {
      try {
        const isFavorited = await BookService.checkFavoriteStatus(bookId)
        this.updateBookStatus(bookId, { isFavorited })
        return isFavorited
      } catch (error) {
        console.warn('检查收藏状态失败:', error)
        return false
      }
    },

    /**
     * 创建书籍
     * @param {Object} createData - 创建数据
     */
    async createBook(createData) {
      try {
        this.startLoading()
        
        const book = await BookService.createBook(createData)
        
        if (book) {
          // 添加到我的书籍列表
          this.myBooks.items.unshift(book)
          this.myBooks.pagination.total++
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('书籍创建成功')
        }
        
        return book
      } catch (error) {
        this.handleError(error, '创建书籍')
        throw error
      }
    },

    /**
     * 更新书籍
     * @param {number} bookId - 书籍ID
     * @param {Object} updateData - 更新数据
     */
    async updateBook(bookId, updateData) {
      try {
        this.startLoading()
        
        const updatedBook = await BookService.updateBook(bookId, updateData)
        
        if (updatedBook) {
          // 更新当前书籍
          if (this.currentBook.item?.id === bookId) {
            this.currentBook.item = { ...this.currentBook.item, ...updatedBook }
          }
          
          // 更新列表中的书籍
          this.updateBookInLists(bookId, updatedBook)
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('书籍更新成功')
        }
        
        return updatedBook
      } catch (error) {
        this.handleError(error, '更新书籍')
        throw error
      }
    },

    /**
     * 删除书籍
     * @param {number} bookId - 书籍ID
     */
    async deleteBook(bookId) {
      try {
        this.startLoading()
        
        const result = await BookService.deleteBook(bookId)
        
        if (result) {
          // 从所有列表中移除
          this.removeBookFromLists(bookId)
          
          // 清除当前书籍（如果是当前书籍）
          if (this.currentBook.item?.id === bookId) {
            this.currentBook.item = null
          }
          
          // 清除状态缓存
          delete this.bookStatusCache[bookId]
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('书籍删除成功')
        }
        
        return result
      } catch (error) {
        this.handleError(error, '删除书籍')
        throw error
      }
    },

    // 工具方法

    /**
     * 更新书籍状态缓存
     * @param {number} bookId - 书籍ID
     * @param {Object} status - 状态对象
     */
    updateBookStatus(bookId, status) {
      this.bookStatusCache[bookId] = {
        ...this.bookStatusCache[bookId],
        ...status
      }
    },

    /**
     * 从列表中获取书籍
     * @param {number} bookId - 书籍ID
     */
    getBookFromLists(bookId) {
      const lists = [
        this.books.items,
        this.searchResults.results,
        this.hotBooks.items,
        this.latestBooks.items,
        this.booksByAuthor.items,
        this.booksByCategory.items,
        this.booksByTags.items,
        this.favoriteBooks.items,
        this.myBooks.items
      ]
      
      for (const list of lists) {
        const book = list.find(b => b.id === bookId)
        if (book) return book
      }
      
      return null
    },

    /**
     * 更新列表中的书籍
     * @param {number} bookId - 书籍ID
     * @param {Object} updates - 更新数据
     */
    updateBookInLists(bookId, updates) {
      const lists = [
        this.books.items,
        this.searchResults.results,
        this.hotBooks.items,
        this.latestBooks.items,
        this.booksByAuthor.items,
        this.booksByCategory.items,
        this.booksByTags.items,
        this.favoriteBooks.items,
        this.myBooks.items
      ]
      
      lists.forEach(list => {
        const index = list.findIndex(book => book.id === bookId)
        if (index !== -1) {
          list[index] = { ...list[index], ...updates }
        }
      })
    },

    /**
     * 从所有列表中移除书籍
     * @param {number} bookId - 书籍ID
     */
    removeBookFromLists(bookId) {
      this.books.items = this.books.items.filter(book => book.id !== bookId)
      this.searchResults.results = this.searchResults.results.filter(book => book.id !== bookId)
      this.hotBooks.items = this.hotBooks.items.filter(book => book.id !== bookId)
      this.latestBooks.items = this.latestBooks.items.filter(book => book.id !== bookId)
      this.booksByAuthor.items = this.booksByAuthor.items.filter(book => book.id !== bookId)
      this.booksByCategory.items = this.booksByCategory.items.filter(book => book.id !== bookId)
      this.booksByTags.items = this.booksByTags.items.filter(book => book.id !== bookId)
      this.favoriteBooks.items = this.favoriteBooks.items.filter(book => book.id !== bookId)
      this.myBooks.items = this.myBooks.items.filter(book => book.id !== bookId)
    },

    // 分页更新方法
    updateBooksPagination(paginationData) {
      if (paginationData) {
        this.books.pagination.current = paginationData.current || 1
        this.books.pagination.size = paginationData.size || 10
        this.books.pagination.total = paginationData.total || 0
        this.books.pagination.pages = Math.ceil(this.books.pagination.total / this.books.pagination.size)
      }
    },

    updateSearchPagination(paginationData) {
      if (paginationData) {
        this.searchResults.pagination.current = paginationData.current || 1
        this.searchResults.pagination.size = paginationData.size || 10
        this.searchResults.pagination.total = paginationData.total || 0
        this.searchResults.pagination.pages = Math.ceil(this.searchResults.pagination.total / this.searchResults.pagination.size)
      }
    },

    updateAuthorBooksPagination(paginationData) {
      if (paginationData) {
        this.booksByAuthor.pagination.current = paginationData.current || 1
        this.booksByAuthor.pagination.size = paginationData.size || 10
        this.booksByAuthor.pagination.total = paginationData.total || 0
        this.booksByAuthor.pagination.pages = Math.ceil(this.booksByAuthor.pagination.total / this.booksByAuthor.pagination.size)
      }
    },

    updateCategoryBooksPagination(paginationData) {
      if (paginationData) {
        this.booksByCategory.pagination.current = paginationData.current || 1
        this.booksByCategory.pagination.size = paginationData.size || 10
        this.booksByCategory.pagination.total = paginationData.total || 0
        this.booksByCategory.pagination.pages = Math.ceil(this.booksByCategory.pagination.total / this.booksByCategory.pagination.size)
      }
    },

    updateTagBooksPagination(paginationData) {
      if (paginationData) {
        this.booksByTags.pagination.current = paginationData.current || 1
        this.booksByTags.pagination.size = paginationData.size || 10
        this.booksByTags.pagination.total = paginationData.total || 0
        this.booksByTags.pagination.pages = Math.ceil(this.booksByTags.pagination.total / this.booksByTags.pagination.size)
      }
    },

    updateFavoriteBooksPagination(paginationData) {
      if (paginationData) {
        this.favoriteBooks.pagination.current = paginationData.current || 1
        this.favoriteBooks.pagination.size = paginationData.size || 10
        this.favoriteBooks.pagination.total = paginationData.total || 0
        this.favoriteBooks.pagination.pages = Math.ceil(this.favoriteBooks.pagination.total / this.favoriteBooks.pagination.size)
      }
    }
  },

  // 持久化配置 - 只持久化必要的数据
  persist: createPersistConfig('book', [
    'bookStatusCache'
  ])
})