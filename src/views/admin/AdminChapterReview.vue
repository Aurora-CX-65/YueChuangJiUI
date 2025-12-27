<template>
  <div class="admin-chapter-reviews">
    <el-card shadow="never">
      <div class="header">
        <div class="title">章节审核</div>
        <div class="controls">
          <el-radio-group v-model="status" size="small" @change="loadItems">
            <el-radio-button label="pending">待审核</el-radio-button>
            <el-radio-button label="approved">已通过</el-radio-button>
            <el-radio-button label="rejected">已驳回</el-radio-button>
          </el-radio-group>
          <el-button size="small" @click="loadItems" :loading="loading">刷新</el-button>
        </div>
      </div>

      <div class="content">
        <div v-if="loading" class="loading"><el-skeleton :rows="6" animated /></div>
        <el-empty v-else-if="items.length === 0" description="暂无待审核章节" />
        <div class="table-wrapper" v-else>
          <el-table :data="items" border size="small">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="章节信息" min-width="200">
              <template #default="{ row }">
                <div class="chapter-info">
                  <div class="chapter-title">{{ row.targetTitle }}</div>
                  <div class="book-info">
                    <span v-if="row.bookTitle">所属书籍: {{ row.bookTitle }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="submitterUsername" label="作者" width="120" />
            <el-table-column prop="submittedAt" label="提交时间" width="160">
              <template #default="{ row }">{{ formatDateTime(row.submittedAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button 
                  v-if="row.status === 'pending_review' || row.status === 'pending'"
                  size="small" 
                  type="primary" 
                  @click="openReviewDialog(row)"
                >审核</el-button>
                <el-tag v-else :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination" v-if="total > 0">
          <el-pagination
            v-model:current-page="page"
            :page-size="size"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 20, 50]"
            background
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 章节审核对话框 -->
    <el-dialog v-model="reviewVisible" title="章节审核" width="800px" destroy-on-close>
      <div v-if="contentLoading" class="loading"><el-skeleton :rows="10" animated /></div>
      <div v-else class="chapter-review-container">
        <h2 class="chapter-title">{{ currentChapter?.title }}</h2>
        <div class="chapter-meta">
          <span>字数：{{ currentChapter?.wordCount }}</span>
          <span>状态：<el-tag size="small" :type="getStatusType(currentChapter?.status)">{{ getStatusLabel(currentChapter?.status) }}</el-tag></span>
        </div>
        <div class="chapter-content" v-html="currentChapter?.content"></div>
        
        <div class="review-actions" v-if="currentItem?.status === 'pending_review' || currentItem?.status === 'pending'">
          <el-divider>审核操作</el-divider>
          <el-input 
            v-model="reviewComment" 
            placeholder="请输入审核意见（驳回时必填）" 
            type="textarea" 
            :rows="2" 
            style="margin-bottom: 12px"
          />
          <div class="action-buttons">
            <el-button type="danger" @click="handleReject">驳回</el-button>
            <el-button type="success" @click="handleApprove">通过</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { AdminService } from '@/services/admin-service.js'

export default {
  name: 'AdminChapterReview',
  data() {
    return {
      loading: false,
      items: [],
      page: 1,
      size: 10,
      total: 0,
      status: 'pending', // pending, approved, rejected
      
      reviewVisible: false,
      contentLoading: false,
      currentItem: null,
      currentChapter: null,
      reviewComment: ''
    }
  },
  mounted() {
    this.loadItems()
  },
  methods: {
    formatDateTime(val) {
      if (!val) return ''
      return AdminService.formatDateTime(val)
    },
    getStatusLabel(status) {
      const map = {
        'pending': '待审核',
        'pending_review': '待审核',
        'approved': '已通过',
        'published': '已发布',
        'rejected': '已驳回',
        'draft': '草稿'
      }
      return map[status] || status
    },
    getStatusType(status) {
      const map = {
        'pending': 'warning',
        'pending_review': 'warning',
        'approved': 'success',
        'published': 'success',
        'rejected': 'danger',
        'draft': 'info'
      }
      return map[status] || 'info'
    },
    async loadItems() {
      this.loading = true
      try {
        // 使用 getReviewItems 接口获取章节类型的审核项
        // status 参数：pending, approved, rejected
        const res = await AdminService.getReviewItems(this.page, this.size, 'chapter', this.status)
        this.items = res?.records || []
        this.total = res?.total || 0
      } catch (e) {
        console.error('加载章节审核列表失败:', e)
      } finally {
        this.loading = false
      }
    },
    handleSizeChange(s) {
      this.size = s
      this.page = 1
      this.loadItems()
    },
    handlePageChange(p) {
      this.page = p
      this.loadItems()
    },
    async openReviewDialog(item) {
      this.currentItem = item
      this.reviewVisible = true
      this.contentLoading = true
      this.currentChapter = null
      this.reviewComment = ''
      
      try {
        // 获取章节详细内容
        const res = await AdminService.getChapterContent(item.targetId)
        this.currentChapter = res
      } catch (e) {
        console.error('加载章节内容失败:', e)
        if (window.notificationManager) {
          window.notificationManager.error('加载章节内容失败')
        }
      } finally {
        this.contentLoading = false
      }
    },
    async handleApprove() {
      if (!this.currentItem) return
      try {
        await AdminService.approveChapter(this.currentItem.targetId, this.reviewComment)
        if (window.notificationManager) {
          window.notificationManager.success('章节审核通过')
        }
        this.reviewVisible = false
        this.loadItems()
      } catch (e) {
        console.error('审核通过失败:', e)
        if (window.notificationManager) {
          window.notificationManager.error('操作失败')
        }
      }
    },
    async handleReject() {
      if (!this.currentItem) return
      if (!this.reviewComment.trim()) {
        if (window.notificationManager) {
          window.notificationManager.warning('请填写驳回原因')
        }
        return
      }
      try {
        await AdminService.rejectChapter(this.currentItem.targetId, this.reviewComment)
        if (window.notificationManager) {
          window.notificationManager.success('章节已驳回')
        }
        this.reviewVisible = false
        this.loadItems()
      } catch (e) {
        console.error('审核驳回失败:', e)
        if (window.notificationManager) {
          window.notificationManager.error('操作失败')
        }
      }
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.title { font-weight: 600; font-size: 16px; }
.controls { display: flex; gap: 8px; align-items: center; }
.loading { padding: 24px; }
.pagination { margin-top: 16px; display: flex; justify-content: center; }
.table-wrapper { width: 100%; overflow-x: auto; }

.chapter-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.chapter-title {
  font-weight: 500;
  color: #303133;
}
.book-info {
  font-size: 12px;
  color: #909399;
}

.chapter-review-container {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 10px;
}
.chapter-title {
  text-align: center;
  margin-bottom: 10px;
  font-size: 20px;
}
.chapter-meta {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}
.chapter-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}
.review-actions {
  margin-top: 20px;
  background: #fff;
  position: sticky;
  bottom: 0;
  padding: 10px 0;
  border-top: 1px solid #eee;
}
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>