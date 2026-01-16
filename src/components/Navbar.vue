<template>
  <header class="navbar">
    <div class="navbar-left">
      <img src="@/assets/logo.svg" alt="Logo" class="logo" />
      <span class="brand-name">阅创集</span>
      <nav class="nav-links">
        <router-link to="/" exact>首页</router-link>
        <router-link to="/books">书库</router-link>
        <router-link to="/ranking">排行</router-link>
        <a href="javascript:void(0)" @click="handleAuthorCenter" :class="{ 'router-link-active': $route.path.includes('/author') }">作者中心</a>
      </nav>
    </div>
    <div class="navbar-right">
      <div class="search-bar">
        <input 
          type="text" 
          placeholder="搜索..." 
          v-model="searchKeyword"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch">
          <el-icon><Search /></el-icon>
        </button>
      </div>
      <div class="notif-button" @click="toggleNotifDropdown" ref="notifRef" title="通知">
        <el-icon><Bell /></el-icon>
        <span v-if="notificationStore.unreadCount > 0" class="notif-badge">{{ notificationStore.unreadCount }}</span>
      </div>
      
      <!-- 未登录状态：显示登录按钮 -->
      <div v-if="!userStore.isLoggedIn" class="auth-buttons">
        <router-link to="/auth/login" class="auth-link">登录</router-link>
      </div>
      
      <!-- 已登录状态：显示用户信息 -->
      <div v-else class="user-info" @click="toggleDropdown" ref="userInfoRef">
        <img :src="userStore.userAvatar" :alt="userStore.userNickname" class="user-avatar" />
        <span class="user-name">{{ userStore.userNickname }}</span>
        <el-icon class="dropdown-icon" :class="{ 'rotated': showDropdown }">
          <ArrowDown />
        </el-icon>
      </div>
    </div>
    
    <!-- 使用Teleport将用户下拉菜单渲染到body根节点 -->
    <Teleport to="body">
      <div v-if="showDropdown" class="user-dropdown-portal" :style="dropdownStyle" @click.stop>
        <div class="dropdown-item" @click="goToProfile">
          <el-icon class="icon"><User /></el-icon>
          <span>个人中心</span>
        </div>
        <div class="dropdown-item" v-if="userStore.isAdmin" @click="goToAdmin">
          <el-icon class="icon"><Setting /></el-icon>
          <span>管理后台</span>
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item logout-item" @click="handleLogout">
          <el-icon class="icon"><SwitchButton /></el-icon>
          <span>退出登录</span>
        </div>
      </div>
    </Teleport>
    <Teleport to="body">
      <div v-if="showNotifDropdown" class="user-dropdown-portal" :style="notifDropdownStyle" @click.stop>
        <div class="dropdown-item" @click="goToNotifications">
          <el-icon class="icon"><Bell /></el-icon>
          <span>查看全部通知</span>
        </div>
        <div class="dropdown-divider"></div>
        <div v-for="n in (notificationStore.notifications.items.slice(0,5))" :key="n.id" class="dropdown-item" @click="openNotification(n)">
          <span>{{ n.title || '通知' }}</span>
        </div>
      </div>
    </Teleport>
    <el-dialog v-model="notifDialogVisible" :title="notifDialogItem?.title || '通知'" width="560px">
      <div v-if="notifDialogLoading" class="loading"><el-skeleton :rows="4" animated /></div>
      <div v-else>
        <p style="white-space: pre-wrap">{{ notifDialogItem?.content || '' }}</p>
        <div style="margin-top:12px;color:#888">时间：{{ formatDateTime(notifDialogItem?.createdAt) }}</div>
      </div>
      <template #footer>
        <el-button @click="notifDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="confirmNotificationRead">确认已读</el-button>
      </template>
    </el-dialog>
    
    <!-- 点击遮罩层关闭下拉菜单 -->
    <Teleport to="body">
      <div v-if="showDropdown" class="dropdown-overlay" @click="closeDropdown"></div>
    </Teleport>
  </header>
</template>

