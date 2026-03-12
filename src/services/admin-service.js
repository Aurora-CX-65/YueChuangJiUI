import { httpClient } from '@/utils/http-client.js'

export class AdminService {
  static formatDateTime(input) {
    let d = input
    if (typeof input === 'string') {
      const t = new Date(input)
      if (!isNaN(t.getTime())) d = t
    }
    if (!(d instanceof Date)) return input
    const y = d.getFullYear()
    const M = String(d.getMonth() + 1).padStart(2, '0')
    const D = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    const s = String(d.getSeconds()).padStart(2, '0')
    return `${y}-${M}-${D}T${h}:${m}:${s}`
  }
  static async getSystemStats() {
    return await httpClient.get('/api/admin/stats')
  }

  static async getSystemStatsOverview() {
    return await httpClient.get('/api/admin/stats/overview')
  }

  static async getSystemUserStats() {
    return await httpClient.get('/api/admin/stats/users')
  }

  static async getReviewStats() {
    return await httpClient.get('/api/admin/review/stats')
  }

  static async getReviewItems(page = 1, size = 5, type = '', status = 'pending') {
    const params = { page, size }
    if (type) params.type = type
    if (status) params.status = status
    return await httpClient.get('/api/admin/review/items', params)
  }

  static async getReviewHistory(page = 1, size = 5, type = '') {
    const params = { page, size }
    if (type) params.type = type
    return await httpClient.get('/api/admin/review/history', params)
  }

  // === Editor Review APIs (Frontend Adapter) ===
  // 由于后端 ReviewController 缺乏聚合接口，前端需要手动聚合

  static async getEditorReviewStats() {
    try {
      const [books, chapters] = await Promise.all([
        httpClient.get('/api/review/books/pending', { page: 1, size: 1 }),
        httpClient.get('/api/review/chapters/pending', { page: 1, size: 1 })
      ])
      
      return {
        pendingBooks: books?.total || 0,
        pendingChapters: chapters?.total || 0,
        pendingComments: 0, // 暂不支持
        pendingReviews: (books?.total || 0) + (chapters?.total || 0),
        processedToday: 0 // 暂不支持
      }
    } catch (e) {
      console.warn('获取编辑统计失败', e)
      return {}
    }
  }

  static async getEditorReviewItems(page = 1, size = 10, type = '', status = 'pending') {
    // 仅支持 pending 状态，因为 ReviewController 只提供了 pending 接口
    if (status !== 'pending') {
      return { records: [], total: 0 }
    }

    try {
      if (type === 'book') {
        const res = await httpClient.get('/api/review/books/pending', { page, size })
        // 适配数据结构以匹配 Admin 接口返回的格式
        const records = (res?.records || []).map(item => ({
          ...item,
          targetId: item.id,
          targetTitle: item.title,
          auditType: 'book',
          submitterUsername: item.authorName || '未知作者',
          submittedAt: item.createTime || item.updatedTime // 假设字段
        }))
        return { records, total: res?.total || 0 }
      } 
      else if (type === 'chapter') {
        const res = await httpClient.get('/api/review/chapters/pending', { page, size })
        const records = (res?.records || []).map(item => ({
          ...item,
          targetId: item.id,
          targetTitle: item.title,
          auditType: 'chapter',
          relatedInfo: item.bookTitle, // 假设字段
          submitterUsername: item.authorName || '未知作者',
          submittedAt: item.createTime // 假设字段
        }))
        return { records, total: res?.total || 0 }
      }
      else {
        // 对于其他类型或全部类型，暂不支持聚合分页，只能返回空或仅返回书籍
        // 为了避免报错，返回空列表
        return { records: [], total: 0 }
      }
    } catch (e) {
      console.error('获取编辑审核列表失败', e)
      return { records: [], total: 0 }
    }
  }

  static async getEditorReviewHistory(page = 1, size = 5, type = '') {
    // 后端无接口，返回空
    return { records: [], total: 0 }
  }

