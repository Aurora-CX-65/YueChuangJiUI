/**
 * 标签状态存储
 * 
 * 管理标签相关的状态，包括标签列表、标签统计等
 */

import { defineStore } from 'pinia'
import { TagService } from '@/services/tag-service.js'
import { 
  createPersistConfig, 
  createLoadingState,
  createErrorHandler,
  createLoadingManager
} from './store-config.js'

export const useTagStore = defineStore('tag', {
  state: () => ({
    // 所有标签列表
    tags: [],
    
    // 标签统计信息
    tagStats: {},
    
    // 热门标签
    popularTags: [],
    
    // 全局加载状态
    ...createLoadingState()
  }),

  getters: {
    /**
     * 根据ID获取标签
     */
    getTagById: (state) => (tagId) => {
      return state.tags.find(tag => tag.id === tagId)
    },
    
    /**
     * 根据名称获取标签
     */
    getTagByName: (state) => (tagName) => {
      return state.tags.find(tag => tag.name === tagName)
    },
    
    /**
     * 根据IDs获取标签列表
     */
    getTagsByIds: (state) => (tagIds) => {
      return state.tags.filter(tag => tagIds.includes(tag.id))
    },
    
    /**
     * 搜索标签
     */
    searchTags: (state) => (keyword) => {
      if (!keyword) return state.tags
      const lowerKeyword = keyword.toLowerCase()
      return state.tags.filter(tag => 
        tag.name.toLowerCase().includes(lowerKeyword) ||
        (tag.description && tag.description.toLowerCase().includes(lowerKeyword))
      )
    },
    
    /**
     * 按使用频率排序的标签
     */
    tagsByPopularity: (state) => {
      return [...state.tags].sort((a, b) => {
        const aCount = state.tagStats[a.id]?.bookCount || 0
        const bCount = state.tagStats[b.id]?.bookCount || 0
        return bCount - aCount
      })
    },
    
    /**
     * 获取标签云数据
     */
    tagCloudData: (state) => {
      return state.tags.map(tag => ({
        ...tag,
        count: state.tagStats[tag.id]?.bookCount || 0,
        weight: Math.min(Math.max((state.tagStats[tag.id]?.bookCount || 0) / 10, 1), 5)
      })).filter(tag => tag.count > 0)
    }
  },

  actions: {
    // 混入通用方法
    ...createLoadingManager(),
    handleError: createErrorHandler('TagStore'),

    /**
     * 获取所有标签
     * @param {boolean} [forceRefresh=false] - 是否强制刷新
     */
    async fetchTags(forceRefresh = false) {
      try {
        // 如果已有数据且不强制刷新，直接返回
        if (!forceRefresh && this.tags.length > 0) {
          return this.tags
        }
        
        this.startLoading()
        
        const tags = await TagService.getAllTags()
        
        if (tags) {
          this.tags = tags
        }
        
        this.stopLoading()
        
        return tags
      } catch (error) {
        this.handleError(error, '获取标签列表')
        throw error
      }
    },

    /**
     * 获取热门标签
     * @param {number} [limit=20] - 限制数量
     * @param {boolean} [forceRefresh=false] - 是否强制刷新
     */
    async fetchPopularTags(limit = 20, forceRefresh = false) {
      try {
        // 如果已有数据且不强制刷新，直接返回
        if (!forceRefresh && this.popularTags.length > 0) {
          return this.popularTags
        }
        
        const tags = await TagService.getPopularTags(limit)
        
        if (tags) {
          this.popularTags = tags
        }
        
        return tags
      } catch (error) {
        console.warn('获取热门标签失败:', error)
        return []
      }
    },

    /**
     * 获取标签统计信息
     * @param {boolean} [forceRefresh=false] - 是否强制刷新
     */
    async fetchTagStats(forceRefresh = false) {
      try {
        // 如果已有数据且不强制刷新，直接返回
        if (!forceRefresh && Object.keys(this.tagStats).length > 0) {
          return this.tagStats
        }
        
        const stats = await TagService.getTagStats()
        
        if (stats) {
          this.tagStats = stats
        }
        
        return stats
      } catch (error) {
        console.warn('获取标签统计失败:', error)
        return {}
      }
    },

    /**
     * 搜索标签
     * @param {string} keyword - 搜索关键词
     */
    async searchTagsByKeyword(keyword) {
      try {
        if (!keyword.trim()) {
          return this.tags
        }
        
        const tags = await TagService.searchTags(keyword)
        return tags || []
      } catch (error) {
        console.warn('搜索标签失败:', error)
        return []
      }
    },

    /**
     * 创建标签（管理员功能）
     * @param {Object} tagData - 标签数据
     */
    async createTag(tagData) {
      try {
        this.startLoading()
        
        const tag = await TagService.createTag(tagData)
        
        if (tag) {
          this.tags.push(tag)
          
          // 初始化统计信息
          this.tagStats[tag.id] = {
            bookCount: 0,
            authorCount: 0
          }
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('标签创建成功')
        }
        
        return tag
      } catch (error) {
        this.handleError(error, '创建标签')
        throw error
      }
    },

    /**
     * 更新标签（管理员功能）
     * @param {number} tagId - 标签ID
     * @param {Object} updateData - 更新数据
     */
    async updateTag(tagId, updateData) {
      try {
        this.startLoading()
        
        const updatedTag = await TagService.updateTag(tagId, updateData)
        
        if (updatedTag) {
          const index = this.tags.findIndex(t => t.id === tagId)
          if (index !== -1) {
            this.tags[index] = { ...this.tags[index], ...updatedTag }
          }
          
          // 更新热门标签列表
          const popularIndex = this.popularTags.findIndex(t => t.id === tagId)
          if (popularIndex !== -1) {
            this.popularTags[popularIndex] = { ...this.popularTags[popularIndex], ...updatedTag }
          }
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('标签更新成功')
        }
        
        return updatedTag
      } catch (error) {
        this.handleError(error, '更新标签')
        throw error
      }
    },

    /**
     * 删除标签（管理员功能）
     * @param {number} tagId - 标签ID
     */
    async deleteTag(tagId) {
      try {
        this.startLoading()
        
        const result = await TagService.deleteTag(tagId)
        
        if (result) {
          // 从列表中移除
          this.tags = this.tags.filter(t => t.id !== tagId)
          this.popularTags = this.popularTags.filter(t => t.id !== tagId)
          
          // 移除统计信息
          delete this.tagStats[tagId]
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('标签删除成功')
        }
        
        return result
      } catch (error) {
        this.handleError(error, '删除标签')
        throw error
      }
    },

    /**
     * 更新标签统计
     * @param {number} tagId - 标签ID
     * @param {Object} stats - 统计数据
     */
    updateTagStats(tagId, stats) {
      if (this.tagStats[tagId]) {
        this.tagStats[tagId] = { ...this.tagStats[tagId], ...stats }
      } else {
        this.tagStats[tagId] = stats
      }
    },

    /**
     * 批量获取标签信息
     * @param {number[]} tagIds - 标签ID列表
     */
    async fetchTagsByIds(tagIds) {
      try {
        if (!tagIds || tagIds.length === 0) {
          return []
        }
        
        // 检查哪些标签需要从服务器获取
        const missingTagIds = tagIds.filter(id => !this.getTagById(id))
        
        if (missingTagIds.length > 0) {
          const tags = await TagService.getTagsByIds(missingTagIds)
          
          if (tags && tags.length > 0) {
            // 添加到本地标签列表
            tags.forEach(tag => {
              if (!this.getTagById(tag.id)) {
                this.tags.push(tag)
              }
            })
          }
        }
        
        // 返回请求的标签
        return this.getTagsByIds(tagIds)
      } catch (error) {
        console.warn('批量获取标签失败:', error)
        return []
      }
    },

    /**
     * 初始化标签数据
     */
    async initializeTags() {
      try {
        await Promise.all([
          this.fetchTags(),
          this.fetchPopularTags(),
          this.fetchTagStats()
        ])
      } catch (error) {
        console.warn('初始化标签数据失败:', error)
      }
    }
  },

  // 持久化配置 - 缓存标签数据
  persist: createPersistConfig('tag', [
    'tags',
    'popularTags',
    'tagStats'
  ])
})