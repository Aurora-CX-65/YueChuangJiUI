/**
 * 章节状态存储
 * 
 * 管理章节相关的状态，包括章节列表、详情、阅读进度等
 */

import { defineStore } from 'pinia'
import { ChapterService } from '@/services/chapter-service.js'
import { 
  createPersistConfig, 
  createLoadingState, 
  createPaginationState,
  createListState,
  createDetailState,
  createErrorHandler,
  createLoadingManager,
  createPaginationManager
} from './store-config.js'

export const useChapterStore = defineStore('chapter', {
  state: () => ({
    // 章节列表（按书籍分组）
    chaptersByBook: {},
    
    // 当前章节详情
    currentChapter: {
      ...createDetailState()
    },
    
    // 阅读历史
    readingHistory: {
      items: [],
      pagination: createPaginationState(),
      ...createLoadingState()
    },
    
    // 阅读进度缓存
    readingProgress: {},
    
    // 全局加载状态
    ...createLoadingState()
  }),

  getters: {
    /**
     * 根据书籍ID获取章节列表
     */
    getChaptersByBookId: (state) => (bookId) => {
      return state.chaptersByBook[bookId] || {
        items: [],
        pagination: createPaginationState(),
        ...createLoadingState()
      }
    },
    
    /**
     * 获取当前章节的书籍ID
     */
    currentBookId: (state) => state.currentChapter.item?.bookId,
    
    /**
     * 获取当前章节的序号
     */
    currentChapterOrder: (state) => state.currentChapter.item?.orderNum,
    
    /**
     * 根据书籍ID获取阅读进度
     */
    getReadingProgress: (state) => (bookId) => {
      return state.readingProgress[bookId] || {
        currentChapterId: null,
        currentChapterOrder: 0,
        readPosition: 0,
        lastReadTime: null
      }
    },
    
    /**
     * 检查是否有下一章
     */
    hasNextChapter: (state) => (bookId) => {
      const chapters = state.chaptersByBook[bookId]?.items || []
      const currentOrder = state.currentChapter.item?.orderNum || 0
      return chapters.some(chapter => chapter.orderNum > currentOrder)
    },
    
    /**
     * 检查是否有上一章
     */
    hasPrevChapter: (state) => (bookId) => {
      const chapters = state.chaptersByBook[bookId]?.items || []
      const currentOrder = state.currentChapter.item?.orderNum || 0
      return chapters.some(chapter => chapter.orderNum < currentOrder)
    },
    
    /**
     * 获取下一章
     */
    getNextChapter: (state) => (bookId) => {
      const chapters = state.chaptersByBook[bookId]?.items || []
      const currentOrder = state.currentChapter.item?.orderNum || 0
      return chapters
        .filter(chapter => chapter.orderNum > currentOrder)
        .sort((a, b) => a.orderNum - b.orderNum)[0] || null
    },
    
    /**
     * 获取上一章
     */
    getPrevChapter: (state) => (bookId) => {
      const chapters = state.chaptersByBook[bookId]?.items || []
      const currentOrder = state.currentChapter.item?.orderNum || 0
      return chapters
        .filter(chapter => chapter.orderNum < currentOrder)
        .sort((a, b) => b.orderNum - a.orderNum)[0] || null
    }
  },

  actions: {
    // 混入通用方法
    ...createLoadingManager(),
    ...createPaginationManager(),
    handleError: createErrorHandler('ChapterStore'),

    /**
     * 获取书籍的章节列表
     * @param {number} bookId - 书籍ID
     * @param {number} [page=1] - 页码
     * @param {number} [size=20] - 每页大小
     * @param {boolean} [append=false] - 是否追加到现有列表
     */
    async fetchChaptersByBook(bookId, page = 1, size = 20, append = false) {
      try {
        // 初始化书籍章节状态
        if (!this.chaptersByBook[bookId]) {
          this.chaptersByBook[bookId] = {
            items: [],
            pagination: createPaginationState(),
            ...createLoadingState()
          }
        }
        
        const bookChapters = this.chaptersByBook[bookId]
        bookChapters.loading = true
        bookChapters.error = null
        
        const response = await ChapterService.getChaptersByBookId(bookId, page, size)
        
        if (response) {
          if (append && page > 1) {
            bookChapters.items = [...bookChapters.items, ...response.records]
          } else {
            bookChapters.items = response.records
          }
          this.updateBookChaptersPagination(bookId, response)
        }
        
        bookChapters.loading = false
        bookChapters.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        if (this.chaptersByBook[bookId]) {
          this.chaptersByBook[bookId].error = error.message
          this.chaptersByBook[bookId].loading = false
        }
        this.handleError(error, '获取章节列表')
        throw error
      }
    },

    /**
     * 获取章节详情
     * @param {number} chapterId - 章节ID
     * @param {boolean} [forceRefresh=false] - 是否强制刷新
     */
    async fetchChapterById(chapterId, forceRefresh = false) {
      try {
        // 如果已有数据且不强制刷新，直接返回
        if (!forceRefresh && this.currentChapter.item?.id === chapterId) {
          return this.currentChapter.item
        }
        
        this.currentChapter.loading = true
        this.currentChapter.error = null
        
        const chapter = await ChapterService.getChapterById(chapterId)
        
        if (chapter) {
          this.currentChapter.item = chapter
          
          // 更新阅读进度
          if (chapter.bookId) {
            this.updateReadingProgress(chapter.bookId, {
              currentChapterId: chapter.id,
              currentChapterOrder: chapter.orderNum,
              lastReadTime: new Date().toISOString()
            })
          }
        }
        
        this.currentChapter.loading = false
        this.currentChapter.lastUpdated = new Date().toISOString()
        
        return chapter
      } catch (error) {
        this.currentChapter.error = error.message
        this.currentChapter.loading = false
        this.handleError(error, '获取章节详情')
        throw error
      }
    },

    /**
     * 创建章节
     * @param {Object} createData - 创建数据
     */
    async createChapter(createData) {
      try {
        this.startLoading()
        
        const chapter = await ChapterService.createChapter(createData)
        
        if (chapter && chapter.bookId) {
          // 添加到对应书籍的章节列表
          if (this.chaptersByBook[chapter.bookId]) {
            this.chaptersByBook[chapter.bookId].items.push(chapter)
            this.chaptersByBook[chapter.bookId].pagination.total++
            
            // 按序号排序
            this.chaptersByBook[chapter.bookId].items.sort((a, b) => a.orderNum - b.orderNum)
          }
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('章节创建成功')
        }
        
        return chapter
      } catch (error) {
        this.handleError(error, '创建章节')
        throw error
      }
    },

    /**
     * 更新章节
     * @param {number} chapterId - 章节ID
     * @param {Object} updateData - 更新数据
     */
    async updateChapter(chapterId, updateData) {
      try {
        this.startLoading()
        
        const updatedChapter = await ChapterService.updateChapter(chapterId, updateData)
        
        if (updatedChapter) {
          // 更新当前章节
          if (this.currentChapter.item?.id === chapterId) {
            this.currentChapter.item = { ...this.currentChapter.item, ...updatedChapter }
          }
          
          // 更新列表中的章节
          if (updatedChapter.bookId && this.chaptersByBook[updatedChapter.bookId]) {
            const chapters = this.chaptersByBook[updatedChapter.bookId].items
            const index = chapters.findIndex(chapter => chapter.id === chapterId)
            if (index !== -1) {
              chapters[index] = { ...chapters[index], ...updatedChapter }
              
              // 如果序号改变，重新排序
              if (updateData.orderNum !== undefined) {
                chapters.sort((a, b) => a.orderNum - b.orderNum)
              }
            }
          }
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('章节更新成功')
        }
        
        return updatedChapter
      } catch (error) {
        this.handleError(error, '更新章节')
        throw error
      }
    },

    /**
     * 删除章节
     * @param {number} chapterId - 章节ID
     */
    async deleteChapter(chapterId) {
      try {
        this.startLoading()
        
        const result = await ChapterService.deleteChapter(chapterId)
        
        if (result) {
          // 从列表中移除
          Object.keys(this.chaptersByBook).forEach(bookId => {
            const chapters = this.chaptersByBook[bookId].items
            const index = chapters.findIndex(chapter => chapter.id === chapterId)
            if (index !== -1) {
              chapters.splice(index, 1)
              this.chaptersByBook[bookId].pagination.total--
            }
          })
          
          // 清除当前章节（如果是当前章节）
          if (this.currentChapter.item?.id === chapterId) {
            this.currentChapter.item = null
          }
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('章节删除成功')
        }
        
        return result
      } catch (error) {
        this.handleError(error, '删除章节')
        throw error
      }
    },

    /**
     * 发布章节
     * @param {number} chapterId - 章节ID
     */
    async publishChapter(chapterId) {
      try {
        const result = await ChapterService.publishChapter(chapterId)
        
        if (result) {
          // 更新章节状态
          this.updateChapterInLists(chapterId, { status: 'published' })
          
          if (window.notificationManager) {
            window.notificationManager.success('章节发布成功')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '发布章节')
        throw error
      }
    },

    /**
     * 获取阅读历史
     * @param {number} [page=1] - 页码
     * @param {number} [size=10] - 每页大小
     * @param {boolean} [append=false] - 是否追加到现有列表
     */
    async fetchReadingHistory(page = 1, size = 10, append = false) {
      try {
        this.readingHistory.loading = true
        this.readingHistory.error = null
        
        const response = await ChapterService.getReadingHistory(page, size)
        
        if (response) {
          if (append && page > 1) {
            this.readingHistory.items = [...this.readingHistory.items, ...response.records]
          } else {
            this.readingHistory.items = response.records
          }
          this.updateReadingHistoryPagination(response)
        }
        
        this.readingHistory.loading = false
        this.readingHistory.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.readingHistory.error = error.message
        this.readingHistory.loading = false
        this.handleError(error, '获取阅读历史')
        throw error
      }
    },

    /**
     * 更新阅读进度
     * @param {number} bookId - 书籍ID
     * @param {Object} progress - 进度信息
     */
    updateReadingProgress(bookId, progress) {
      this.readingProgress[bookId] = {
        ...this.readingProgress[bookId],
        ...progress
      }
    },

    /**
     * 记录阅读进度
     * @param {number} chapterId - 章节ID
     * @param {number} [position=0] - 阅读位置
     */
    async recordReadingProgress(chapterId, position = 0) {
      try {
        const result = await ChapterService.recordReadingProgress(chapterId, position)
        
        if (result && this.currentChapter.item) {
          const bookId = this.currentChapter.item.bookId
          this.updateReadingProgress(bookId, {
            currentChapterId: chapterId,
            currentChapterOrder: this.currentChapter.item.orderNum,
            readPosition: position,
            lastReadTime: new Date().toISOString()
          })
        }
        
        return result
      } catch (error) {
        console.warn('记录阅读进度失败:', error)
        return false
      }
    },

    /**
     * 跳转到下一章
     * @param {number} bookId - 书籍ID
     */
    async goToNextChapter(bookId) {
      const nextChapter = this.getNextChapter(bookId)
      if (nextChapter) {
        await this.fetchChapterById(nextChapter.id)
        return nextChapter
      }
      return null
    },

    /**
     * 跳转到上一章
     * @param {number} bookId - 书籍ID
     */
    async goToPrevChapter(bookId) {
      const prevChapter = this.getPrevChapter(bookId)
      if (prevChapter) {
        await this.fetchChapterById(prevChapter.id)
        return prevChapter
      }
      return null
    },

    // 工具方法

    /**
     * 更新列表中的章节
     * @param {number} chapterId - 章节ID
     * @param {Object} updates - 更新数据
     */
    updateChapterInLists(chapterId, updates) {
      Object.keys(this.chaptersByBook).forEach(bookId => {
        const chapters = this.chaptersByBook[bookId].items
        const index = chapters.findIndex(chapter => chapter.id === chapterId)
        if (index !== -1) {
          chapters[index] = { ...chapters[index], ...updates }
        }
      })
    },

    // 分页更新方法
    updateBookChaptersPagination(bookId, paginationData) {
      if (paginationData && this.chaptersByBook[bookId]) {
        const pagination = this.chaptersByBook[bookId].pagination
        pagination.current = paginationData.current || 1
        pagination.size = paginationData.size || 20
        pagination.total = paginationData.total || 0
        pagination.pages = Math.ceil(pagination.total / pagination.size)
      }
    },

    updateReadingHistoryPagination(paginationData) {
      if (paginationData) {
        this.readingHistory.pagination.current = paginationData.current || 1
        this.readingHistory.pagination.size = paginationData.size || 10
        this.readingHistory.pagination.total = paginationData.total || 0
        this.readingHistory.pagination.pages = Math.ceil(this.readingHistory.pagination.total / this.readingHistory.pagination.size)
      }
    }
  },

  // 持久化配置
  persist: createPersistConfig('chapter', [
    'readingProgress'
  ])
})