<template>
  <div class="admin-dashboard">
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never">
          <div class="stat-item">
            <div class="stat-title">用户总数</div>
            <div class="stat-value">{{ userStats.totalUsers ?? '—' }}</div>
            <div class="stat-sub">
              今日新增 {{ userStats.newUsersToday ?? 0 }}，本周 {{ userStats.newUsersThisWeek ?? 0 }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never">
          <div class="stat-item">
            <div class="stat-title">书籍总数</div>
            <div class="stat-value">{{ contentStats.totalBooks ?? '—' }}</div>
            <div class="stat-sub">
              已发布 {{ contentStats.publishedBooks ?? 0 }}，章节 {{ contentStats.totalChapters ?? 0 }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never">
          <div class="stat-item">
            <div class="stat-title">评论总数</div>
            <div class="stat-value">{{ contentStats.totalComments ?? '—' }}</div>
            <div class="stat-sub">
              今日新书 {{ contentStats.newBooksToday ?? 0 }}，今日新章 {{ contentStats.newChaptersToday ?? 0 }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never">
          <div class="stat-item">
            <div class="stat-title">待审核总数</div>
            <div class="stat-value">{{ reviewStats.pendingCount ?? (systemReview.pendingReviews ?? '—') }}</div>
            <div class="stat-sub">
              书籍 {{ typeStats.bookCount ?? 0 }}，章节 {{ typeStats.chapterCount ?? 0 }}，评论 {{ typeStats.commentCount ?? 0 }}，作者 {{ typeStats.authorApplicationCount ?? 0 }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="welcome-card">
      <div v-if="loading" class="loading">
        <el-skeleton :rows="4" animated />
      </div>
      <div v-else class="welcome">
        <div class="title">欢迎使用管理后台</div>
        <div class="desc">系统版本：{{ systemInfo.version || '—' }}，运行时间：{{ systemInfo.uptime || '—' }}</div>
        <div class="desc">Java：{{ systemInfo.javaVersion || '—' }}，OS：{{ systemInfo.osName || '—' }}</div>
        <div class="desc">内存：已用 {{ systemInfo.usedMemory || '—' }} / 总计 {{ systemInfo.totalMemory || '—' }}</div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { AdminService } from '@/services/admin-service.js'
export default {
  name: 'AdminDashboard',
  data() {
    return {
      loading: false,
      stats: null,
      reviewStats: {},
    }
  },
  computed: {
    userStats() {
      return (this.stats && this.stats.userStats) || {}
    },
    contentStats() {
      return (this.stats && this.stats.contentStats) || {}
    },
    systemReview() {
      return (this.stats && this.stats.reviewStats) || {}
    },
    systemInfo() {
      return (this.stats && this.stats.systemInfo) || {}
    },
    typeStats() {
      return (this.reviewStats && this.reviewStats.typeStats) || {}
    }
  },
  mounted() {
    this.loadStats()
  },
  methods: {
    async loadStats() {
      this.loading = true
      try {
        const [stats, review] = await Promise.all([
          AdminService.getSystemStats(),
          AdminService.getReviewStats()
        ])
        this.stats = stats || {}
        this.reviewStats = review || {}
      } catch (e) {
        console.error('加载仪表盘统计失败:', e)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.stats-row {
  margin-bottom: 16px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}
.stat-title {
  color: #606266;
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
}
.stat-sub {
  color: #909399;
  font-size: 12px;
}
.welcome-card {
  margin-top: 8px;
}
.welcome .title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 6px;
}
.welcome .desc {
  color: #606266;
}
.loading { padding: 12px; }
</style>
