<template>
  <div class="admin-book-chapters">
    <el-card shadow="never">
      <div class="header">
        <div class="header-left">
          <el-button icon="Back" circle @click="$router.back()" style="margin-right: 16px" />
          <div class="title" v-if="chapters.length > 0">
            《{{ chapters[0].bookTitle }}》章节列表
          </div>
          <div class="title" v-else>书籍章节列表</div>
        </div>
        <el-button size="small" @click="loadChapters">刷新</el-button>
      </div>

      <div class="content">
        <div v-if="loading" class="loading"><el-skeleton :rows="6" animated /></div>
        <el-empty v-else-if="chapters.length === 0" description="暂无章节数据" />
        
        <el-table v-else :data="chapters" border stripe>
          <el-table-column prop="sortOrder" label="序号" width="80" align="center" />
          <el-table-column prop="title" label="章节标题" min-width="200" />
          <el-table-column prop="wordCount" label="字数" width="100" align="center" />
          <el-table-column prop="viewCount" label="阅读量" width="100" align="center" />
          <el-table-column label="状态" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" width="180" align="center">
            <template #default="{ row }">
              {{ formatDateTime(row.publishedAt || row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button 
                v-if="row.status === 'published'"
                size="small" 
                type="warning" 
                @click="openSuspend(row)"
              >
                下架
              </el-button>
              <el-button 
                v-if="row.status === 'suspended'"
                size="small" 
                type="success" 
                @click="openRestore(row)"
              >
                恢复
              </el-button>
              <span v-if="['draft', 'pending_review'].includes(row.status)" class="text-gray">
                {{ row.status === 'draft' ? '草稿' : '审核中' }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 下架对话框 -->
    <el-dialog v-model="suspendVisible" title="下架章节" width="400px">
      <el-form>
        <el-form-item label="下架原因" required>
          <el-input v-model="suspendReason" type="textarea" :rows="3" placeholder="请输入下架原因（必填），将通知作者" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="suspendVisible = false">取消</el-button>
          <el-button type="danger" :loading="actionLoading" @click="confirmSuspend">确定下架</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { AdminService } from '@/services/admin-service.js'
import { Back } from '@element-plus/icons-vue'

export default {
  name: 'AdminBookChapters',
  components: { Back },
  data() {
    return {
      bookId: null,
      loading: false,
      chapters: [],
      
      // Suspend Dialog
      suspendVisible: false,
      suspendReason: '',
      actionRow: null,
      actionLoading: false
    }
  },
  created() {
    this.bookId = this.$route.params.bookId
  },
  mounted() {
    if (this.bookId) {
      this.loadChapters()
    }
  },
  methods: {
    async loadChapters() {
      this.loading = true
      try {
        const res = await AdminService.getAdminBookChapters(this.bookId)
        this.chapters = res || []
      } catch (e) {
        console.error('加载章节列表失败:', e)
        window.notificationManager?.error('加载章节列表失败')
      } finally {
        this.loading = false
      }
    },
    formatDateTime(val) {
      return AdminService.formatDateTime(val)
    },
    getStatusType(status) {
      const map = {
        'published': 'success',
        'draft': 'info',
        'pending_review': 'primary',
        'suspended': 'danger'
      }
      return map[status] || 'info'
    },
    getStatusText(status) {
      const map = {
        'published': '已发布',
        'draft': '草稿',
        'pending_review': '待审核',
        'suspended': '已下架'
      }
      return map[status] || status
    },
    openSuspend(row) {
      this.actionRow = row
      this.suspendReason = ''
      this.suspendVisible = true
    },
    async confirmSuspend() {
      if (!this.actionRow) return
      const reason = this.suspendReason.trim()
      if (!reason) {
        window.notificationManager?.error('请填写下架原因')
        return
      }
      
      this.actionLoading = true
      try {
        await AdminService.suspendChapter(this.actionRow.id, reason)
        this.suspendVisible = false
        window.notificationManager?.success('下架成功')
        this.loadChapters()
      } catch (e) {
        console.error('下架失败:', e)
        window.notificationManager?.error('下架失败')
      } finally {
        this.actionLoading = false
      }
    },
    // TODO: 恢复功能后端暂未实现，目前前端预留入口
    openRestore(row) {
        // 由于后端暂时没有专门的 restoreChapter 接口，
        // 这里可以暂时提示不支持，或者调用更新状态的接口如果允许的话。
        // 根据之前的实现，suspendChapter 是专门的接口。
        // 如果要恢复，可能需要 updateChapterStatus 接口，但目前 AdminService 只有 updateBookStatus。
        // 建议后续补充 restoreChapter 接口。
        window.notificationManager?.info('恢复功能开发中')
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.header-left {
  display: flex;
  align-items: center;
}
.title { font-weight: 600; font-size: 16px; }
.loading { padding: 20px; }
.text-gray { color: #909399; font-size: 12px; }
</style>