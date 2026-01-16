import { httpClient } from '@/utils/http-client.js'

export class BannerService {
  static async getActiveBanners() {
    return await httpClient.get('/api/banners')
  }
}
