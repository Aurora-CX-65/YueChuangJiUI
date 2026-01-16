<template>
  <div class="admin-operation-logs">
    <el-card shadow="never">
      <div class="header">
        <div class="title">操作日志</div>
        <div class="controls">
          <el-input 
            v-model="username" 
            placeholder="搜索用户名" 
            size="small" 
            style="width: 180px" 
            clearable
            @keyup.enter="loadLogs"
          />
          <el-input 
            v-model="operation" 
            placeholder="搜索操作类型" 
            size="small" 
            style="width: 180px" 
            clearable
            @keyup.enter="loadLogs"
          />
          <el-button size="small" type="primary" @click="loadLogs">搜索</el-button>
          <el-button size="small" @click="reset">重置</el-button>
        </div>
      </div>

      <div class="content">
        <div v-if="loading" class="loading"><el-skeleton :rows="6" animated /></div>
        <el-empty v-else-if="logs.length === 0" description="暂无操作日志" />
        <div class="table-wrapper" v-else>
          <el-table :data="logs" border size="small" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="username" label="操作人" width="120" />
            <el-table-column prop="operation" label="操作类型" width="180" show-overflow-tooltip />
            <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
            <el-table-column prop="targetType" label="目标类型" width="100" />
            <el-table-column prop="targetId" label="目标ID" width="100" />
            <el-table-column label="结果" width="100">
              <template #default="{ row }">
                <el-tag :type="row.result === 'success' ? 'success' : 'danger'" size="small">
                  {{ row.result === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="ipAddress" label="IP地址" width="140" />
            <el-table-column label="操作时间" width="170">
              <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination" v-if="total > 0">
          <el-pagination
            v-model:current-page="page"
            :page-size="size"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 20, 50, 100]"
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
import { AdminSystemService } from '@/services/admin/admin-system-service.js'

export default {
  name: 'AdminOperationLogs',
  data() {
    return {
      loading: false,
      logs: [],
      page: 1,
      size: 20,
      total: 0,
      username: '',
      operation: ''
    }
  },
  mounted() {
    this.loadLogs()
  },
  methods: {
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
    async loadLogs() {
      this.loading = true
      try {
        const res = await AdminSystemService.getOperationLogs({
          page: this.page,
          size: this.size,
          username: this.username.trim(),
          operation: this.operation.trim()
        })
        this.logs = res?.records || []
        this.total = res?.total || 0
      } catch (e) {
        console.error('加载操作日志失败:', e)
        if (window.notificationManager) {
          window.notificationManager.error('加载操作日志失败')
        }
      } finally {
        this.loading = false
      }
    },
    reset() {
      this.username = ''
      this.operation = ''
      this.page = 1
      this.loadLogs()
    },
    handleSizeChange(s) {
      this.size = s
      this.page = 1
      this.loadLogs()
    },
    handlePageChange(p) {
      this.page = p
      this.loadLogs()
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
