<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="header-left">
        <el-button class="menu-toggle" icon="Fold" @click="toggleSidebar" v-if="isMobile" circle text />
        <div class="brand">
          <span class="brand-name">管理后台</span>
        </div>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="$router.push('/')">返回首页</el-button>
      </div>
    </header>
    <div class="admin-body">
      <aside class="admin-aside" :class="{ 'mobile-hidden': isMobile && !sidebarVisible }">
        <el-menu :default-active="activePath" router class="admin-menu">
          <el-menu-item index="/admin">
            <el-icon><DataAnalysis /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-sub-menu index="users-center">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户中心</span>
            </template>
            <el-menu-item index="/admin/users">用户管理</el-menu-item>
            <el-menu-item index="/admin/author-applications">作者申请</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="books-center">
            <template #title>
              <el-icon><Collection /></el-icon>
              <span>书籍中心</span>
            </template>
            <el-menu-item index="/admin/books">书籍管理</el-menu-item>
            <el-menu-item index="/admin/chapter-management">章节管理</el-menu-item>
            <el-menu-item index="/admin/book-reviews">书籍审核</el-menu-item>
            <el-menu-item index="/admin/chapter-reviews">章节审核</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="comments-center">
            <template #title>
              <el-icon><ChatLineSquare /></el-icon>
              <span>评论中心</span>
            </template>
            <el-menu-item index="/admin/comments">评论管理</el-menu-item>
            <el-menu-item index="/admin/comment-reviews">评论审核</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/admin/categories">
            <el-icon><Menu /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/tags">
            <el-icon><Tickets /></el-icon>
            <span>标签管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/notifications">
            <el-icon><Bell /></el-icon>
            <span>通知管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/logs">
            <el-icon><Document /></el-icon>
            <span>操作日志</span>
          </el-menu-item>
          <el-menu-item index="/admin/settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </aside>
      <main class="admin-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { DataAnalysis, User, Collection, ChatLineSquare, Menu, Tickets, Bell, Setting, Document, Fold } from '@element-plus/icons-vue'

export default {
  name: 'AdminLayout',
  components: { 
    DataAnalysis, User, Collection, ChatLineSquare, Menu, Tickets, Bell, Setting, Document, Fold 
  },
  data() {
    return {
      isMobile: false,
      sidebarVisible: false
    }
  },
  computed: {
    activePath() {
      return this.$route.path
    }
  },
  mounted() {
    this.checkScreen()
    window.addEventListener('resize', this.checkScreen)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkScreen)
  },
  methods: {
    checkScreen() {
      this.isMobile = window.innerWidth <= 768
      if (!this.isMobile) {
        this.sidebarVisible = true
      } else {
        this.sidebarVisible = false
      }
    },
    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.admin-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--primary-gradient);
  color: #fff;
  z-index: 2000;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.menu-toggle {
  color: #fff;
  font-size: 20px;
}
.brand-name {
  font-weight: 600;
  font-size: 18px;
}
.admin-body {
  display: flex;
  flex: 1;
  position: relative;
  overflow: hidden;
}
.admin-aside {
  width: 220px;
  border-right: 1px solid #ebeef5;
  background: #fff;
  transition: transform 0.3s ease;
  z-index: 1000;
}
.admin-menu {
  border-right: none;
}
.admin-main {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
}

/* 全局表格横向滚动修复 */
:deep(.el-table__body-wrapper) {
  overflow-x: auto !important;
}
:deep(.el-table__header-wrapper),
:deep(.el-table__footer-wrapper) {
  overflow-x: hidden !important;
}
:deep(.el-table) {
  width: 100% !important;
  overflow-x: hidden !important;
}
:deep(.el-table__inner-wrapper) {
  width: 100% !important;
  overflow: visible !important;
}

@media (max-width: 768px) {
  .admin-aside {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    height: 100%;
    transform: translateX(0);
    box-shadow: 2px 0 8px rgba(0,0,0,0.15);
    padding-top: 56px; /* Header height */
  }
  .admin-aside.mobile-hidden {
    transform: translateX(-100%);
  }
  .admin-main {
    padding: 10px;
  }
}
</style>
