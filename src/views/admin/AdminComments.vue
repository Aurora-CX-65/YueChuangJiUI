<template>
  <div class="admin-comments-management">
    <el-card shadow="never">
      <div class="header">
        <div class="title">评论管理</div>
        <div class="controls">
          <el-input v-model="keyword" placeholder="搜索内容" size="small" style="width:180px" clearable @keyup.enter="loadComments" />
          <el-select v-model="status" placeholder="状态" size="small" style="width:120px" clearable @change="loadComments">
            <el-option label="全部" value="" />
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
          <el-button size="small" type="primary" @click="loadComments">搜索</el-button>
          <el-button size="small" @click="reset">重置</el-button>
          <el-button size="small" type="danger" :disabled="!selectedRows.length" @click="openBatchDelete">批量删除</el-button>
        </div>
      </div>

      <div class="content">
        <div v-if="loading" class="loading"><el-skeleton :rows="6" animated /></div>
        <el-empty v-else-if="comments.length === 0" description="暂无评论数据" />
        <div class="table-wrapper" v-else>
          <el-table :data="comments" border size="small" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip />
            <el-table-column prop="username" label="用户" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="160">
              <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-popconfirm title="确定要删除这方评论吗？" @confirm="deleteComment(row)">
                  <template #reference>
                    <el-button size="small" type="danger" link>删除</el-button>
                  </template>
                </el-popconfirm>
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
  </div>
</template>

<script>
import { AdminService } from '@/services/admin-service.js'

export default {
  name: 'AdminComments',
  data() {
    return {
      loading: false,
      comments: [],
      page: 1,
      size: 10,
      total: 0,
      keyword: '',
      status: '',
      selectedRows: [],
      actionLoading: false
    }
  },
  mounted() {
    this.loadComments()
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
      return `${y}-${M}-${D} ${h}:${m}`
    },
    getStatusLabel(status) {
      const map = {
        'pending': '待审核',
        'approved': '已通过',
        'rejected': '已拒绝'
      }
      return map[status] || status
    },
    getStatusType(status) {
      const map = {
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger'
      }
      return map[status] || ''
    },
    async loadComments() {
      this.loading = true
      try {
        const res = await AdminService.getAdminComments(this.page, this.size, this.keyword.trim(), this.status)
        this.comments = res?.records || []
        this.total = res?.total || 0
      } catch (e) {
        console.error('加载评论列表失败:', e)
      } finally {
        this.loading = false
      }
    },
    reset() {
      this.keyword = ''
      this.status = ''
      this.page = 1
      this.loadComments()
    },
    handleSizeChange(s) {
      this.size = s
      this.page = 1
      this.loadComments()
    },
    handlePageChange(p) {
      this.page = p
      this.loadComments()
    },
    async deleteComment(row) {
      try {
        await AdminService.deleteComment(row.id)
        if (window.notificationManager) {
          window.notificationManager.success('删除成功')
        }
        this.loadComments()
      } catch (e) {
        console.error('删除评论失败:', e)
        if (window.notificationManager) {
          window.notificationManager.error('删除失败')
        }
      }
    },
    openBatchDelete() {
      if (!this.selectedRows.length) return
      
      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 条评论吗？此操作不可恢复。`, '批量删除', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.actionLoading = true
        try {
          const ids = this.selectedRows.map(r => r.id)
          await AdminService.batchDeleteComments(ids)
          if (window.notificationManager) {
            window.notificationManager.success('批量删除成功')
          }
          this.selectedRows = []
          this.loadComments()
        } catch (e) {
          console.error('批量删除评论失败:', e)
          if (window.notificationManager) {
            window.notificationManager.error('批量删除失败')
          }
        } finally {
          this.actionLoading = false
        }
      }).catch(() => {})
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
.controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.loading { padding: 24px; }
.pagination { margin-top: 16px; display: flex; justify-content: center; }
.table-wrapper { width: 100%; overflow-x: auto; }
</style>
