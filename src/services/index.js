/**
 * API服务统一导出
 * 提供所有API服务类的统一入口
 */

// 导入所有服务类
import { AuthService } from './auth-service.js'
import { UserService } from './user-service.js'
import { BookService } from './book-service.js'
import { ChapterService } from './chapter-service.js'
import { CommentService } from './comment-service.js'
import { CategoryService } from './category-service.js'
import { TagService } from './tag-service.js'
import { AiService } from './ai-service.js'
import { FileService } from './file-service.js'
import { NotificationService } from './notification-service.js'

// 重新导出所有服务类
export { AuthService, UserService, BookService, ChapterService, CommentService, CategoryService, TagService, AiService, FileService, NotificationService }

/**
 * 所有API服务的集合对象
 * 可以通过 apiServices.auth.login() 的方式调用
 */
const apiServices = {
    auth: AuthService,
    user: UserService,
    book: BookService,
    chapter: ChapterService,
    comment: CommentService,
    category: CategoryService,
    tag: TagService,
    ai: AiService,
    file: FileService,
    notification: NotificationService
}

// 命名导出API服务集合
export { apiServices }

/**
 * 默认导出API服务集合
 */
export default apiServices