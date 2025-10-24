/**
 * 评论状态存储
 * 
 * 管理评论相关的状态，包括评论列表、回复等
 */

import { defineStore } from 'pinia'
import { CommentService } from '@/services/comment-service.js'
import { 
  createPersistConfig, 
  createLoadingState, 
  createPaginationState,
  createListState,
  createErrorHandler,
  createLoadingManager,
  createPaginationManager
} from './store-config.js'

export const useCommentStore = defineStore('comment', {
  state: () => ({
    // 评论列表（按书籍或章节分组）
    commentsByTarget: {},
    
    // 我的评论
    myComments: {
      ...createListState()
    },
    
    // 全局加载状态
    ...createLoadingState()
  }),

  getters: {
    /**
     * 根据目标获取评论列表
     */
    getCommentsByTarget: (state) => (targetType, targetId) => {
      const key = `${targetType}_${targetId}`
      return state.commentsByTarget[key] || {
        items: [],
        pagination: createPaginationState(),
        ...createLoadingState()
      }
    },
    
    /**
     * 我的评论总数
     */
    myCommentsCount: (state) => state.myComments.pagination.total
  },

  actions: {
    // 混入通用方法
    ...createLoadingManager(),
    ...createPaginationManager(),
    handleError: createErrorHandler('CommentStore'),

    /**
     * 获取评论列表
     * @param {string} targetType - 目标类型 (book, chapter)
     * @param {number} targetId - 目标ID
     * @param {number} [page=1] - 页码
     * @param {number} [size=10] - 每页大小
     * @param {boolean} [append=false] - 是否追加到现有列表
     */
    async fetchComments(targetType, targetId, page = 1, size = 10, append = false) {
      try {
        const key = `${targetType}_${targetId}`
        
        // 初始化目标评论状态
        if (!this.commentsByTarget[key]) {
          this.commentsByTarget[key] = {
            items: [],
            pagination: createPaginationState(),
            ...createLoadingState()
          }
        }
        
        const targetComments = this.commentsByTarget[key]
        targetComments.loading = true
        targetComments.error = null
        
        const response = await CommentService.getComments(targetType, targetId, page, size)
        
        if (response) {
          if (append && page > 1) {
            targetComments.items = [...targetComments.items, ...response.records]
          } else {
            targetComments.items = response.records
          }
          this.updateTargetCommentsPagination(key, response)
        }
        
        targetComments.loading = false
        targetComments.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        const key = `${targetType}_${targetId}`
        if (this.commentsByTarget[key]) {
          this.commentsByTarget[key].error = error.message
          this.commentsByTarget[key].loading = false
        }
        this.handleError(error, '获取评论列表')
        throw error
      }
    },

    /**
     * 创建评论
     * @param {Object} commentData - 评论数据
     */
    async createComment(commentData) {
      try {
        this.startLoading()
        
        const comment = await CommentService.createComment(commentData)
        
        if (comment) {
          // 添加到对应目标的评论列表
          const key = `${commentData.targetType}_${commentData.targetId}`
          if (this.commentsByTarget[key]) {
            this.commentsByTarget[key].items.unshift(comment)
            this.commentsByTarget[key].pagination.total++
          }
          
          // 添加到我的评论列表
          this.myComments.items.unshift(comment)
          this.myComments.pagination.total++
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('评论发表成功')
        }
        
        return comment
      } catch (error) {
        this.handleError(error, '发表评论')
        throw error
      }
    },

    /**
     * 回复评论
     * @param {number} commentId - 被回复的评论ID
     * @param {Object} replyData - 回复数据
     */
    async replyComment(commentId, replyData) {
      try {
        this.startLoading()
        
        const reply = await CommentService.replyComment(commentId, replyData)
        
        if (reply) {
          // 找到被回复的评论并添加回复
          Object.keys(this.commentsByTarget).forEach(key => {
            const comments = this.commentsByTarget[key].items
            const parentComment = comments.find(c => c.id === commentId)
            if (parentComment) {
              if (!parentComment.replies) {
                parentComment.replies = []
              }
              parentComment.replies.push(reply)
              parentComment.replyCount = (parentComment.replyCount || 0) + 1
            }
          })
          
          // 添加到我的评论列表
          this.myComments.items.unshift(reply)
          this.myComments.pagination.total++
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('回复发表成功')
        }
        
        return reply
      } catch (error) {
        this.handleError(error, '发表回复')
        throw error
      }
    },

    /**
     * 点赞评论
     * @param {number} commentId - 评论ID
     */
    async likeComment(commentId) {
      try {
        const result = await CommentService.likeComment(commentId)
        
        if (result) {
          // 更新评论点赞状态
          this.updateCommentInLists(commentId, { 
            isLiked: true,
            likeCount: (this.getCommentFromLists(commentId)?.likeCount || 0) + 1
          })
          
          if (window.notificationManager) {
            window.notificationManager.success('点赞成功')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '点赞评论')
        throw error
      }
    },

    /**
     * 取消点赞评论
     * @param {number} commentId - 评论ID
     */
    async unlikeComment(commentId) {
      try {
        const result = await CommentService.unlikeComment(commentId)
        
        if (result) {
          // 更新评论点赞状态
          this.updateCommentInLists(commentId, { 
            isLiked: false,
            likeCount: Math.max((this.getCommentFromLists(commentId)?.likeCount || 0) - 1, 0)
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
     * 删除评论
     * @param {number} commentId - 评论ID
     */
    async deleteComment(commentId) {
      try {
        this.startLoading()
        
        const result = await CommentService.deleteComment(commentId)
        
        if (result) {
          // 从所有列表中移除
          this.removeCommentFromLists(commentId)
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('评论删除成功')
        }
        
        return result
      } catch (error) {
        this.handleError(error, '删除评论')
        throw error
      }
    },

    /**
     * 获取我的评论
     * @param {number} [page=1] - 页码
     * @param {number} [size=10] - 每页大小
     * @param {boolean} [append=false] - 是否追加到现有列表
     */
    async fetchMyComments(page = 1, size = 10, append = false) {
      try {
        this.myComments.loading = true
        this.myComments.error = null
        
        const response = await CommentService.getMyComments(page, size)
        
        if (response) {
          if (append && page > 1) {
            this.myComments.items = [...this.myComments.items, ...response.records]
          } else {
            this.myComments.items = response.records
          }
          this.updateMyCommentsPagination(response)
        }
        
        this.myComments.loading = false
        this.myComments.lastUpdated = new Date().toISOString()
        
        return response
      } catch (error) {
        this.myComments.error = error.message
        this.myComments.loading = false
        this.handleError(error, '获取我的评论')
        throw error
      }
    },

    // 工具方法

    /**
     * 从列表中获取评论
     * @param {number} commentId - 评论ID
     */
    getCommentFromLists(commentId) {
      // 从所有目标评论列表中查找
      for (const key of Object.keys(this.commentsByTarget)) {
        const comment = this.commentsByTarget[key].items.find(c => c.id === commentId)
        if (comment) return comment
        
        // 在回复中查找
        for (const c of this.commentsByTarget[key].items) {
          if (c.replies) {
            const reply = c.replies.find(r => r.id === commentId)
            if (reply) return reply
          }
        }
      }
      
      // 从我的评论中查找
      const myComment = this.myComments.items.find(c => c.id === commentId)
      if (myComment) return myComment
      
      return null
    },

    /**
     * 更新列表中的评论
     * @param {number} commentId - 评论ID
     * @param {Object} updates - 更新数据
     */
    updateCommentInLists(commentId, updates) {
      // 更新所有目标评论列表
      Object.keys(this.commentsByTarget).forEach(key => {
        const comments = this.commentsByTarget[key].items
        const index = comments.findIndex(c => c.id === commentId)
        if (index !== -1) {
          comments[index] = { ...comments[index], ...updates }
        }
        
        // 更新回复
        comments.forEach(comment => {
          if (comment.replies) {
            const replyIndex = comment.replies.findIndex(r => r.id === commentId)
            if (replyIndex !== -1) {
              comment.replies[replyIndex] = { ...comment.replies[replyIndex], ...updates }
            }
          }
        })
      })
      
      // 更新我的评论列表
      const myCommentIndex = this.myComments.items.findIndex(c => c.id === commentId)
      if (myCommentIndex !== -1) {
        this.myComments.items[myCommentIndex] = { ...this.myComments.items[myCommentIndex], ...updates }
      }
    },

    /**
     * 从所有列表中移除评论
     * @param {number} commentId - 评论ID
     */
    removeCommentFromLists(commentId) {
      // 从所有目标评论列表中移除
      Object.keys(this.commentsByTarget).forEach(key => {
        const comments = this.commentsByTarget[key].items
        const index = comments.findIndex(c => c.id === commentId)
        if (index !== -1) {
          comments.splice(index, 1)
          this.commentsByTarget[key].pagination.total--
        }
        
        // 从回复中移除
        comments.forEach(comment => {
          if (comment.replies) {
            const replyIndex = comment.replies.findIndex(r => r.id === commentId)
            if (replyIndex !== -1) {
              comment.replies.splice(replyIndex, 1)
              comment.replyCount = Math.max((comment.replyCount || 0) - 1, 0)
            }
          }
        })
      })
      
      // 从我的评论列表中移除
      const myCommentIndex = this.myComments.items.findIndex(c => c.id === commentId)
      if (myCommentIndex !== -1) {
        this.myComments.items.splice(myCommentIndex, 1)
        this.myComments.pagination.total--
      }
    },

    // 分页更新方法
    updateTargetCommentsPagination(key, paginationData) {
      if (paginationData && this.commentsByTarget[key]) {
        const pagination = this.commentsByTarget[key].pagination
        pagination.current = paginationData.current || 1
        pagination.size = paginationData.size || 10
        pagination.total = paginationData.total || 0
        pagination.pages = Math.ceil(pagination.total / pagination.size)
      }
    },

    updateMyCommentsPagination(paginationData) {
      if (paginationData) {
        this.myComments.pagination.current = paginationData.current || 1
        this.myComments.pagination.size = paginationData.size || 10
        this.myComments.pagination.total = paginationData.total || 0
        this.myComments.pagination.pages = Math.ceil(this.myComments.pagination.total / this.myComments.pagination.size)
      }
    }
  }
})