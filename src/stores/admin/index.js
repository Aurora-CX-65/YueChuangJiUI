/**
 * 管理员状态存储模块导出
 * 
 * 统一导出所有管理员相关的状态存储
 */

export { useAdminUserStore } from './admin-user-store.js'
export { useAdminSystemStore } from './admin-system-store.js'

// 管理员存储集合
export const adminStores = {
  useAdminUserStore,
  useAdminSystemStore
}

/**
 * 初始化所有管理员存储
 */
export const initializeAdminStores = async () => {
  try {
    const adminUserStore = useAdminUserStore()
    const adminSystemStore = useAdminSystemStore()
    
    await Promise.all([
      adminUserStore.initializeAdminUserData(),
      adminSystemStore.initializeAdminSystemData()
    ])
    
    console.log('管理员存储初始化完成')
  } catch (error) {
    console.warn('管理员存储初始化失败:', error)
  }
}