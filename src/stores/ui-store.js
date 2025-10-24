/**
 * UI状态存储
 * 
 * 管理UI相关的状态，包括主题、布局、模态框等
 */

import { defineStore } from 'pinia'
import { 
  createPersistConfig, 
  createLoadingState,
  createErrorHandler
} from './store-config.js'

export const useUIStore = defineStore('ui', {
  state: () => ({
    // 主题设置
    theme: {
      mode: 'light', // light, dark, auto
      primaryColor: '#1890ff',
      fontSize: 'medium', // small, medium, large
      fontFamily: 'system'
    },
    
    // 布局设置
    layout: {
      sidebarCollapsed: false,
      sidebarWidth: 240,
      headerHeight: 64,
      footerHeight: 48,
      contentPadding: 24
    },
    
    // 模态框状态
    modals: {
      loginModal: false,
      registerModal: false,
      profileModal: false,
      settingsModal: false,
      bookCreateModal: false,
      chapterCreateModal: false,
      confirmModal: false,
      imagePreviewModal: false
    },
    
    // 抽屉状态
    drawers: {
      notificationDrawer: false,
      searchDrawer: false,
      menuDrawer: false,
      bookmarkDrawer: false
    },
    
    // 加载状态
    loading: {
      global: false,
      page: false,
      component: {}
    },
    
    // 面包屑导航
    breadcrumbs: [],
    
    // 页面标题
    pageTitle: '阅创集',
    
    // 搜索状态
    search: {
      visible: false,
      keyword: '',
      suggestions: [],
      history: []
    },
    
    // 阅读器设置
    reader: {
      fontSize: 16,
      lineHeight: 1.6,
      fontFamily: 'serif',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      width: 800,
      nightMode: false,
      autoScroll: false,
      scrollSpeed: 50
    },
    
    // 编辑器设置
    editor: {
      theme: 'default',
      fontSize: 14,
      lineNumbers: true,
      wordWrap: true,
      autoSave: true,
      autoSaveInterval: 30000, // 30秒
      spellCheck: true
    },
    
    // 通知设置
    notifications: {
      position: 'top-right', // top-left, top-right, bottom-left, bottom-right
      duration: 3000,
      maxCount: 5,
      showProgress: true
    },
    
    // 设备信息
    device: {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenWidth: 1920,
      screenHeight: 1080
    },
    
    // 网络状态
    network: {
      online: true,
      connectionType: 'unknown'
    },
    
    // 全局加载状态
    ...createLoadingState()
  }),

  getters: {
    /**
     * 是否为暗色主题
     */
    isDarkMode: (state) => {
      if (state.theme.mode === 'auto') {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      return state.theme.mode === 'dark'
    },
    
    /**
     * 当前主题类名
     */
    themeClass: (state) => {
      const mode = state.theme.mode === 'auto' 
        ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : state.theme.mode
      return `theme-${mode}`
    },
    
    /**
     * 是否有打开的模态框
     */
    hasOpenModal: (state) => {
      return Object.values(state.modals).some(isOpen => isOpen)
    },
    
    /**
     * 是否有打开的抽屉
     */
    hasOpenDrawer: (state) => {
      return Object.values(state.drawers).some(isOpen => isOpen)
    },
    
    /**
     * 是否正在加载
     */
    isLoading: (state) => {
      return state.loading.global || state.loading.page || Object.values(state.loading.component).some(loading => loading)
    },
    
    /**
     * 侧边栏样式
     */
    sidebarStyle: (state) => ({
      width: state.layout.sidebarCollapsed ? '64px' : `${state.layout.sidebarWidth}px`,
      transition: 'width 0.3s ease'
    }),
    
    /**
     * 内容区域样式
     */
    contentStyle: (state) => ({
      marginLeft: state.layout.sidebarCollapsed ? '64px' : `${state.layout.sidebarWidth}px`,
      paddingTop: `${state.layout.headerHeight}px`,
      paddingBottom: `${state.layout.footerHeight}px`,
      padding: `${state.layout.contentPadding}px`,
      transition: 'margin-left 0.3s ease'
    }),
    
    /**
     * 阅读器样式
     */
    readerStyle: (state) => ({
      fontSize: `${state.reader.fontSize}px`,
      lineHeight: state.reader.lineHeight,
      fontFamily: state.reader.fontFamily,
      backgroundColor: state.reader.backgroundColor,
      color: state.reader.textColor,
      maxWidth: `${state.reader.width}px`,
      margin: '0 auto'
    }),
    
    /**
     * 是否为移动设备
     */
    isMobileDevice: (state) => state.device.isMobile,
    
    /**
     * 是否为平板设备
     */
    isTabletDevice: (state) => state.device.isTablet,
    
    /**
     * 是否为桌面设备
     */
    isDesktopDevice: (state) => state.device.isDesktop,
    
    /**
     * 响应式断点
     */
    breakpoint: (state) => {
      const width = state.device.screenWidth
      if (width < 576) return 'xs'
      if (width < 768) return 'sm'
      if (width < 992) return 'md'
      if (width < 1200) return 'lg'
      return 'xl'
    }
  },

  actions: {
    handleError: createErrorHandler('UIStore'),

    /**
     * 设置主题
     * @param {string} mode - 主题模式 (light, dark, auto)
     */
    setTheme(mode) {
      this.theme.mode = mode
      this.applyTheme()
    },
    
    /**
     * 设置主色调
     * @param {string} color - 颜色值
     */
    setPrimaryColor(color) {
      this.theme.primaryColor = color
      this.applyTheme()
    },
    
    /**
     * 应用主题
     */
    applyTheme() {
      const root = document.documentElement
      const isDark = this.isDarkMode
      
      // 设置主题类名
      document.body.className = document.body.className.replace(/theme-\w+/g, '')
      document.body.classList.add(this.themeClass)
      
      // 设置CSS变量
      root.style.setProperty('--primary-color', this.theme.primaryColor)
      root.style.setProperty('--font-size-base', this.getFontSizeValue(this.theme.fontSize))
      
      // 设置暗色主题变量
      if (isDark) {
        root.style.setProperty('--bg-color', '#1a1a1a')
        root.style.setProperty('--text-color', '#ffffff')
        root.style.setProperty('--border-color', '#333333')
      } else {
        root.style.setProperty('--bg-color', '#ffffff')
        root.style.setProperty('--text-color', '#333333')
        root.style.setProperty('--border-color', '#e0e0e0')
      }
    },
    
    /**
     * 获取字体大小值
     * @param {string} size - 字体大小 (small, medium, large)
     */
    getFontSizeValue(size) {
      const sizeMap = {
        small: '14px',
        medium: '16px',
        large: '18px'
      }
      return sizeMap[size] || '16px'
    },
    
    /**
     * 切换侧边栏
     */
    toggleSidebar() {
      this.layout.sidebarCollapsed = !this.layout.sidebarCollapsed
    },
    
    /**
     * 设置侧边栏状态
     * @param {boolean} collapsed - 是否折叠
     */
    setSidebarCollapsed(collapsed) {
      this.layout.sidebarCollapsed = collapsed
    },
    
    /**
     * 打开模态框
     * @param {string} modalName - 模态框名称
     */
    openModal(modalName) {
      if (this.modals.hasOwnProperty(modalName)) {
        this.modals[modalName] = true
      }
    },
    
    /**
     * 关闭模态框
     * @param {string} modalName - 模态框名称
     */
    closeModal(modalName) {
      if (this.modals.hasOwnProperty(modalName)) {
        this.modals[modalName] = false
      }
    },
    
    /**
     * 关闭所有模态框
     */
    closeAllModals() {
      Object.keys(this.modals).forEach(key => {
        this.modals[key] = false
      })
    },
    
    /**
     * 打开抽屉
     * @param {string} drawerName - 抽屉名称
     */
    openDrawer(drawerName) {
      if (this.drawers.hasOwnProperty(drawerName)) {
        this.drawers[drawerName] = true
      }
    },
    
    /**
     * 关闭抽屉
     * @param {string} drawerName - 抽屉名称
     */
    closeDrawer(drawerName) {
      if (this.drawers.hasOwnProperty(drawerName)) {
        this.drawers[drawerName] = false
      }
    },
    
    /**
     * 关闭所有抽屉
     */
    closeAllDrawers() {
      Object.keys(this.drawers).forEach(key => {
        this.drawers[key] = false
      })
    },
    
    /**
     * 设置全局加载状态
     * @param {boolean} loading - 加载状态
     */
    setGlobalLoading(loading) {
      this.loading.global = loading
    },
    
    /**
     * 设置页面加载状态
     * @param {boolean} loading - 加载状态
     */
    setPageLoading(loading) {
      this.loading.page = loading
    },
    
    /**
     * 设置组件加载状态
     * @param {string} componentName - 组件名称
     * @param {boolean} loading - 加载状态
     */
    setComponentLoading(componentName, loading) {
      this.loading.component[componentName] = loading
    },
    
    /**
     * 设置面包屑导航
     * @param {Array} breadcrumbs - 面包屑数组
     */
    setBreadcrumbs(breadcrumbs) {
      this.breadcrumbs = breadcrumbs
    },
    
    /**
     * 设置页面标题
     * @param {string} title - 页面标题
     */
    setPageTitle(title) {
      this.pageTitle = title
      document.title = title ? `${title} - 阅创集` : '阅创集'
    },
    
    /**
     * 显示搜索
     */
    showSearch() {
      this.search.visible = true
    },
    
    /**
     * 隐藏搜索
     */
    hideSearch() {
      this.search.visible = false
    },
    
    /**
     * 设置搜索关键词
     * @param {string} keyword - 搜索关键词
     */
    setSearchKeyword(keyword) {
      this.search.keyword = keyword
    },
    
    /**
     * 添加搜索历史
     * @param {string} keyword - 搜索关键词
     */
    addSearchHistory(keyword) {
      if (keyword && !this.search.history.includes(keyword)) {
        this.search.history.unshift(keyword)
        // 限制历史记录数量
        if (this.search.history.length > 10) {
          this.search.history = this.search.history.slice(0, 10)
        }
      }
    },
    
    /**
     * 清除搜索历史
     */
    clearSearchHistory() {
      this.search.history = []
    },
    
    /**
     * 更新阅读器设置
     * @param {Object} settings - 设置对象
     */
    updateReaderSettings(settings) {
      Object.assign(this.reader, settings)
    },
    
    /**
     * 更新编辑器设置
     * @param {Object} settings - 设置对象
     */
    updateEditorSettings(settings) {
      Object.assign(this.editor, settings)
    },
    
    /**
     * 更新设备信息
     */
    updateDeviceInfo() {
      const width = window.innerWidth
      const height = window.innerHeight
      
      this.device.screenWidth = width
      this.device.screenHeight = height
      this.device.isMobile = width < 768
      this.device.isTablet = width >= 768 && width < 1024
      this.device.isDesktop = width >= 1024
    },
    
    /**
     * 更新网络状态
     */
    updateNetworkStatus() {
      this.network.online = navigator.onLine
      
      if ('connection' in navigator) {
        this.network.connectionType = navigator.connection.effectiveType || 'unknown'
      }
    },
    
    /**
     * 初始化UI状态
     */
    initializeUI() {
      // 应用主题
      this.applyTheme()
      
      // 更新设备信息
      this.updateDeviceInfo()
      
      // 更新网络状态
      this.updateNetworkStatus()
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        this.updateDeviceInfo()
      })
      
      // 监听网络状态变化
      window.addEventListener('online', () => {
        this.updateNetworkStatus()
      })
      
      window.addEventListener('offline', () => {
        this.updateNetworkStatus()
      })
      
      // 监听主题变化（自动模式）
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', () => {
          if (this.theme.mode === 'auto') {
            this.applyTheme()
          }
        })
      }
      
      // 监听键盘事件
      document.addEventListener('keydown', (event) => {
        // ESC键关闭模态框和抽屉
        if (event.key === 'Escape') {
          this.closeAllModals()
          this.closeAllDrawers()
        }
        
        // Ctrl+K 打开搜索
        if (event.ctrlKey && event.key === 'k') {
          event.preventDefault()
          this.showSearch()
        }
      })
    }
  },

  // 持久化配置
  persist: createPersistConfig('ui', [
    'theme',
    'layout',
    'reader',
    'editor',
    'notifications',
    'search.history'
  ])
})