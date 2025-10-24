/**
 * 文件服务类
 * 处理文件上传管理相关的API请求
 */

import { httpClient } from '@/utils/http-client.js'

/**
 * 文件服务类
 * 对应后端 /api/files 接口
 */
export class FileService {

  /**
   * 上传通用文件
   * @param {File} file - 文件对象
   * @param {string} category - 文件分类
   * @returns {Promise<string>} 文件URL
   */
  static async uploadFile(file, category) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)
    return await httpClient.upload('/api/files/upload', formData)
  }

  /**
   * 删除文件
   * @param {string} fileUrl - 文件URL
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteFile(fileUrl) {
    return await httpClient.delete('/api/files', { fileUrl })
  }

  /**
   * 批量删除文件
   * @param {string[]} fileUrls - 文件URL列表
   * @returns {Promise<number>} 成功删除的文件数量
   */
  static async batchDeleteFiles(fileUrls) {
    return await httpClient.delete('/api/files/batch', fileUrls)
  }

  /**
   * 获取文件信息
   * @param {string} fileUrl - 文件URL
   * @returns {Promise<Object>} 文件信息
   */
  static async getFileInfo(fileUrl) {
    return await httpClient.get('/api/files/info', { fileUrl })
  }

  /**
   * 检查文件是否存在
   * @param {string} fileUrl - 文件URL
   * @returns {Promise<boolean>} 是否存在
   */
  static async fileExists(fileUrl) {
    return await httpClient.get('/api/files/exists', { fileUrl })
  }

  /**
   * 获取用户文件使用统计
   * @returns {Promise<Object>} 文件使用统计
   */
  static async getUserFileUsageStats() {
    return await httpClient.get('/api/files/usage-stats')
  }

  /**
   * 清理过期文件（管理员功能）
   * @param {number} [daysOld=7] - 清理多少天前的文件
   * @returns {Promise<number>} 清理的文件数量
   */
  static async cleanupOldFiles(daysOld = 7) {
    return await httpClient.post('/api/files/cleanup', null, { params: { daysOld } })
  }
}