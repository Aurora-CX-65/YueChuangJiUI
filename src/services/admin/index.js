/**
 * 管理员服务统一导出
 * 提供所有管理员API服务类的统一入口
 */

// 导入所有管理员服务类
import { AdminUserService } from './admin-user-service.js'
import { AdminSystemService } from './admin-system-service.js'

// 重新导出所有管理员服务类
export { AdminUserService, AdminSystemService }

/**
 * 所有管理员API服务的集合对象
 * 可以通过 adminServices.user.getUsers() 的方式调用
 */
const adminServices = {
    user: AdminUserService,
    system: AdminSystemService
}

// 命名导出管理员服务集合
export { adminServices }

/**
 * 默认导出管理员服务集合
 */
export default adminServices