<template>
  <div class="notifications-view">
    <el-card shadow="never">
      <div class="header">
        <div class="title">通知中心</div>
        <el-space>
          <el-input v-model="keyword" placeholder="搜索标题/内容" size="small" clearable style="width:220px" @keyup.enter="applyFilter" />
          <el-select v-model="type" placeholder="类型" size="small" clearable style="width:140px" @change="applyFilter">
            <el-option label="全部" value="" />
            <el-option label="系统" value="system" />
            <el-option label="评论" value="comment" />
            <el-option label="点赞" value="like" />
            <el-option label="关注" value="follow" />
            <el-option label="警告" value="warning" />
            <el-option label="错误" value="error" />
          </el-select>
          <el-switch v-model="onlyUnread" inline-prompt active-text="仅未读" inactive-text="全部" @change="applyFilter" />
          <el-button size="small" type="primary" @click="markAll">全部标记已读</el-button>
          <el-button size="small" @click="load">刷新</el-button>
        </el-space>
      </div>
      <div class="content">
        <div v-if="loading" class="loading"><el-skeleton :rows="6" animated /></div>
        <el-empty v-else-if="filtered.length === 0" description="暂无通知" />
        <div class="table-wrapper" v-else>
          <el-table :data="filtered" border size="small">
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="typeTag(row.type)">{{ typeLabel(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="标题" width="260">
              <template #default="{ row }">
                <span class="link-like" @click="open(row)">{{ row.title || '通知' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="内容">
              <template #default="{ row }">
                <span class="content-preview">{{ preview(row.content) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="时间" width="180">
              <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">{{ row.isRead ? '已读' : '未读' }}</template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-space wrap>
                  <el-button size="small" @click="open(row)">查看</el-button>
                  <el-button size="small" type="success" :disabled="row.isRead" @click="markRead(row)">标记已读</el-button>
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
      </div>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="dialogItem?.title || '通知详情'" width="600px">
      <div v-if="dialogLoading" class="loading"><el-skeleton :rows="5" animated /></div>
      <div v-else>
        <p style="white-space: pre-wrap">{{ dialogItem?.content || '' }}</p>
        <div style="margin-top:12px;color:#888">时间：{{ formatDateTime(dialogItem?.createdAt) }}</div>
        <div style="margin-top:6px;color:#888">类型：{{ typeLabel(dialogItem?.type) }}</div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" :disabled="dialogItem?.isRead" @click="confirmRead">确认已读</el-button>
      </template>
    </el-dialog>

    <el-divider />
    <el-card shadow="never">
      <div class="subheader">
        <div class="title">通知设置</div>
        <el-space>
          <el-button size="small" type="primary" :loading="settingsSaving" @click="saveSettings" :disabled="!userStore.isLoggedIn">保存设置</el-button>
        </el-space>
      </div>
      <div class="content">
        <div v-if="settingsLoading" class="loading"><el-skeleton :rows="5" animated /></div>
        <el-alert v-else-if="!userStore.isLoggedIn" title="请登录以管理通知设置" type="info" show-icon>
          <template #default>
            <div style="margin-top:6px">
              <router-link to="/auth/login" style="color: var(--accent-color)">去登录</router-link>
            </div>
          </template>
        </el-alert>
        <el-form v-else label-width="140px">
          <el-form-item label="评论通知">
            <el-switch v-model="settingsForm.commentReply" />
          </el-form-item>
          <el-form-item label="审核结果通知">
            <el-switch v-model="settingsForm.auditResult" />
          </el-form-item>
          <el-form-item label="关注通知">
            <el-switch v-model="settingsForm.followUpdate" />
          </el-form-item>
          <el-form-item label="系统通知">
            <el-switch v-model="settingsForm.systemNotice" />
          </el-form-item>
          <el-form-item label="书籍更新通知">
            <el-switch v-model="settingsForm.bookUpdate" />
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import { NotificationService } from '@/services/notification-service.js'
import { useNotificationStore } from '@/stores/notification-store.js'
import { useUserStore } from '@/stores/user-store.js'
export default {
  name: 'NotificationsView',
  data() {
    return {
      loading: false,
      items: [],
      page: 1,
      size: 10,
      total: 0,
      keyword: '',
      type: '',
      onlyUnread: false,
      dialogVisible: false,
      dialogItem: null,
      dialogLoading: false,
      settingsLoading: false,
      settingsSaving: false,
      settingsForm: {
        emailNotification: true,
        browserNotification: true,
        commentNotification: true,
        likeNotification: true,
        followNotification: true,
        systemNotification: true
      }
    }
  },
  setup() {
    const notificationStore = useNotificationStore()
    const userStore = useUserStore()
    return { notificationStore, userStore }
  },
  mounted() {
    this.load()
    if (this.userStore.isLoggedIn) {
      this.loadSettings()
    }
  },
  methods: {
    typeLabel(t) {
      const map = { system: '系统', comment: '评论', like: '点赞', follow: '关注', warning: '警告', error: '错误' }
      return map[t] || '系统'
    },
    typeTag(t) {
      const map = { system: '', comment: 'success', like: 'success', follow: 'success', warning: 'warning', error: 'danger' }
      return map[t] || ''
    },
    preview(text) {
      if (!text) return ''
      const t = String(text)
      return t.length > 120 ? t.slice(0, 120) + '...' : t
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
    async load() {
      this.loading = true
      try {
        const res = await NotificationService.getNotifications(this.page, this.size)
        this.items = res?.records || []
        this.total = res?.total || 0
        await this.notificationStore.fetchUnreadCount()
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
    applyFilter() {
      // 客户端过滤，无需请求
    },
    async markRead(row) {
      try {
        await this.notificationStore.markAsRead(row.id)
        row.isRead = true
      } catch (e) {
        console.error('标记已读失败:', e)
      }
    },
    async markAll() {
      try {
        await this.notificationStore.markAllAsRead()
        this.items.forEach(n => { n.isRead = true })
      } catch (e) {
        console.error('全部标记已读失败:', e)
      }
    },
    async remove(row) {
      try {
        await this.notificationStore.deleteNotification(row.id)
        this.load()
      } catch (e) {
        console.error('删除通知失败:', e)
      }
    },
    async open(row) {
      this.dialogLoading = true
      this.dialogVisible = true
      try {
        let detail = row
        if (!row.content || !row.title) {
          detail = await NotificationService.getNotificationById(row.id)
        }
        this.dialogItem = detail || row
      } finally {
        this.dialogLoading = false
      }
    },
    async confirmRead() {
      if (!this.dialogItem) {
        this.dialogVisible = false
        return
      }
      try {
        await this.notificationStore.markAsRead(this.dialogItem.id)
        this.dialogItem.isRead = true
        const idx = this.items.findIndex(n => n.id === this.dialogItem.id)
        if (idx !== -1) this.items[idx].isRead = true
      } finally {
        this.dialogVisible = false
      }
    },
    async loadSettings() {
      this.settingsLoading = true
      try {
        const settings = await this.notificationStore.fetchNotificationSettings()
        if (settings) {
          // 确保正确处理 null/undefined 值为 true（默认值）或 false
          // 如果后端返回的设置中某项为 null，通常意味着使用默认值（这里假设默认为 true）
          // 但既然是从后端获取的 settings，通常应该有值。
          // 使用 === true 或 !! 来确保布尔转换
          this.settingsForm = {
            followUpdate: settings.followUpdate !== false,
            commentReply: settings.commentReply !== false,
            systemNotice: settings.systemNotice !== false,
            auditResult: settings.auditResult !== false,
            bookUpdate: settings.bookUpdate !== false
          }
        }
      } catch (e) {
        console.error('加载通知设置失败:', e)
      } finally {
        this.settingsLoading = false
      }
    },
    async saveSettings() {
      if (!this.userStore.isLoggedIn) {
        window.notificationManager && window.notificationManager.info('请登录后管理通知设置')
        return
      }
      this.settingsSaving = true
      try {
        // 浏览器通知权限处理
        if (this.settingsForm.browserNotification && 'Notification' in window && Notification.permission === 'default') {
          try { await Notification.requestPermission() } catch {}
        }
        await this.notificationStore.updateNotificationSettings({ ...this.settingsForm })
        window.notificationManager && window.notificationManager.success('通知设置已保存')
      } catch (e) {
        console.error('保存通知设置失败:', e)
      } finally {
        this.settingsSaving = false
      }
    }
  },
  computed: {
    filtered() {
      return this.items.filter(n => {
        if (this.onlyUnread && n.isRead) return false
        if (this.type && n.type !== this.type) return false
        const kw = this.keyword.trim().toLowerCase()
        if (kw) {
          const t = (n.title || '').toLowerCase()
          const c = (n.content || '').toLowerCase()
          if (!t.includes(kw) && !c.includes(kw)) return false
        }
        return true
      })
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
.table-wrapper :deep(.el-table) { min-width: 900px; }
.pagination { margin-top: 12px; display: flex; justify-content: center; }
.link-like { color: var(--accent-color); cursor: pointer; }
.content-preview { color: #666; }
.subheader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0 8px;
}
</style>
