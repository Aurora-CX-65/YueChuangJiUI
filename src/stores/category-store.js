/**
 * 分类状态存储
 * 
 * 管理分类相关的状态，包括分类列表、分类统计等
 */

import { defineStore } from 'pinia'
import { CategoryService } from '@/services/category-service.js'
import { 
  createPersistConfig, 
  createLoadingState,
  createErrorHandler,
  createLoadingManager
} from './store-config.js'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    // 所有分类列表
    categories: [],
    
    // 管理员分类列表（包含更多详细信息）
    adminCategories: [],
    
    // 分类统计信息
    categoryStats: {},
    
    // 分类树结构缓存
    categoryTreeCache: null,
    
    // 全局加载状态
    ...createLoadingState()
  }),

  getters: {
    /**
     * 根据ID获取分类
     */
    getCategoryById: (state) => (categoryId) => {
      return state.categories.find(category => category.id === categoryId)
    },
    
    /**
     * 获取顶级分类
     */
    topLevelCategories: (state) => {
      return state.categories.filter(category => !category.parentId)
    },
    
    /**
     * 根据父分类ID获取子分类
     */
    getSubCategories: (state) => (parentId) => {
      return state.categories.filter(category => category.parentId === parentId)
    },
    
    /**
     * 获取分类树结构
     */
    categoryTree: (state) => {
      const buildTree = (parentId = null) => {
        return state.categories
          .filter(category => category.parentId === parentId)
          .map(category => ({
            ...category,
            children: buildTree(category.id)
          }))
      }
      return buildTree()
    },
    
    /**
     * 获取分类路径
     */
    getCategoryPath: (state) => (categoryId) => {
      const path = []
      let currentCategory = state.categories.find(c => c.id === categoryId)
      
      while (currentCategory) {
        path.unshift(currentCategory)
        currentCategory = currentCategory.parentId 
          ? state.categories.find(c => c.id === currentCategory.parentId)
          : null
      }
      
      return path
    },
    
    /**
     * 获取热门分类
     */
    popularCategories: (state) => {
      return state.categories
        .filter(category => state.categoryStats[category.id]?.bookCount > 0)
        .sort((a, b) => {
          const aCount = state.categoryStats[a.id]?.bookCount || 0
          const bCount = state.categoryStats[b.id]?.bookCount || 0
          return bCount - aCount
        })
        .slice(0, 10)
    }
  },

  actions: {
    // 混入通用方法
    ...createLoadingManager(),
    handleError: createErrorHandler('CategoryStore'),

    /**
     * 获取所有分类
     * @param {boolean} [forceRefresh=false] - 是否强制刷新
     */
    async fetchCategories(forceRefresh = false) {
      try {
        // 如果已有数据且不强制刷新，直接返回
        if (!forceRefresh && this.categories.length > 0) {
          return this.categories
        }
        
        this.startLoading()
        
        const categories = await CategoryService.getAllCategories()
        
        if (categories) {
          this.categories = categories
        }
        
        this.stopLoading()
        
        return categories
      } catch (error) {
        this.handleError(error, '获取分类列表')
        throw error
      }
    },

    /**
     * 获取分类统计信息
     * @param {boolean} [forceRefresh=false] - 是否强制刷新
     */
    async fetchCategoryStats(forceRefresh = false) {
      try {
        // 如果已有数据且不强制刷新，直接返回
        if (!forceRefresh && Object.keys(this.categoryStats).length > 0) {
          return this.categoryStats
        }
        
        const stats = await CategoryService.getCategoryStats()
        
        if (stats) {
          this.categoryStats = stats
        }
        
        return stats
      } catch (error) {
        console.warn('获取分类统计失败:', error)
        return {}
      }
    },

    /**
     * 创建分类（管理员功能）
     * @param {Object} categoryData - 分类数据
     */
    async createCategory(categoryData) {
      try {
        this.startLoading()
        
        const category = await CategoryService.createCategory(categoryData)
        
        if (category) {
          this.categories.push(category)
          
          // 初始化统计信息
          this.categoryStats[category.id] = {
            bookCount: 0,
            authorCount: 0,
            totalWordCount: 0
          }
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('分类创建成功')
        }
        
        return category
      } catch (error) {
        this.handleError(error, '创建分类')
        throw error
      }
    },

    /**
     * 更新分类（管理员功能）
     * @param {number} categoryId - 分类ID
     * @param {Object} updateData - 更新数据
     */
    async updateCategory(categoryId, updateData) {
      try {
        this.startLoading()
        
        const updatedCategory = await CategoryService.updateCategory(categoryId, updateData)
        
        if (updatedCategory) {
          const index = this.categories.findIndex(c => c.id === categoryId)
          if (index !== -1) {
            this.categories[index] = { ...this.categories[index], ...updatedCategory }
          }
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('分类更新成功')
        }
        
        return updatedCategory
      } catch (error) {
        this.handleError(error, '更新分类')
        throw error
      }
    },

    /**
     * 删除分类（管理员功能）
     * @param {number} categoryId - 分类ID
     */
    async deleteCategory(categoryId) {
      try {
        this.startLoading()
        
        const result = await CategoryService.deleteCategory(categoryId)
        
        if (result) {
          // 从列表中移除
          this.categories = this.categories.filter(c => c.id !== categoryId)
          
          // 移除统计信息
          delete this.categoryStats[categoryId]
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('分类删除成功')
        }
        
        return result
      } catch (error) {
        this.handleError(error, '删除分类')
        throw error
      }
    },

    /**
     * 更新分类统计
     * @param {number} categoryId - 分类ID
     * @param {Object} stats - 统计数据
     */
    updateCategoryStats(categoryId, stats) {
      if (this.categoryStats[categoryId]) {
        this.categoryStats[categoryId] = { ...this.categoryStats[categoryId], ...stats }
      } else {
        this.categoryStats[categoryId] = stats
      }
    },

    // === 管理员功能扩展 ===

    /**
     * 获取管理员分类列表
     * @param {Object} params - 查询参数
     */
    async fetchAdminCategories(params = {}) {
      try {
        this.startLoading()
        
        const response = await CategoryService.getAdminCategories(params)
        
        if (response) {
          // 管理员分类列表可能包含更多详细信息
          this.adminCategories = response.records || response.data || []
          
          // 同时更新普通分类列表
          if (this.adminCategories.length > 0) {
            this.categories = this.adminCategories
          }
        }
        
        this.stopLoading()
        
        return response
      } catch (error) {
        this.handleError(error, '获取管理员分类列表')
        throw error
      }
    },

    /**
     * 获取分类树结构（管理员）
     * @param {boolean} [forceRefresh=false] - 是否强制刷新
     */
    async fetchCategoryTree(forceRefresh = false) {
      try {
        // 如果已有缓存且不强制刷新，直接返回
        if (!forceRefresh && this.categoryTreeCache) {
          return this.categoryTreeCache
        }
        
        const tree = await CategoryService.getCategoryTree()
        
        if (tree) {
          this.categoryTreeCache = tree
        }
        
        return tree
      } catch (error) {
        console.warn('获取分类树失败:', error)
        return []
      }
    },

    /**
     * 获取分类使用统计
     * @param {number} categoryId - 分类ID
     */
    async fetchCategoryStatsById(categoryId) {
      try {
        const stats = await CategoryService.getCategoryStats(categoryId)
        
        if (stats) {
          // 更新分类统计信息
          this.updateCategoryStats(categoryId, stats)
        }
        
        return stats
      } catch (error) {
        console.warn('获取分类统计失败:', error)
        return null
      }
    },

    /**
     * 批量删除分类（管理员功能）
     * @param {Array<number>} categoryIds - 分类ID列表
     */
    async batchDeleteCategories(categoryIds) {
      try {
        this.startLoading()
        
        const result = await CategoryService.batchDeleteCategories(categoryIds)
        
        if (result) {
          // 从列表中移除删除的分类
          this.categories = this.categories.filter(c => !categoryIds.includes(c.id))
          this.adminCategories = this.adminCategories.filter(c => !categoryIds.includes(c.id))
          
          // 移除统计信息
          categoryIds.forEach(categoryId => {
            delete this.categoryStats[categoryId]
          })
          
          // 清空分类树缓存
          this.categoryTreeCache = null
          
          if (window.notificationManager) {
            window.notificationManager.success(`批量删除 ${categoryIds.length} 个分类成功`)
          }
        }
        
        this.stopLoading()
        
        return result
      } catch (error) {
        this.handleError(error, '批量删除分类')
        throw error
      }
    },

    /**
     * 验证分类名称唯一性
     * @param {string} name - 分类名称
     * @param {number} [parentId] - 父分类ID
     * @param {number} [excludeId] - 排除的分类ID
     */
    async validateCategoryName(name, parentId = null, excludeId = null) {
      try {
        return await CategoryService.validateCategoryName(name, parentId, excludeId)
      } catch (error) {
        console.warn('验证分类名称失败:', error)
        return false
      }
    },

    /**
     * 移动分类到新的父分类
     * @param {number} categoryId - 分类ID
     * @param {number} newParentId - 新父分类ID
     */
    async moveCategory(categoryId, newParentId) {
      try {
        const result = await CategoryService.moveCategory(categoryId, newParentId)
        
        if (result) {
          // 更新本地分类的父分类ID
          const categoryIndex = this.categories.findIndex(c => c.id === categoryId)
          if (categoryIndex !== -1) {
            this.categories[categoryIndex] = { 
              ...this.categories[categoryIndex], 
              parentId: newParentId,
              updatedAt: new Date().toISOString()
            }
          }
          
          const adminCategoryIndex = this.adminCategories.findIndex(c => c.id === categoryId)
          if (adminCategoryIndex !== -1) {
            this.adminCategories[adminCategoryIndex] = { 
              ...this.adminCategories[adminCategoryIndex], 
              parentId: newParentId,
              updatedAt: new Date().toISOString()
            }
          }
          
          // 清空分类树缓存
          this.categoryTreeCache = null
          
          if (window.notificationManager) {
            window.notificationManager.success('分类移动成功')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '移动分类')
        throw error
      }
    },

    /**
     * 更新分类排序
     * @param {Array<Object>} sortData - 排序数据
     */
    async updateCategorySort(sortData) {
      try {
        const result = await CategoryService.updateCategorySort(sortData)
        
        if (result) {
          // 更新本地分类的排序
          sortData.forEach(({ id, sortOrder }) => {
            const categoryIndex = this.categories.findIndex(c => c.id === id)
            if (categoryIndex !== -1) {
              this.categories[categoryIndex] = { 
                ...this.categories[categoryIndex], 
                sortOrder,
                updatedAt: new Date().toISOString()
              }
            }
            
            const adminCategoryIndex = this.adminCategories.findIndex(c => c.id === id)
            if (adminCategoryIndex !== -1) {
              this.adminCategories[adminCategoryIndex] = { 
                ...this.adminCategories[adminCategoryIndex], 
                sortOrder,
                updatedAt: new Date().toISOString()
              }
            }
          })
          
          // 清空分类树缓存
          this.categoryTreeCache = null
          
          if (window.notificationManager) {
            window.notificationManager.success('分类排序更新成功')
          }
        }
        
        return result
      } catch (error) {
        this.handleError(error, '更新分类排序')
        throw error
      }
    },

    /**
     * 清空分类树缓存
     */
    clearCategoryTreeCache() {
      this.categoryTreeCache = null
    },

    /**
     * 初始化分类数据
     */
    async initializeCategories() {
      try {
        await Promise.all([
          this.fetchCategories(),
          this.fetchCategoryStats()
        ])
      } catch (error) {
        console.warn('初始化分类数据失败:', error)
      }
    }
  },

  // 持久化配置 - 缓存分类数据
  persist: createPersistConfig('category', [
    'categories',
    'adminCategories',
    'categoryStats',
    'categoryTreeCache'
  ])
})