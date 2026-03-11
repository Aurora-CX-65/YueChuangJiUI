<template>
  <div class="editor-dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待审核书籍</span>
            </div>
          </template>
          <div class="stat-value text-warning">{{ stats.pendingBooks }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待审核章节</span>
            </div>
          </template>
          <div class="stat-value text-warning">{{ stats.pendingChapters }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待审核评论</span>
            </div>
          </template>
          <div class="stat-value text-danger">{{ stats.pendingComments }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日处理</span>
            </div>
          </template>
          <div class="stat-value text-success">{{ stats.processedToday }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="12">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="card-header">
              <span>最新待审核书籍</span>
              <el-button text @click="$router.push('/author/book-reviews')">去处理</el-button>
            </div>
          </template>
          <el-empty v-if="!pendingBookList.length" description="暂无待审核书籍" />
          <el-table v-else :data="pendingBookList" style="width: 100%" size="small">
            <el-table-column prop="targetTitle" label="书名" show-overflow-tooltip />
            <el-table-column prop="submitterUsername" label="提交人" width="120" />
            <el-table-column label="提交时间" width="160">
              <template #default="{ row }">{{ formatDateTime(row.submittedAt) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="h-full">
          <template #header>
            <div class="card-header">
              <span>最新待审核章节</span>
              <el-button text @click="$router.push('/author/chapter-reviews')">去处理</el-button>
            </div>
          </template>
          <el-empty v-if="!pendingChapterList.length" description="暂无待审核章节" />
          <el-table v-else :data="pendingChapterList" style="width: 100%" size="small">
            <el-table-column prop="targetTitle" label="章节名" show-overflow-tooltip />
            <el-table-column prop="relatedInfo" label="所属书籍" show-overflow-tooltip />
            <el-table-column label="提交时间" width="160">
              <template #default="{ row }">{{ formatDateTime(row.submittedAt) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { AdminService } from '@/services/admin-service'
import { formatDate } from '@/utils/formatters'

export default {
  name: 'EditorDashboard',
  data() {
    return {
      stats: {
        pendingBooks: 0,
        pendingChapters: 0,
        pendingComments: 0,
        processedToday: 0
      },
      pendingBookList: [],
      pendingChapterList: []
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      try {
        // 并行加载数据
        const [statsRes, booksRes, chaptersRes, commentsRes] = await Promise.all([
          AdminService.getEditorReviewStats(),
          AdminService.getEditorReviewItems(1, 5, 'book', 'pending'),
          AdminService.getEditorReviewItems(1, 5, 'chapter', 'pending'),
          AdminService.getEditorReviewItems(1, 1, 'comment', 'pending')
        ])

        // 处理统计数据
        if (statsRes) {
          this.stats.pendingBooks = statsRes.pendingBooks || 0
          this.stats.pendingChapters = statsRes.pendingChapters || 0
          this.stats.pendingComments = statsRes.pendingComments || 0
          this.stats.processedToday = statsRes.processedToday || 0
        } else {
          // 如果统计接口不可用，使用列表总数作为后备
          this.stats.pendingBooks = booksRes?.total || 0
          this.stats.pendingChapters = chaptersRes?.total || 0
          this.stats.pendingComments = commentsRes?.total || 0
        }

        // 处理列表数据
        this.pendingBookList = booksRes?.records || []
        this.pendingChapterList = chaptersRes?.records || []

      } catch (e) {
        console.error('初始化编辑仪表盘失败:', e)
      }
    },
    formatDateTime(val) {
      return formatDate(val)
    }
  }
}
</script>

<style scoped>
.mt-4 {
  margin-top: 20px;
}
.h-full {
  height: 100%;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
.text-warning {
  color: #e6a23c;
}
.text-danger {
  color: #f56c6c;
}
.text-success {
  color: #67c23a;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