  static async getEditorAuthorApplications(page = 1, size = 10, status = '') {
    // 后端无接口，返回空
    return { records: [], total: 0 }
  }

  // Action methods remain the same as they map to existing endpoints
  static async approveEditorAuthorApplication(id, comment = '') {
    // 后端无接口，模拟失败或提示
    throw new Error('编辑暂无权限审核作者申请')
  }

  static async rejectEditorAuthorApplication(id, comment) {
    throw new Error('编辑暂无权限审核作者申请')
  }

  static async getSystemSettings() {
    return await httpClient.get('/api/admin/settings')
  }

  static async updateSystemSettings(settingsMap) {
    return await httpClient.put('/api/admin/settings', { settings: settingsMap })
  }
  static async getUsers({ page = 1, size = 10, keyword = '', status = '', role = '', sort = '', order = '' } = {}) {
    const params = { page, size }
    if (keyword) params.keyword = keyword
    if (status) params.status = status
    if (role) params.role = role
    if (sort) params.sort = sort
    if (order) params.order = order
    return await httpClient.get('/api/admin/users', params)
  }

  static async getUserById(id) {
    return await httpClient.get(`/api/admin/users/${id}`)
  }

  static async updateUserStatus(id, status) {
    return await httpClient.put(`/api/admin/users/${id}/status`, { status })
  }

  static async updateUserRole(id, role) {
    return await httpClient.put(`/api/admin/users/${id}/role`, { role })
  }

  static async resetUserPassword(id) {
    return await httpClient.post(`/api/admin/users/${id}/reset-password`)
  }

  static async suspendUser(id, until, reason) {
    const untilStr = until ? AdminService.formatDateTime(until) : ''
    return await httpClient.post(`/api/admin/users/${id}/suspend`, { until: untilStr, reason })
  }

  static async banUser(id, reason) {
    return await httpClient.post(`/api/admin/users/${id}/ban`, { reason })
  }

  static async unbanUser(id) {
    return await httpClient.post(`/api/admin/users/${id}/unban`)
  }

  static async getUserBanLogs(id) {
    return await httpClient.get(`/api/admin/users/${id}/ban-logs`)
  }

  static async approveBookReview(id, comment = '') {
    const body = comment ? { comment } : {}
    return await httpClient.post(`/api/admin/review/books/${id}/approve`, body)
  }

  static async rejectBookReview(id, comment) {
    return await httpClient.post(`/api/admin/review/books/${id}/reject`, { comment })
  }

  static async approveChapterReview(id, comment = '') {
    const body = comment ? { comment } : {}
    return await httpClient.post(`/api/admin/review/chapters/${id}/approve`, body)
  }

  static async rejectChapterReview(id, comment) {
    return await httpClient.post(`/api/admin/review/chapters/${id}/reject`, { comment })
  }

  static async approveReviewItem(id, comment = '') {
    const body = comment ? { comment } : {}
    return await httpClient.post(`/api/admin/review/items/${id}/approve`, body)
  }

  static async rejectReviewItem(id, comment) {
    return await httpClient.post(`/api/admin/review/items/${id}/reject`, { comment })
  }

  // === Editor Action APIs ===
  static async approveEditorBookReview(id, comment = '') {
    const body = comment ? { comment } : {}
    return await httpClient.post(`/api/review/books/${id}/approve`, body)
  }

  static async rejectEditorBookReview(id, comment) {
    return await httpClient.post(`/api/review/books/${id}/reject`, { comment })
  }

  static async approveEditorChapterReview(id, comment = '') {
    const body = comment ? { comment } : {}
    return await httpClient.post(`/api/review/chapters/${id}/approve`, body)
  }

  static async rejectEditorChapterReview(id, comment) {
    return await httpClient.post(`/api/review/chapters/${id}/reject`, { comment })
  }

  static async approveEditorReviewItem(id, comment = '') {
    const body = comment ? { comment } : {}
    return await httpClient.post(`/api/review/items/${id}/approve`, body)
  }

  static async rejectEditorReviewItem(id, comment) {
    return await httpClient.post(`/api/review/items/${id}/reject`, { comment })
  }

