<template>
  <div class="admin-chapter-reviews">
    <el-card shadow="never">
      <div class="header">
        <div class="title">章节审核</div>
        <el-space>
          <el-select v-model="status" placeholder="审核状态" size="small" style="width:140px" @change="loadPending">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
          <el-button size="small" type="primary" @click="loadPending">刷新</el-button>
          <el-button size="small" type="primary" :disabled="!selectedRows.length" @click="openBatchApprove">批量通过</el-button>
          <el-button size="small" type="danger" :disabled="!selectedRows.length" @click="openBatchReject">批量拒绝</el-button>
        </el-space>
      </div>
      <div class="content">
        <div v-if="loading" class="loading"><el-skeleton :rows="6" animated /></div>
        <el-empty v-else-if="items.length === 0" description="暂无章节审核数据" />
        <div class="table-wrapper" v-else>
          <el-table :data="items" border size="small" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="targetId" label="章节ID" width="100" />
            <el-table-column prop="targetTitle" label="章节标题" min-width="240" />
            <el-table-column prop="relatedInfo" label="所属书籍" min-width="200" />
            <el-table-column prop="submitterUsername" label="提交者" width="140" />
            <el-table-column label="提交时间" width="180">
              <template #default="{ row }">{{ formatDateTime(row.submittedAt) }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120" />
            <el-table-column label="操作" width="320" fixed="right">
              <template #default="{ row }">
                <el-space wrap v-if="row.status === 'pending_review' || status === 'pending'">
                  <el-button size="small" type="success" @click="openApprove(row)">通过</el-button>
                  <el-button size="small" type="danger" @click="openReject(row)">拒绝</el-button>
                </el-space>
                <span v-else>已处理</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination" v-if="total > 0">
            <el-pagination
              v-model:current-page="page"
              :page-size="size"
              :total="total"
              layout="total, prev, pager, next, jumper"
              background
              @current-change="handlePageChange"
            />
          </div>
        </div>

        <el-divider />

        <div class="subheader">
          <div class="title">审核历史</div>
          <el-space>
            <el-button size="small" @click="loadHistory">刷新</el-button>
          </el-space>
        </div>
        <div v-if="historyLoading" class="loading"><el-skeleton :rows="5" animated /></div>
        <el-empty v-else-if="history.length === 0" description="暂无历史记录" />
        <el-table v-else :data="history" size="small" border>
          <el-table-column prop="targetId" label="章节ID" width="100" />
          <el-table-column prop="targetTitle" label="章节标题" />
          <el-table-column prop="auditorUsername" label="审核员" width="140" />
          <el-table-column prop="result" label="结果" width="120" />
          <el-table-column label="时间" width="180">
            <template #default="{ row }">{{ formatDateTime(row.auditedAt) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 审核通过对话框 -->
    <el-dialog v-model="approveVisible" title="审核通过" width="400px">
      <el-form>
        <el-form-item label="审核意见">
          <el-input v-model="approveComment" type="textarea" :rows="3" placeholder="请输入审核意见（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approveVisible = false">取消</el-button>
          <el-button type="primary" :loading="actionLoading" @click="confirmApprove">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 审核拒绝对话框 -->
    <el-dialog v-model="rejectVisible" title="审核拒绝" width="400px">
      <el-form>
        <el-form-item label="拒绝原因" required>
          <el-input v-model="rejectComment" type="textarea" :rows="3" placeholder="请输入拒绝原因（必填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectVisible = false">取消</el-button>
          <el-button type="danger" :loading="actionLoading" @click="confirmReject">确定拒绝</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="batchVisible" :title="batchAction === 'approved' ? '批量通过' : '批量拒绝'" width="400px">
      <el-form>
        <el-form-item :label="batchAction === 'approved' ? '审核意见' : '拒绝原因'" :required="batchAction === 'rejected'">
          <el-input 
            v-model="batchComment" 
            type="textarea" 
            :rows="3" 
            :placeholder="batchAction === 'approved' ? '请输入审核意见（可选）' : '请输入拒绝原因（必填）'" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchVisible = false">取消</el-button>
          <el-button 
            :type="batchAction === 'approved' ? 'primary' : 'danger'" 
            :loading="actionLoading" 
            @click="confirmBatch"
          >
            确定{{ batchAction === 'approved' ? '通过' : '拒绝' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { AdminService } from '@/services/admin-service.js'
export default {
  name: 'AdminChapterReviews',
  data() {
    return {
      status: 'pending',
      loading: false,
      items: [],
      page: 1,
      size: 10,
      total: 0,
      history: [],
      historyLoading: false,
      approveVisible: false,
      rejectVisible: false,
      approveComment: '',
      rejectComment: '',
      actionRow: null,
      actionLoading: false,
      selectedRows: [],
      batchAction: null,
      batchVisible: false,
      batchComment: ''
    }
  },
  mounted() {
    this.loadPending()
    this.loadHistory()
  },
  methods: {
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    formatDateTime(val) {
      if (!val) return ''
      const d = typeof val === 'string' ? new Date(val) : val
      if (isNaN(d.getTime())) return val
      const y = d.getFullYear()
      const M = String(d.getMonth() + 1).padStart(2, '0')
      const D = String(d.getDate()).padStart(2, '0')
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      const s = String(d.getSeconds()).padStart(2, '0')
      return `${y}-${M}-${D} ${h}:${m}:${s}`
    },
    async loadPending() {
      this.loading = true
      try {
        const res = await AdminService.getReviewItems(this.page, this.size, 'chapter', this.status)
        this.items = res?.records || []
        this.total = res?.total || 0
      } catch (e) {
        console.error('加载章节审核列表失败:', e)
      } finally {
        this.loading = false
      }
    },
    handlePageChange(p) {
      this.page = p
      this.loadPending()
    },
    async loadHistory() {
      this.historyLoading = true
      try {
        const res = await AdminService.getReviewHistory(1, 10, 'chapter')
        this.history = res?.records || []
      } catch (e) {
        console.error('加载章节审核历史失败:', e)
      } finally {
        this.historyLoading = false
      }
    },
    openApprove(row) {
      this.actionRow = row
      this.approveComment = ''
      this.approveVisible = true
    },
    async confirmApprove() {
      if (!this.actionRow) return
      this.actionLoading = true
      try {
        await AdminService.approveChapterReview(this.actionRow.targetId, this.approveComment.trim())
        this.approveVisible = false
        window.notificationManager && window.notificationManager.success('审核通过成功')
        this.loadPending()
        this.loadHistory()
      } catch (e) {
        console.error('审核通过失败:', e)
      } finally {
        this.actionLoading = false
      }
    },
    openReject(row) {
      this.actionRow = row
      this.rejectComment = ''
      this.rejectVisible = true
    },
    async confirmReject() {
      if (!this.actionRow) return
      const comment = this.rejectComment.trim()
      if (!comment) {
        window.notificationManager && window.notificationManager.error('请填写审核拒绝意见')
        return
      }
      this.actionLoading = true
      try {
        await AdminService.rejectChapterReview(this.actionRow.targetId, comment)
        this.rejectVisible = false
        window.notificationManager && window.notificationManager.success('审核拒绝成功')
        this.loadPending()
        this.loadHistory()
      } catch (e) {
        console.error('审核拒绝失败:', e)
      } finally {
        this.actionLoading = false
      }
    },
    openBatchApprove() {
      if (!this.selectedRows.length) return
      this.batchAction = 'approved'
      this.batchComment = ''
      this.batchVisible = true
    },
    openBatchReject() {
      if (!this.selectedRows.length) return
      this.batchAction = 'rejected'
      this.batchComment = ''
      this.batchVisible = true
    },
    async confirmBatch() {
      if (this.batchAction === 'rejected' && !this.batchComment.trim()) {
        if (window.notificationManager) {
          window.notificationManager.error('批量拒绝必须填写原因')
        }
        return
      }
      
      this.actionLoading = true
      try {
        const ids = this.selectedRows.map(r => r.targetId)
        await AdminService.batchReview({
          itemIds: ids,
          result: this.batchAction,
          comment: this.batchComment.trim() || (this.batchAction === 'approved' ? '批量通过' : '')
        })
        
        if (window.notificationManager) {
          window.notificationManager.success('批量操作成功')
        }
        this.batchVisible = false
        this.selectedRows = []
        this.loadPending()
        this.loadHistory()
      } catch (e) {
        console.error('批量操作失败:', e)
        if (window.notificationManager) {
          window.notificationManager.error('批量操作失败')
        }
      } finally {
        this.actionLoading = false
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
  margin-bottom: 12px;
}
.title { font-weight: 600; }
.loading { padding: 12px; }
.table-wrapper { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.table-wrapper :deep(.el-table) { min-width: 1000px; }
.pagination { margin-top: 12px; display: flex; justify-content: center; }
.subheader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0;
}
</style>
