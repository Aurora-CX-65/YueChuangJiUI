<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="brand">
        <span class="brand-name">管理后台</span>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="$router.push('/')">返回首页</el-button>
      </div>
    </header>
    <div class="admin-body">
      <aside class="admin-aside">
        <el-menu :default-active="activePath" router class="admin-menu">
          <el-menu-item index="/admin">
            <el-icon><DataAnalysis /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/books">
            <el-icon><Collection /></el-icon>
            <span>书籍管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/comments">
            <el-icon><ChatLineSquare /></el-icon>
            <span>评论管理</span>
          </el-menu-item>
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
import { DataAnalysis, User, Collection, ChatLineSquare, Menu, Tickets, Bell, Setting } from '@element-plus/icons-vue'
export default {
  name: 'AdminLayout',
  components: { DataAnalysis, User, Collection, ChatLineSquare, Menu, Tickets, Bell, Setting },
  computed: {
    activePath() {
      return this.$route.path
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
}
.brand-name {
  font-weight: 600;
  font-size: 18px;
}
.admin-body {
  display: flex;
  flex: 1;
}
.admin-aside {
  width: 220px;
  border-right: 1px solid #ebeef5;
  background: #fff;
}
.admin-menu {
  border-right: none;
}
.admin-main {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
}
@media (max-width: 768px) {
  .admin-aside {
    display: none;
  }
}
</style>