  static async getAdminCategories(page = 1, size = 10) {
    return await httpClient.get('/api/admin/categories', { page, size })
  }
  static async createCategory(payload) {
    return await httpClient.post('/api/admin/categories', payload)
  }
  static async updateCategory(id, payload) {
    return await httpClient.put(`/api/admin/categories/${id}`, payload)
  }
  static async deleteCategory(id) {
    return await httpClient.delete(`/api/admin/categories/${id}`)
  }

  static async getAdminTags(page = 1, size = 10) {
    return await httpClient.get('/api/admin/tags', { page, size })
  }
  static async createTag(payload) {
    return await httpClient.post('/api/admin/tags', payload)
  }
  static async updateTag(id, payload) {
    return await httpClient.put(`/api/admin/tags/${id}`, payload)
  }
  static async deleteTag(id) {
    return await httpClient.delete(`/api/admin/tags/${id}`)
  }

  static async getAdminBooks(page = 1, size = 10, keyword = '', status = '', categoryId = '') {
    const params = { page, size }
    if (keyword) params.keyword = keyword
    if (status) params.status = status
    if (categoryId) params.categoryId = categoryId
    return await httpClient.get('/api/admin/books', params)
  }

  static async deleteBook(id) {
    return await httpClient.delete(`/api/admin/books/${id}`)
  }

  static async updateBookStatus(id, status, reason = '') {
    return await httpClient.put(`/api/admin/books/${id}/status`, { status, reason })
  }

  static async setBookRecommendStatus(id, isRecommended) {
    return await httpClient.put(`/api/admin/books/${id}/recommend?isRecommended=${isRecommended}`)
  }

  static async batchUpdateBookStatus(bookIds, status, reason = '') {
    return await httpClient.put('/api/admin/books/batch/status', { bookIds, status, reason })
  }

  static async getAdminComments(page = 1, size = 10, keyword = '', status = '', bookId = '', userId = '') {
    const params = { page, size }
    if (keyword) params.keyword = keyword
    if (status) params.status = status
    if (bookId) params.bookId = bookId
    if (userId) params.userId = userId
    return await httpClient.get('/api/admin/comments', params)
  }

  static async deleteComment(id) {
    return await httpClient.delete(`/api/admin/comments/${id}`)
  }

  static async batchDeleteComments(ids) {
    return await httpClient.delete('/api/admin/comments/batch', { data: { ids } })
  }

  static async batchReview(payload) {
    return await httpClient.post('/api/admin/review/batch', payload)
  }

  static async batchEditorReview(payload) {
    return await httpClient.post('/api/review/batch', payload)
  }

  // === Banner Management ===
  static async getAdminBanners(page = 1, size = 10, status = '') {
    const params = { page, size }
    if (status) params.status = status
    return await httpClient.get('/api/admin/banners', params)
  }
  static async createBanner(payload) {
    return await httpClient.post('/api/admin/banners', payload)
  }
  static async updateBanner(id, payload) {
    return await httpClient.put(`/api/admin/banners/${id}`, payload)
  }
  static async deleteBanner(id) {
    return await httpClient.delete(`/api/admin/banners/${id}`)
  }

  static async searchBooks(keyword) {
    return await httpClient.get('/api/admin/books/search', { keyword })
  }

  // === Author Application Management ===
  static async getAuthorApplications(page = 1, size = 10, status = '') {
    const params = { page, size }
    if (status) params.status = status
    return await httpClient.get('/api/admin/author-applications', params)
  }

  static async approveAuthorApplication(id, comment = '') {
    const body = comment ? { comment } : {}
    return await httpClient.post(`/api/admin/author-applications/${id}/approve`, body)
  }

  static async rejectAuthorApplication(id, comment) {
    return await httpClient.post(`/api/admin/author-applications/${id}/reject`, { comment })
  }

  // === Banner Image Upload ===
  static async uploadBannerImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return await httpClient.upload('/api/admin/banners/upload', formData)
  }
}
