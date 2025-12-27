<template>
  <div class="admin-users">
    <el-card shadow="never">
      <div class="header">
        <div class="title">用户管理</div>
        <div class="controls">
          <el-input v-model="keyword" placeholder="搜索用户名/邮箱" size="small" style="max-width:240px" @keyup.enter="loadUsers" />
          <el-select v-model="role" placeholder="角色" size="small" style="width:140px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="读者" value="reader" />
            <el-option label="作者" value="author" />
            <el-option label="编辑" value="editor" />
            <el-option label="管理员" value="admin" />
          </el-select>
          <el-select v-model="status" placeholder="状态" size="small" style="width:140px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="正常" value="active" />
            <el-option label="临时封禁" value="suspended" />
            <el-option label="永久封禁" value="banned" />
          </el-select>
          <el-button size="small" type="primary" @click="loadUsers">搜索</el-button>
          <el-button size="small" @click="reset">重置</el-button>
          <el-dropdown :disabled="!selectedRows.length" @command="handleBatchCommand">
            <el-button size="small" type="warning">
              批量操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="suspend">批量临时封禁</el-dropdown-item>
                <el-dropdown-item command="ban">批量永久封禁</el-dropdown-item>
                <el-dropdown-item command="unban">批量解除封禁</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="content">
        <div v-if="loading" class="loading"><el-skeleton :rows="6" animated /></div>
        <el-empty v-else-if="users.length === 0" description="暂无用户数据" />
        <div class="table-wrapper" v-else>
        <el-table :data="users" border size="small" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" width="160" />
          <el-table-column prop="nickname" label="昵称" width="160" />
          <el-table-column prop="email" label="邮箱" width="220" />
          <el-table-column label="角色" width="120">
            <template #default="{ row }">{{ roleLabel(row.role) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="{ row }">{{ statusLabel(row.status) }}</template>
          </el-table-column>
          <el-table-column label="创建时间" width="180">
            <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="420" fixed="right">
            <template #default="{ row }">
              <el-space wrap>
                <el-select v-model="row._role" size="small" style="width:140px">
                  <el-option label="读者" value="reader" />
                  <el-option label="作者" value="author" />
                  <el-option label="编辑" value="editor" />
                  <el-option label="管理员" value="admin" />
                </el-select>
                <el-button size="small" @click="changeRole(row)">更新角色</el-button>
                <el-button size="small" type="warning" @click="resetPassword(row)">重置密码</el-button>
                <el-dropdown>
                  <el-button size="small">
                    封禁操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="openSuspend(row)">临时封禁</el-dropdown-item>
                      <el-dropdown-item @click="openBan(row)">永久封禁</el-dropdown-item>
                      <el-dropdown-item @click="unban(row)">解除封禁</el-dropdown-item>
                      <el-dropdown-item @click="openBanLogs(row)">封禁历史</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-space>
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

    <el-dialog v-model="suspendVisible" title="临时封禁" width="520px">
      <el-form :model="suspendForm" label-width="80px">
        <el-form-item label="原因">
          <el-input v-model="suspendForm.reason" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="到期时间">
          <el-date-picker v-model="suspendForm.until" type="datetime" placeholder="选择到期时间" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="suspendVisible = false">取消</el-button>
        <el-button type="primary" :loading="actionLoading" @click="confirmSuspend">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="banVisible" title="永久封禁" width="520px">
      <el-form :model="banForm" label-width="80px">
        <el-form-item label="原因">
          <el-input v-model="banForm.reason" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="banVisible = false">取消</el-button>
        <el-button type="danger" :loading="actionLoading" @click="confirmBan">封禁</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="banLogsVisible" title="封禁历史" width="680px">
      <div v-if="logsLoading" class="loading"><el-skeleton :rows="6" animated /></div>
      <el-empty v-else-if="banLogs.length === 0" description="暂无封禁记录" />
      <el-table v-else :data="banLogs" size="small" border>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">{{ actionLabel(row.action) }}</template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" />
        <el-table-column prop="adminUsername" label="管理员" width="140" />
        <el-table-column label="时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog v-model="batchVisible" :title="batchAction === 'suspend' ? '批量临时封禁' : '批量永久封禁'" width="520px">
      <el-form :model="batchForm" label-width="80px">
        <el-form-item label="原因" required>
          <el-input v-model="batchForm.reason" maxlength="200" show-word-limit placeholder="请输入统一的封禁原因" />
        </el-form-item>
        <el-form-item label="到期时间" v-if="batchAction === 'suspend'" required>
          <el-date-picker v-model="batchForm.until" type="datetime" placeholder="选择到期时间" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchVisible = false">取消</el-button>
        <el-button :type="batchAction === 'suspend' ? 'primary' : 'danger'" :loading="actionLoading" @click="confirmBatch">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { AdminService } from '@/services/admin-service.js'
