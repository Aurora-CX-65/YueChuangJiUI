<template>
  <div class="author-dashboard">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总字数</span>
            </div>
          </template>
          <div class="stat-value">{{ formatNumber(stats.totalWords) }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>作品数</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.bookCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总收藏</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.totalCollections }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据可视化图表 -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>作品状态分布</span>
            </div>
          </template>
          <PieChart
            title=""
            :seriesData="bookStatusPieData"
            height="300px"
          />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>创作数据概览</span>
            </div>
          </template>
          <BarChart
            title=""
            :xAxisData="['作品数', '总字数(万)', '收藏数']"
            :seriesData="creationBarData"
            seriesName="数量"
            height="300px"
          />
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mt-4" shadow="never">
      <template #header>
        <div class="card-header">
          <span>最近更新</span>
          <el-button text @click="$router.push('/author/books')">查看全部</el-button>
        </div>
      </template>
      <el-empty v-if="!recentBooks.length" description="暂无作品" />
      <el-table v-else :data="recentBooks" style="width: 100%">
        <el-table-column prop="title" label="书名" />
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="$router.push(`/author/books/${row.id}/chapters`)">写章节</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/user-store'
import { useBookStore } from '@/stores/book-store'
import { UserService } from '@/services/user-service'
import { formatDate } from '@/utils/formatters'
import { PieChart, BarChart } from '@/components/charts'

export default {
  name: 'AuthorDashboard',
  components: {
    PieChart,
    BarChart
  },
  data() {
    return {
      stats: {
        totalWords: 0,
        bookCount: 0,
        totalCollections: 0
      },
      recentBooks: []
    }
  },
  setup() {
    const userStore = useUserStore()
    const bookStore = useBookStore()
    return { userStore, bookStore }
  },
  computed: {
    bookStatusPieData() {
      const statusMap = {}
      this.recentBooks.forEach(book => {
        const status = this.getStatusLabel(book.status)
        statusMap[status] = (statusMap[status] || 0) + 1
      })
      return Object.entries(statusMap).map(([name, value]) => ({ name, value }))
    },
    creationBarData() {
      return [
        this.stats.bookCount || 0,
        Math.round((this.stats.totalWords || 0) / 10000),
        this.stats.totalCollections || 0
      ]
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      if (this.userStore.currentUserId) {
        try {
          // 获取作者统计信息
          const stats = await UserService.getUserStats(this.userStore.currentUserId)
          if (stats) {
            this.stats.bookCount = stats.bookCount || 0
            this.stats.totalWords = stats.totalWordCount || 0
            this.stats.totalCollections = stats.collectionCount || 0
          }

          // 加载作者的书籍列表作为最近更新
          const res = await this.bookStore.fetchBooksByAuthor(this.userStore.currentUserId, 1, 5)
          if (res && res.records) {
            this.recentBooks = res.records
            // 如果接口返回了书籍总数且统计接口为0（异常情况），则使用列表总数
            if (this.stats.bookCount === 0 && res.total > 0) {
              this.stats.bookCount = res.total
            }
          }
        } catch (e) {
          console.error('初始化作者看板失败:', e)
        }
      }
    },
    formatNumber(num) {
      return num ? num.toLocaleString() : '0'
    },
    formatDateTime(val) {
      return formatDate(val)
    },
    getStatusLabel(status) {
      const map = {
        'draft': '草稿',
        'pending_review': '审核中',
        'published': '已发布',
        'serializing': '连载中',
        'completed': '已完结',
        'suspended': '已断更'
      }
      return map[status] || status
    },
    getStatusType(status) {
      const map = {
        'draft': 'info',
        'pending_review': 'warning',
        'published': 'success',
        'serializing': 'primary',
        'completed': 'success',
        'suspended': 'danger'
      }
      return map[status] || ''
    }
  }
}
</script>

<style scoped>
.mt-4 {
  margin-top: 20px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
