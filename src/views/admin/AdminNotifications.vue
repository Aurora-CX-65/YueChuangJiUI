<template>
  <div class="admin-notifications">
    <el-card shadow="never">
      <div class="header">
        <div class="title">通知管理</div>
        <el-space>
          <el-button size="small" type="primary" @click="openCreate">创建系统通知</el-button>
        </el-space>
      </div>
      <div class="content">
        <div v-if="loading" class="loading"><el-skeleton :rows="6" animated /></div>
        <el-empty v-else-if="items.length === 0" description="暂无通知" />
        <el-table v-else :data="items" border size="small">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="标题" width="220" />
          <el-table-column prop="content" label="内容" />
          <el-table-column prop="createdAt" label="时间" width="180">
            <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-space wrap>
                <el-button size="small" type="danger" @click="remove(row)">删除</el-button>
              </el-space>
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
    </el-card>

    <el-dialog v-model="dialogVisible" title="创建系统通知" width="600px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="标题">
          <el-input v-model="form.title" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="6" maxlength="1000" show-word-limit />
        </el-form-item>
        <el-form-item label="目标用户ID">
          <el-input v-model="form.targetUserIdsText" placeholder="用逗号分隔，留空为全部用户" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { AdminService } from '@/services/admin-service.js'
import { NotificationService } from '@/services/notification-service.js'
export default {
  name: 'AdminNotifications',
  data() {
    return {
      loading: false,
      items: [],
      page: 1,
      size: 10,
      total: 0,
      dialogVisible: false,
      saving: false,
      form: { title: '', content: '', targetUserIdsText: '' }
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        // 使用新的管理员接口获取所有通知
        const res = await AdminService.getAdminNotifications(this.page, this.size)
        this.items = res?.records || []
        this.total = res?.total || 0
      } catch (e) {
        console.error('加载通知失败:', e)
      } finally {
        this.loading = false
      }
    },
    handlePageChange(p) {
      this.page = p
      this.load()
    },
    formatDateTime(val) {
      return AdminService.formatDateTime(val)
    },
    openCreate() {
      this.form = { title: '', content: '', targetUserIdsText: '' }
      this.dialogVisible = true
    },
    async submit() {
      if (!this.form.title?.trim() || !this.form.content?.trim()) {
        window.notificationManager.error('请填写标题与内容')
        return
      }
      this.saving = true
      try {
        const ids = (this.form.targetUserIdsText || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .map(s => Number(s))
          .filter(n => Number.isFinite(n))
        await NotificationService.createSystemNotification({
          title: this.form.title.trim(),
          content: this.form.content.trim(),
          targetUserIds: ids.length ? ids : null,
          type: 'system'
        })
        window.notificationManager.success('系统通知已创建')
        this.dialogVisible = false
        this.load()
      } catch (e) {
        console.error('创建系统通知失败:', e)
        window.notificationManager.error(e.message || '创建系统通知失败')
      } finally {
        this.saving = false
      }
    },
    async remove(row) {
      try {
        await NotificationService.deleteNotification(row.id)
        window.notificationManager.success('删除通知成功')
        this.load()
      } catch (e) {
        console.error('删除通知失败:', e)
        window.notificationManager.error(e.message || '删除通知失败')
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
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
