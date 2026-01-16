import { httpClient } from '@/utils/http-client.js'

export class UploadService {
  /**
   * 上传文件
   * @param {File} file 文件对象
   * @param {String} category 分类 (avatar, cover, banner, etc.)
   */
  static async uploadFile(file, category = 'common') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)
    
    // 增加超时时间，因为上传文件可能需要较长时间
    return await httpClient.upload('/api/files/upload', formData, { timeout: 60000 })
  }
}
