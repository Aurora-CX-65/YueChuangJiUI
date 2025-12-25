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

  static async getSystemSettings() {
    return await httpClient.get('/api/admin/settings')
  }

  static async updateSystemSettings(settingsMap) {
    return await httpClient.put('/api/admin/settings', { settings: settingsMap })
  }
  static async getUsers({ page = 1, size = 10, keyword = '', status = '', role = '' } = {}) {
    const params = { page, size }
    if (keyword) params.keyword = keyword
    if (status) params.status = status
    if (role) params.role = role
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

  static async approveReviewItem(id, comment = '') {
    const body = comment ? { comment } : {}
    return await httpClient.post(`/api/admin/review/items/${id}/approve`, body)
  }

  static async rejectReviewItem(id, comment) {
    return await httpClient.post(`/api/admin/review/items/${id}/reject`, { comment })
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
}
