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
        <div class="desc">系统版本：{{ systemInfo.version || '—' }}，运行时间：{{ formattedUptime }}</div>
        <div class="desc">Java：{{ systemInfo.javaVersion || '—' }}，OS：{{ systemInfo.osName || '—' }}</div>
        <div class="desc">内存：已用 {{ systemInfo.usedMemory || '—' }} / 总计 {{ systemInfo.totalMemory || '—' }}</div>
      </div>
    </el-card>

    <el-row :gutter="16" class="lists-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <div class="list-header">
            <div class="list-title">待审核</div>
            <el-space>
              <el-select v-model="pendingType" size="small" placeholder="类型" style="width:140px" @change="loadPending">
                <el-option label="全部" value="" />
                <el-option label="书籍" value="book" />
                <el-option label="章节" value="chapter" />
                <el-option label="评论" value="comment" />
                <el-option label="作者申请" value="author_application" />
              </el-select>
            </el-space>
          </div>
          <div v-if="pendingLoading" class="loading"><el-skeleton :rows="5" animated /></div>
          <el-empty v-else-if="pendingItems.length === 0" description="暂无待审核" />
          <el-table v-else :data="pendingItems" border>
            <el-table-column prop="auditType" label="类型" width="120" />
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="submitterName" label="提交人" width="140" />
            <el-table-column prop="createdAt" label="提交时间" width="180" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <div class="list-header">
            <div class="list-title">审核历史</div>
            <el-space>
              <el-select v-model="historyType" size="small" placeholder="类型" style="width:140px" @change="loadHistory">
                <el-option label="全部" value="" />
                <el-option label="书籍" value="book" />
                <el-option label="章节" value="chapter" />
                <el-option label="评论" value="comment" />
                <el-option label="作者申请" value="author_application" />
              </el-select>
            </el-space>
          </div>
          <div v-if="historyLoading" class="loading"><el-skeleton :rows="5" animated /></div>
          <el-empty v-else-if="reviewHistory.length === 0" description="暂无历史记录" />
          <el-table v-else :data="reviewHistory" size="small" border>
            <el-table-column prop="auditType" label="类型" width="120" />
            <el-table-column prop="targetTitle" label="标题" />
            <el-table-column prop="auditorUsername" label="审核员" width="140" />
            <el-table-column prop="result" label="结果" width="120" />
            <el-table-column prop="auditedAt" label="审核时间" width="180" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
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
      pendingItems: [],
      reviewHistory: [],
      pendingType: '',
      historyType: '',
      pendingLoading: false,
      historyLoading: false,
      nowMs: Date.now(),
      startAtMs: null,
      uptimeTimerId: null
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
    },
    formattedUptime() {
      if (!this.startAtMs) return '—'
      const elapsed = Math.max(this.nowMs - this.startAtMs, 0)
      const d = Math.floor(elapsed / (24 * 3600 * 1000))
      const h = Math.floor((elapsed % (24 * 3600 * 1000)) / (3600 * 1000))
      const m = Math.floor((elapsed % (3600 * 1000)) / (60 * 1000))
      const s = Math.floor((elapsed % (60 * 1000)) / 1000)
      const parts = []
      if (d) parts.push(`${d}天`)
      parts.push(`${h}小时`)
      parts.push(`${m}分`)
      parts.push(`${s}秒`)
      return parts.join('')
    }
  },
  mounted() {
    this.loadStats()
    this.loadPending()
    this.loadHistory()
  },
  beforeUnmount() {
    if (this.uptimeTimerId) {
      clearInterval(this.uptimeTimerId)
      this.uptimeTimerId = null
    }
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
        const v = this.systemInfo?.uptime
        if (typeof v === 'number' && v > 0) {
          const derivedStart = v > 946684800000 ? v : (Date.now() - v)
          const cached = Number(localStorage.getItem('admin-start-at'))
          if (cached && cached > 0 && cached < Date.now()) {
            this.startAtMs = cached
          } else {
            this.startAtMs = derivedStart
            localStorage.setItem('admin-start-at', String(this.startAtMs))
          }
          if (this.uptimeTimerId) clearInterval(this.uptimeTimerId)
          this.uptimeTimerId = setInterval(() => {
            this.nowMs = Date.now()
          }, 1000)
        }
      } catch (e) {
        console.error('加载仪表盘统计失败:', e)
      } finally {
        this.loading = false
      }
    },
    async loadPending() {
      this.pendingLoading = true
      try {
        const res = await AdminService.getReviewItems(1, 5, this.pendingType, 'pending')
        this.pendingItems = res?.records || []
      } catch (e) {
        console.error('加载待审核失败:', e)
      } finally {
        this.pendingLoading = false
      }
    },
    async loadHistory() {
      this.historyLoading = true
      try {
        const res = await AdminService.getReviewHistory(1, 5, this.historyType)
        this.reviewHistory = res?.records || []
      } catch (e) {
        console.error('加载审核历史失败:', e)
      } finally {
        this.historyLoading = false
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
.lists-row { margin-top: 16px; }
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.list-title { font-weight: 600; }
</style>
