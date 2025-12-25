import { httpClient } from '@/utils/http-client.js'

export class AdminService {
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
}
