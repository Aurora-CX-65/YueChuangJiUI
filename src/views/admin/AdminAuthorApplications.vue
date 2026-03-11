<template>
  <div class="admin-author-applications">
    <el-card shadow="never">
      <div class="header">
        <div class="title">作者申请审核</div>
        <div class="filter">
          <el-radio-group v-model="filterStatus" @change="handleFilterChange">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="pending">待审核</el-radio-button>
            <el-radio-button label="approved">已通过</el-radio-button>
            <el-radio-button label="rejected">已拒绝</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="content">
        <div v-if="loading" class="loading"><el-skeleton :rows="10" animated /></div>
        <el-empty v-else-if="applications.length === 0" description="暂无申请记录" />
        
        <el-table v-else :data="applications" border stripe style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column label="申请用户" min-width="150">
            <template #default="{ row }">
              <div class="user-info">
                <span class="username">{{ row.username || '未知用户' }}</span>
                <span class="user-id">ID: {{ row.userId }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="penName" label="笔名" min-width="120" />
          <el-table-column prop="description" label="简介" min-width="200" show-overflow-tooltip />
          <el-table-column prop="contactInfo" label="联系方式" min-width="150" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="申请时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="审核信息" min-width="150">
            <template #default="{ row }">
              <div v-if="row.status !== 'pending'">
                <div v-if="row.reviewerName" class="reviewer">审核人: {{ row.reviewerName }}</div>
                <div v-if="row.reviewComment" class="comment">意见: {{ row.reviewComment }}</div>
                <div v-if="row.reviewedAt" class="time">{{ formatDate(row.reviewedAt) }}</div>
              </div>
              <span v-else class="text-gray">-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <div v-if="row.status === 'pending'">
                <el-button size="small" type="success" @click="openReviewDialog(row, 'approve')">通过</el-button>
                <el-button size="small" type="danger" @click="openReviewDialog(row, 'reject')">拒绝</el-button>
              </div>
              <span v-else class="text-gray">已归档</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination" v-if="total > 0">
          <el-pagination
            v-model:current-page="page"
            :page-size="size"
            :total="total"
            layout="total, prev, pager, next"
            background
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 审核对话框 -->
    <el-dialog v-model="dialogVisible" :title="reviewAction === 'approve' ? '通过申请' : '拒绝申请'" width="400px">
      <div class="dialog-content">
        <p v-if="reviewAction === 'approve'">确定要通过用户 <b>{{ currentRow?.penName }}</b> 的作者申请吗？</p>
        <p v-else>确定要拒绝用户 <b>{{ currentRow?.penName }}</b> 的作者申请吗？</p>
        
        <el-form :model="reviewForm" label-position="top">
          <el-form-item label="审核意见">
            <el-input 
              v-model="reviewForm.comment" 
              type="textarea" 
              :rows="3" 
              :placeholder="reviewAction === 'approve' ? '请输入通过理由（可选）' : '请输入拒绝理由（必填）'"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button 
          :type="reviewAction === 'approve' ? 'success' : 'danger'" 
          :loading="submitting" 
          @click="submitReview"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { AdminService } from '@/services/admin-service.js'
import { useUserStore } from '@/stores/user-store.js'

export default {
  name: 'AdminAuthorApplications',
  data() {
    return {
      loading: false,
      applications: [],
      page: 1,
      size: 10,
      total: 0,
      filterStatus: 'pending', // 默认显示待审核
      
      // 审核相关
      dialogVisible: false,
      submitting: false,
      currentRow: null,
      reviewAction: 'approve', // approve or reject
      reviewForm: {
        comment: ''
      }
    }
  },
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  mounted() {
    this.loadApplications()
  },
  methods: {
    // 判断是否为编辑角色（非管理员）
    isEditorOnly() {
      return this.userStore.isEditor && !this.userStore.isAdmin
    },

    async loadApplications() {
      this.loading = true
      try {
        let res
        if (this.isEditorOnly()) {
          res = await AdminService.getEditorAuthorApplications(this.page, this.size, this.filterStatus)
        } else {
          res = await AdminService.getAuthorApplications(this.page, this.size, this.filterStatus)
        }
        this.applications = res?.records || []
        this.total = res?.total || 0
      } catch (e) {
        console.error('加载申请列表失败:', e)
        window.notificationManager.error(e.message || '加载申请列表失败')
      } finally {
        this.loading = false
      }
    },
    handlePageChange(p) {
      this.page = p
      this.loadApplications()
    },
    handleFilterChange() {
      this.page = 1
      this.loadApplications()
    },
    getStatusType(status) {
      const map = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
      }
      return map[status] || 'info'
    },
    getStatusText(status) {
      const map = {
        pending: '待审核',
        approved: '已通过',
        rejected: '已拒绝'
      }
      return map[status] || status
    },
    formatDate(dateStr) {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleString()
    },
    openReviewDialog(row, action) {
      this.currentRow = row
      this.reviewAction = action
      this.reviewForm.comment = ''
      this.dialogVisible = true
    },
    async submitReview() {
      if (this.reviewAction === 'reject' && !this.reviewForm.comment) {
        window.notificationManager.warning('拒绝申请必须填写理由')
        return
      }
      
      this.submitting = true
      try {
        if (this.reviewAction === 'approve') {
          if (this.isEditorOnly()) {
            await AdminService.approveEditorAuthorApplication(this.currentRow.id, this.reviewForm.comment)
          } else {
            await AdminService.approveAuthorApplication(this.currentRow.id, this.reviewForm.comment)
          }
          window.notificationManager.success('已批准申请')
        } else {
          if (this.isEditorOnly()) {
            await AdminService.rejectEditorAuthorApplication(this.currentRow.id, this.reviewForm.comment)
          } else {
            await AdminService.rejectAuthorApplication(this.currentRow.id, this.reviewForm.comment)
          }
          window.notificationManager.success('已拒绝申请')
        }
        this.dialogVisible = false
        this.loadApplications()
      } catch (e) {
        console.error('审核操作失败:', e)
        window.notificationManager.error(e.message || '操作失败')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.admin-author-applications {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title {
  font-size: 18px;
  font-weight: bold;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.user-info {
  display: flex;
  flex-direction: column;
}
.username {
  font-weight: 500;
}
.user-id {
  font-size: 12px;
  color: #909399;
}
.reviewer, .comment, .time {
  font-size: 12px;
  line-height: 1.4;
}
.text-gray {
  color: #909399;
}
</style>