import { ArrowDown } from '@element-plus/icons-vue'
import { roleLabel, statusLabel } from '@/utils/enums.js'

export default {
  name: 'AdminUsers',
  components: { ArrowDown },
  data() {
    return {
      loading: false,
      users: [],
      page: 1,
      size: 10,
      total: 0,
      keyword: '',
      role: '',
      status: '',
      suspendVisible: false,
      banVisible: false,
      banLogsVisible: false,
      actionUser: null,
      actionLoading: false,
      suspendForm: { reason: '', until: '' },
      banForm: { reason: '' },
      banLogs: [],
      logsLoading: false,
      selectedRows: [],
      batchAction: null,
      batchVisible: false,
      batchForm: { reason: '', until: '' }
    }
  },
  computed: {
    roleLabel() { return roleLabel },
    statusLabel() { return statusLabel }
  },
  mounted() {
    this.loadUsers()
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
    actionLabel(v) {
      if (v === 'ban') return '永久封禁'
      if (v === 'unban') return '解除封禁'
      if (v === 'suspend') return '临时封禁'
      return v
    },
    async loadUsers() {
      this.loading = true
      try {
        const res = await AdminService.getUsers({
          page: this.page,
          size: this.size,
          keyword: this.keyword.trim(),
          role: this.role,
          status: this.status
        })
        const records = res?.records || []
        // 为每行加一个可编辑角色字段
        this.users = records.map(r => ({ ...r, _role: r.role }))
        this.total = res?.total || 0
      } catch (e) {
        console.error('加载用户列表失败:', e)
      } finally {
        this.loading = false
      }
    },
    handleFilter() {
      this.page = 1
      this.loadUsers()
    },
    reset() {
      this.keyword = ''
      this.role = ''
      this.status = ''
      this.page = 1
      this.loadUsers()
    },
    handleSizeChange(s) {
      this.size = s
      this.page = 1
      this.loadUsers()
    },
    handlePageChange(p) {
      this.page = p
      this.loadUsers()
    },
    async changeRole(row) {
      if (!row || !row._role) return
      this.actionLoading = true
      try {
        await AdminService.updateUserRole(row.id, row._role)
        row.role = row._role
      } catch (e) {
        console.error('更新用户角色失败:', e)
      } finally {
        this.actionLoading = false
      }
    },
    async resetPassword(row) {
      if (!row) return
      this.actionLoading = true
      try {
        const newPwd = await AdminService.resetUserPassword(row.id)
        window.notificationManager && window.notificationManager.info(`新密码：${newPwd}`)
      } catch (e) {
        console.error('重置密码失败:', e)
      } finally {
        this.actionLoading = false
      }
    },
    openSuspend(row) {
      this.actionUser = row
      this.suspendForm = { reason: '', until: '' }
      this.suspendVisible = true
    },
    async confirmSuspend() {
      if (!this.actionUser) return
      const reason = (this.suspendForm.reason || '').trim()
      if (!reason) {
        window.notificationManager && window.notificationManager.error('请填写封禁原因')
        return
      }
      if (!this.suspendForm.until) {
        window.notificationManager && window.notificationManager.error('请选择到期时间')
        return
      }
      this.actionLoading = true
      try {
        await AdminService.suspendUser(this.actionUser.id, this.suspendForm.until, reason)
        this.suspendVisible = false
        this.loadUsers()
      } catch (e) {
        console.error('临时封禁失败:', e)
      } finally {
        this.actionLoading = false
      }
    },
    openBan(row) {
      this.actionUser = row
      this.banForm = { reason: '' }
      this.banVisible = true
    },
    async confirmBan() {
      if (!this.actionUser) return
      this.actionLoading = true
      try {
        await AdminService.banUser(this.actionUser.id, this.banForm.reason)
        this.banVisible = false
        this.loadUsers()
      } catch (e) {
        console.error('永久封禁失败:', e)
      } finally {
        this.actionLoading = false
      }
    },
    async unban(row) {
      if (!row) return
      this.actionLoading = true
      try {
        await AdminService.unbanUser(row.id)
        this.loadUsers()
      } catch (e) {
        console.error('解除封禁失败:', e)
      } finally {
        this.actionLoading = false
      }
    },
    openBanLogs(row) {
      this.actionUser = row
      this.banLogsVisible = true
      this.fetchBanLogs()
    },
    async fetchBanLogs() {
      if (!this.actionUser) return
      this.logsLoading = true
      try {
        this.banLogs = await AdminService.getUserBanLogs(this.actionUser.id) || []
      } catch (e) {
        console.error('获取封禁历史失败:', e)
      } finally {
        this.logsLoading = false
      }
    },
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    handleBatchCommand(command) {
      if (!this.selectedRows.length) return
      this.batchAction = command
      this.batchForm = { reason: '', until: '' }
      
      if (command === 'unban') {
        this.$confirm(`确定要解除选中的 ${this.selectedRows.length} 个用户的封禁吗？`, '批量解封', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => this.confirmBatch()).catch(() => {})
      } else {
        this.batchVisible = true
      }
    },
    async confirmBatch() {
      if (this.batchAction !== 'unban') {
        if (!this.batchForm.reason.trim()) {
          window.notificationManager && window.notificationManager.error('请填写原因')
          return
        }
        if (this.batchAction === 'suspend' && !this.batchForm.until) {
          window.notificationManager && window.notificationManager.error('请选择到期时间')
          return
        }
      }
      
      this.actionLoading = true
      try {
        const ids = this.selectedRows.map(r => r.id)
        let successCount = 0
        
        // 由于没有后端批量接口，这里使用循环调用（前端模拟批量）
        // 实际生产环境建议增加后端批量接口
        for (const id of ids) {
          try {
            if (this.batchAction === 'suspend') {
              await AdminService.suspendUser(id, this.batchForm.until, this.batchForm.reason)
            } else if (this.batchAction === 'ban') {
              await AdminService.banUser(id, this.batchForm.reason)
            } else if (this.batchAction === 'unban') {
              await AdminService.unbanUser(id)
            }
            successCount++
          } catch (e) {
            console.error(`用户 ${id} 操作失败:`, e)
          }
        }
        
        if (window.notificationManager) {
          window.notificationManager.success(`批量操作完成，成功 ${successCount}/${ids.length}`)
        }
        this.batchVisible = false
        this.selectedRows = []
        this.loadUsers()
      } catch (e) {
        console.error('批量操作异常:', e)
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
.controls { display: flex; gap: 8px; align-items: center; }
.loading { padding: 12px; }
.pagination { margin-top: 12px; display: flex; justify-content: center; }
.table-wrapper { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
.table-wrapper :deep(.el-table) { min-width: 1200px; }
@media (max-width: 768px) {
  .table-wrapper :deep(.el-table) { min-width: 900px; }
}
</style>