<script>
import { useUserStore } from '@/stores/user-store.js'
import { useNotificationStore } from '@/stores/notification-store.js'
import { NotificationService } from '@/services/notification-service.js'
import { Search, ArrowDown, User, SwitchButton, Setting, Bell } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'Navbar',
  components: {
    Search,
    ArrowDown,
    User,
    SwitchButton,
    Setting,
    Bell
  },
  data() {
    return {
      showDropdown: false,
      showNotifDropdown: false,
      searchKeyword: '',
      dropdownStyle: {},
      notifDropdownStyle: {}
      ,
      notifDialogVisible: false,
      notifDialogItem: null,
      notifDialogLoading: false
    }
  },
  computed: {
    /**
     * 计算下拉菜单的位置样式
     */
    dropdownPosition() {
      if (!this.$refs.userInfoRef) return {}
      
      const rect = this.$refs.userInfoRef.getBoundingClientRect()
      return {
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        right: `${window.innerWidth - rect.right}px`,
        zIndex: 999999
      }
    }
  },
  setup() {
    const userStore = useUserStore()
    const notificationStore = useNotificationStore()
    return {
      userStore,
      notificationStore
    }
  },
  mounted() {
    // 点击外部关闭下拉菜单
    document.addEventListener('click', this.handleClickOutside)
    this.notificationStore.fetchUnreadCount()
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    /**
     * 切换下拉菜单显示状态
     */
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
      if (this.showDropdown) {
        this.$nextTick(() => {
          this.updateDropdownPosition()
        })
      }
    },
    
    /**
     * 更新下拉菜单位置
     */
    updateDropdownPosition() {
      if (!this.$refs.userInfoRef) return
      
      const rect = this.$refs.userInfoRef.getBoundingClientRect()
      this.dropdownStyle = {
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        right: `${window.innerWidth - rect.right}px`,
        zIndex: 999999
      }
    },
    updateNotifDropdownPosition() {
      if (!this.$refs.notifRef) return
      const rect = this.$refs.notifRef.getBoundingClientRect()
      this.notifDropdownStyle = {
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        right: `${window.innerWidth - rect.right}px`,
        zIndex: 999999
      }
    },
    
    /**
     * 关闭下拉菜单
     */
    closeDropdown() {
      this.showDropdown = false
    },
    
    /**
     * 处理点击外部区域
     */
    handleClickOutside(event) {
      if (this.$refs.userInfoRef && !this.$refs.userInfoRef.contains(event.target)) {
        this.showDropdown = false
      }
      if (this.$refs.notifRef && !this.$refs.notifRef.contains(event.target)) {
        this.showNotifDropdown = false
      }
    },
    
    /**
     * 跳转到个人中心
     */
    goToProfile() {
      this.showDropdown = false
      this.$router.push('/profile')
    },
    goToAdmin() {
      this.showDropdown = false
      this.$router.push('/admin')
    },
    
    /**
     * 处理退出登录
     */
    async handleLogout() {
      this.showDropdown = false
      try {
        await this.userStore.logout()
        // 跳转到首页
        this.$router.push('/')
      } catch (error) {
        console.error('退出登录失败:', error)
      }
    },
    
    /**
     * 处理搜索
     */
    handleSearch() {
      const keyword = this.searchKeyword.trim()
      if (!keyword) {
        return
      }
      
      // 跳转到书库页面并传递搜索关键词
      this.$router.push({
        path: '/books',
        query: { keyword }
      })
      
      // 清空搜索框
      this.searchKeyword = ''
    },
    toggleNotifDropdown() {
      this.showNotifDropdown = !this.showNotifDropdown
      if (this.showNotifDropdown) {
        this.$nextTick(() => {
          this.updateNotifDropdownPosition()
        })
        // 预加载最近通知
        this.notificationStore.fetchNotifications(1, 5)
      }
    },
    goToNotifications() {
      this.showNotifDropdown = false
      if (this.userStore.isAdmin) {
        this.$router.push('/admin/notifications')
      } else {
        this.$router.push('/notifications')
      }
    },
    async openNotification(n) {
      this.showNotifDropdown = false
      this.notifDialogLoading = true
      this.notifDialogVisible = true
      try {
        let item = n
        if (!item.content || !item.title) {
          const detail = await NotificationService.getNotificationById(n.id)
          item = detail || n
        }
        this.notifDialogItem = item
      } finally {
        this.notifDialogLoading = false
      }
    },
    async confirmNotificationRead() {
      if (!this.notifDialogItem) {
        this.notifDialogVisible = false
        return
      }
      try {
        await this.notificationStore.markAsRead(this.notifDialogItem.id)
      } finally {
        this.notifDialogVisible = false
      }
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
    handleAuthorCenter() {
      if (!this.userStore.isLoggedIn) {
        ElMessage.warning('请先登录')
        this.$router.push('/auth/login')
        return
      }

      // 如果是作者，跳转到作者中心
      if (this.userStore.isAuthor) {
        this.$router.push('/author')
      } else {
        // 如果是读者，提示申请成为作者
        ElMessageBox.confirm(
          '您还不是作者，是否申请成为作者？',
          '成为作者',
          {
            confirmButtonText: '去申请',
            cancelButtonText: '取消',
            type: 'info'
          }
        ).then(() => {
          this.$router.push('/author/apply')
        }).catch(() => {})
      }
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--header-height);
  padding: 0 20px;
  background: var(--primary-gradient);
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navbar-left, .navbar-right, .nav-links, .auth-buttons {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  margin-right: 10px;
}

.brand-name {
  font-size: 20px;
  font-weight: bold;
  margin-right: 20px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  margin: 0 10px;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-links a:hover {
  color: var(--accent-color);
  background-color: rgba(255, 255, 255, 0.1);
}

/* 活跃状态样式 - 使用精确匹配 */
.nav-links a.router-link-exact-active {
  color: var(--accent-color);
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

/* 活跃状态下的底部指示器 */
.nav-links a.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background-color: var(--accent-color);
  border-radius: 1px;
}

.search-bar {
  display: flex;
  margin-right: 15px;
}

.search-bar input {
  border: none;
  padding: 5px;
  border-radius: 3px 0 0 3px;
}

.search-bar button {
  border: none;
  padding: 8px 12px;
  background-color: var(--accent-color);
  color: white;
  border-radius: 0 3px 3px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-bar button:hover {
  background-color: var(--accent-color-dark, #409eff);
}

.notif-button {
  position: relative;
  margin-right: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
}
.notif-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
.notif-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background-color: #ff4d4f;
  color: white;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
}

/* 认证按钮样式 */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.auth-link {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.auth-link:hover {
  color: var(--accent-color);
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
  position: relative;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  margin-right: 6px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

/* Portal下拉菜单样式 - 渲染到body根节点 */
.user-dropdown-portal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  min-width: 160px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  animation: dropdownFadeIn 0.2s ease-out;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 遮罩层样式 */
.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999998;
  background: transparent;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item .icon {
  margin-right: 8px;
  font-size: 16px;
  display: flex;
  align-items: center;
  color: #666;
}

.logout-item .icon {
  color: #d32f2f;
}

.dropdown-item span {
  font-size: 14px;
}

.logout-item:hover {
  background-color: #fee;
  color: #d32f2f;
}

.dropdown-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 4px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar {
    padding: 0 15px;
  }
  
  .brand-name {
    font-size: 18px;
  }
  
  .user-name {
    max-width: 80px;
  }
  
  .user-dropdown-portal {
    min-width: 140px;
  }
}
</style>
