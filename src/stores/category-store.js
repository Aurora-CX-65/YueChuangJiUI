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
    
    // 分类统计信息
    categoryStats: {},
    
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
    'categoryStats'
  ])
})