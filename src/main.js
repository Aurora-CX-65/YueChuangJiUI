import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import './styles/global.css'

// 导入错误处理相关模块
import { ErrorHandler } from './utils/error-handler.js'
import { notificationManager } from './utils/notification-manager.js'

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

// 设置全局错误处理器
ErrorHandler.setupGlobalErrorHandler()

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
