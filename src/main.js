import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import './styles/global.css'

// 导入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 导入 Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入错误处理相关模块
import { ErrorHandler } from './utils/error-handler.js'
import { notificationManager } from './utils/notification-manager.js'
import { TokenManager } from './utils/token-manager.js'
import { useUserStore } from './stores/user-store.js'

// 创建Vue应用实例
const app = createApp(App)

// 设置全局错误处理
app.config.errorHandler = (err, instance, info) => {
  // 在开发环境下显示详细错误
  if (import.meta.env.DEV) {
    console.error('Vue Error:', err)
    console.error('Component Info:', info)
  }
}

// 设置全局警告处理
app.config.warnHandler = (msg, instance, trace) => {
  if (import.meta.env.DEV) {
    console.warn('Vue Warning:', msg)
    console.warn('Trace:', trace)
  }
}

// 创建Pinia实例并配置持久化插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 注册Pinia
app.use(pinia)

// 注册路由
app.use(router)

// 注册 Element Plus
app.use(ElementPlus)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 异步初始化应用
async function initializeApp() {
  // 设置全局错误处理器
  ErrorHandler.setupGlobalErrorHandler()

  // 清理过期或无效的token
  if (TokenManager.getToken() && TokenManager.isTokenExpired()) {
    console.log('检测到过期token，正在清理...')
    TokenManager.removeToken()
  }

  // 初始化用户状态
  const userStore = useUserStore()
  await userStore.initializeUserState()

  // 请求浏览器通知权限
  notificationManager.requestNotificationPermission()

  // 在window对象上暴露一些全局方法供其他脚本使用
  if (typeof window !== 'undefined') {
    window.showToast = (message, type, duration) => {
      notificationManager.show(message, type, { duration })
    }
    
    window.notificationManager = notificationManager
  }

  // 挂载应用
  app.mount('#app')
}

// 启动应用
initializeApp().catch(error => {
  console.error('应用初始化失败:', error)
  // 即使初始化失败，也要挂载应用
  app.mount('#app')
})
