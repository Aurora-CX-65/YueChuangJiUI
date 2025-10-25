/**
 * Pinia Stores 统一导出
 * 
 * 这个文件统一导出所有的Pinia stores，方便在组件中导入使用
 */

// 导出用户相关store
export { useUserStore } from './user-store.js'

// 导出书籍相关store
export { useBookStore } from './book-store.js'

// 导出通知相关store
export { useNotificationStore } from './notification-store.js'

// 导出UI状态相关store
export { useUIStore } from './ui-store.js'

// 导出章节相关store
export { useChapterStore } from './chapter-store.js'

// 导出评论相关store
export { useCommentStore } from './comment-store.js'

// 导出分类相关store
export { useCategoryStore } from './category-store.js'

// 导出标签相关store
export { useTagStore } from './tag-store.js'

// 导出AI功能相关store
export { useAIStore } from './ai-store.js'

// 导出管理员功能相关store
export { useAdminUserStore } from './admin/admin-user-store.js'
export { useAdminSystemStore } from './admin/admin-system-store.js'