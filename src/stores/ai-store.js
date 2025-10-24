/**
 * AI功能状态存储
 * 
 * 管理AI相关的状态，包括AI创作辅助、内容生成等
 */

import { defineStore } from 'pinia'
import { AIService } from '@/services/ai-service.js'
import { 
  createPersistConfig, 
  createLoadingState,
  createErrorHandler,
  createLoadingManager
} from './store-config.js'

export const useAIStore = defineStore('ai', {
  state: () => ({
    // AI创作历史
    creationHistory: [],
    
    // 当前AI对话
    currentConversation: {
      messages: [],
      context: null,
      isActive: false
    },
    
    // AI生成的内容
    generatedContent: {
      outline: null,
      characters: [],
      plot: null,
      chapter: null,
      title: null,
      description: null
    },
    
    // AI设置
    settings: {
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 2000,
      enableAutoSave: true,
      enableSuggestions: true
    },
    
    // AI使用统计
    usage: {
      totalRequests: 0,
      totalTokens: 0,
      todayRequests: 0,
      todayTokens: 0,
      lastResetDate: new Date().toDateString()
    },
    
    // 全局加载状态
    ...createLoadingState()
  }),

  getters: {
    /**
     * 是否有活跃的对话
     */
    hasActiveConversation: (state) => state.currentConversation.isActive,
    
    /**
     * 对话消息数量
     */
    conversationMessageCount: (state) => state.currentConversation.messages.length,
    
    /**
     * 今日使用量是否超限
     */
    isUsageLimitExceeded: (state) => {
      // 假设每日限制1000次请求或100万tokens
      return state.usage.todayRequests >= 1000 || state.usage.todayTokens >= 1000000
    },
    
    /**
     * 使用量百分比
     */
    usagePercentage: (state) => {
      const requestPercent = (state.usage.todayRequests / 1000) * 100
      const tokenPercent = (state.usage.todayTokens / 1000000) * 100
      return Math.max(requestPercent, tokenPercent)
    },
    
    /**
     * 最近的创作历史
     */
    recentCreations: (state) => {
      return state.creationHistory
        .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))
        .slice(0, 10)
    },
    
    /**
     * 是否有生成的内容
     */
    hasGeneratedContent: (state) => {
      return Object.values(state.generatedContent).some(content => 
        content !== null && content !== undefined && 
        (Array.isArray(content) ? content.length > 0 : true)
      )
    }
  },

  actions: {
    // 混入通用方法
    ...createLoadingManager(),
    handleError: createErrorHandler('AIStore'),

    /**
     * 生成书籍大纲
     * @param {Object} params - 生成参数
     * @param {string} params.title - 书籍标题
     * @param {string} params.genre - 书籍类型
     * @param {string} params.description - 书籍描述
     * @param {number} params.chapterCount - 章节数量
     */
    async generateOutline(params) {
      try {
        this.startLoading()
        
        const outline = await AIService.generateOutline(params)
        
        if (outline) {
          this.generatedContent.outline = outline
          this.addToHistory('outline', params, outline)
          this.updateUsage(1, outline.tokenCount || 0)
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('大纲生成成功')
        }
        
        return outline
      } catch (error) {
        this.handleError(error, '生成大纲')
        throw error
      }
    },

    /**
     * 生成人物设定
     * @param {Object} params - 生成参数
     * @param {string} params.bookTitle - 书籍标题
     * @param {string} params.genre - 书籍类型
     * @param {string} params.characterType - 人物类型
     * @param {string} params.characterName - 人物姓名
     * @param {string} params.requirements - 特殊要求
     */
    async generateCharacter(params) {
      try {
        this.startLoading()
        
        const character = await AIService.generateCharacter(params)
        
        if (character) {
          this.generatedContent.characters.push(character)
          this.addToHistory('character', params, character)
          this.updateUsage(1, character.tokenCount || 0)
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('人物设定生成成功')
        }
        
        return character
      } catch (error) {
        this.handleError(error, '生成人物设定')
        throw error
      }
    },

    /**
     * 生成情节发展
     * @param {Object} params - 生成参数
     * @param {string} params.bookTitle - 书籍标题
     * @param {string} params.currentPlot - 当前情节
     * @param {string} params.characters - 人物信息
     * @param {string} params.direction - 发展方向
     */
    async generatePlot(params) {
      try {
        this.startLoading()
        
        const plot = await AIService.generatePlot(params)
        
        if (plot) {
          this.generatedContent.plot = plot
          this.addToHistory('plot', params, plot)
          this.updateUsage(1, plot.tokenCount || 0)
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('情节发展生成成功')
        }
        
        return plot
      } catch (error) {
        this.handleError(error, '生成情节发展')
        throw error
      }
    },

    /**
     * 生成章节内容
     * @param {Object} params - 生成参数
     * @param {string} params.bookTitle - 书籍标题
     * @param {string} params.chapterTitle - 章节标题
     * @param {string} params.outline - 章节大纲
     * @param {string} params.previousChapter - 上一章内容
     * @param {number} params.wordCount - 目标字数
     */
    async generateChapter(params) {
      try {
        this.startLoading()
        
        const chapter = await AIService.generateChapter(params)
        
        if (chapter) {
          this.generatedContent.chapter = chapter
          this.addToHistory('chapter', params, chapter)
          this.updateUsage(1, chapter.tokenCount || 0)
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('章节内容生成成功')
        }
        
        return chapter
      } catch (error) {
        this.handleError(error, '生成章节内容')
        throw error
      }
    },

    /**
     * 优化文本内容
     * @param {Object} params - 优化参数
     * @param {string} params.content - 原始内容
     * @param {string} params.type - 优化类型 (grammar, style, readability)
     * @param {string} params.requirements - 特殊要求
     */
    async optimizeContent(params) {
      try {
        this.startLoading()
        
        const optimizedContent = await AIService.optimizeContent(params)
        
        if (optimizedContent) {
          this.addToHistory('optimize', params, optimizedContent)
          this.updateUsage(1, optimizedContent.tokenCount || 0)
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('内容优化完成')
        }
        
        return optimizedContent
      } catch (error) {
        this.handleError(error, '优化内容')
        throw error
      }
    },

    /**
     * 生成书籍标题
     * @param {Object} params - 生成参数
     * @param {string} params.genre - 书籍类型
     * @param {string} params.description - 书籍描述
     * @param {string} params.keywords - 关键词
     * @param {number} params.count - 生成数量
     */
    async generateTitle(params) {
      try {
        this.startLoading()
        
        const titles = await AIService.generateTitle(params)
        
        if (titles) {
          this.generatedContent.title = titles
          this.addToHistory('title', params, titles)
          this.updateUsage(1, titles.tokenCount || 0)
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('标题生成成功')
        }
        
        return titles
      } catch (error) {
        this.handleError(error, '生成标题')
        throw error
      }
    },

    /**
     * 生成书籍简介
     * @param {Object} params - 生成参数
     * @param {string} params.title - 书籍标题
     * @param {string} params.genre - 书籍类型
     * @param {string} params.outline - 书籍大纲
     * @param {string} params.characters - 主要人物
     */
    async generateDescription(params) {
      try {
        this.startLoading()
        
        const description = await AIService.generateDescription(params)
        
        if (description) {
          this.generatedContent.description = description
          this.addToHistory('description', params, description)
          this.updateUsage(1, description.tokenCount || 0)
        }
        
        this.stopLoading()
        
        if (window.notificationManager) {
          window.notificationManager.success('简介生成成功')
        }
        
        return description
      } catch (error) {
        this.handleError(error, '生成简介')
        throw error
      }
    },

    /**
     * 开始AI对话
     * @param {Object} context - 对话上下文
     */
    startConversation(context = null) {
      this.currentConversation = {
        messages: [],
        context,
        isActive: true
      }
    },

    /**
     * 发送消息到AI
     * @param {string} message - 用户消息
     */
    async sendMessage(message) {
      try {
        // 添加用户消息
        this.currentConversation.messages.push({
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        })
        
        this.startLoading()
        
        const response = await AIService.chat({
          message,
          context: this.currentConversation.context,
          history: this.currentConversation.messages.slice(-10) // 保留最近10条消息
        })
        
        if (response) {
          // 添加AI回复
          this.currentConversation.messages.push({
            role: 'assistant',
            content: response.content,
            timestamp: new Date().toISOString()
          })
          
          this.updateUsage(1, response.tokenCount || 0)
        }
        
        this.stopLoading()
        
        return response
      } catch (error) {
        this.handleError(error, 'AI对话')
        throw error
      }
    },

    /**
     * 结束AI对话
     */
    endConversation() {
      if (this.currentConversation.isActive) {
        // 保存对话到历史
        this.addToHistory('conversation', {
          context: this.currentConversation.context
        }, {
          messages: this.currentConversation.messages,
          messageCount: this.currentConversation.messages.length
        })
        
        // 重置对话状态
        this.currentConversation = {
          messages: [],
          context: null,
          isActive: false
        }
      }
    },

    /**
     * 清除生成的内容
     * @param {string} [type] - 内容类型，不传则清除所有
     */
    clearGeneratedContent(type = null) {
      if (type && this.generatedContent.hasOwnProperty(type)) {
        if (Array.isArray(this.generatedContent[type])) {
          this.generatedContent[type] = []
        } else {
          this.generatedContent[type] = null
        }
      } else {
        this.generatedContent = {
          outline: null,
          characters: [],
          plot: null,
          chapter: null,
          title: null,
          description: null
        }
      }
    },

    /**
     * 更新AI设置
     * @param {Object} settings - 设置对象
     */
    updateSettings(settings) {
      Object.assign(this.settings, settings)
    },

    /**
     * 添加到历史记录
     * @param {string} type - 操作类型
     * @param {Object} params - 参数
     * @param {Object} result - 结果
     */
    addToHistory(type, params, result) {
      const historyItem = {
        id: Date.now() + Math.random(),
        type,
        params,
        result,
        createdTime: new Date().toISOString()
      }
      
      this.creationHistory.unshift(historyItem)
      
      // 限制历史记录数量
      if (this.creationHistory.length > 100) {
        this.creationHistory = this.creationHistory.slice(0, 100)
      }
    },

    /**
     * 更新使用统计
     * @param {number} requests - 请求数
     * @param {number} tokens - token数
     */
    updateUsage(requests = 0, tokens = 0) {
      const today = new Date().toDateString()
      
      // 如果是新的一天，重置今日统计
      if (this.usage.lastResetDate !== today) {
        this.usage.todayRequests = 0
        this.usage.todayTokens = 0
        this.usage.lastResetDate = today
      }
      
      this.usage.totalRequests += requests
      this.usage.totalTokens += tokens
      this.usage.todayRequests += requests
      this.usage.todayTokens += tokens
    },

    /**
     * 获取创作历史
     * @param {string} [type] - 类型过滤
     * @param {number} [limit=50] - 限制数量
     */
    getCreationHistory(type = null, limit = 50) {
      let history = this.creationHistory
      
      if (type) {
        history = history.filter(item => item.type === type)
      }
      
      return history.slice(0, limit)
    },

    /**
     * 删除历史记录
     * @param {string} historyId - 历史记录ID
     */
    deleteHistoryItem(historyId) {
      this.creationHistory = this.creationHistory.filter(item => item.id !== historyId)
    },

    /**
     * 清空历史记录
     */
    clearHistory() {
      this.creationHistory = []
    }
  },

  // 持久化配置
  persist: createPersistConfig('ai', [
    'settings',
    'usage',
    'creationHistory'
  ])
})