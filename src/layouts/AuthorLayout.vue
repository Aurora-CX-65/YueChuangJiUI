<template>
  <div class="author-layout">
    <header class="author-header">
      <div class="brand">
        <span class="brand-name">作者中心</span>
        <span class="brand-subtitle">创作与管理</span>
      </div>
      <div class="header-actions">
        <el-button size="small" @click="$router.push('/')">返回首页</el-button>
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="user-dropdown">
            {{ userStore.userNickname }}
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人主页</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>
    <div class="author-body">
      <aside class="author-aside">
        <el-menu :default-active="activePath" router class="author-menu">
          <el-menu-item index="/author/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/author/books">
            <el-icon><Notebook /></el-icon>
            <span>作品管理</span>
          </el-menu-item>
          <el-menu-item index="/author/comments">
            <el-icon><ChatLineSquare /></el-icon>
            <span>评论互动</span>
          </el-menu-item>
          <el-menu-item index="/author/settings">
            <el-icon><Setting /></el-icon>
            <span>创作设置</span>
          </el-menu-item>
        </el-menu>
      </aside>
      <main class="author-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { DataBoard, Notebook, ChatLineSquare, Setting, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user-store.js'

export default {
  name: 'AuthorLayout',
  components: { DataBoard, Notebook, ChatLineSquare, Setting, ArrowDown },
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  computed: {
    activePath() {
      // 匹配子路由，保持高亮
      if (this.$route.path.startsWith('/author/books')) {
        return '/author/books'
      }
      return this.$route.path
    }
  },
  methods: {
    handleCommand(command) {
      if (command === 'logout') {
        this.userStore.logout()
        this.$router.push('/')
      } else if (command === 'profile') {
        this.$router.push('/profile')
      }
    }
  }
}
</script>

<style scoped>
.author-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.author-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  z-index: 10;
}
.brand {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.brand-name {
  font-weight: 600;
  font-size: 20px;
  color: #303133;
}
.brand-subtitle {
  font-size: 14px;
  color: #909399;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #606266;
}
.author-body {
  display: flex;
  flex: 1;
}
.author-aside {
  width: 240px;
  border-right: 1px solid #e6e6e6;
  background: #fff;
  flex-shrink: 0;
}
.author-menu {
  border-right: none;
  height: 100%;
}
.author-main {
  flex: 1;
  padding: 24px;
  background: #f5f7fa;
  overflow-y: auto;
}
@media (max-width: 768px) {
  .author-aside {
    width: 64px; 
  }
  .brand-subtitle {
    display: none;
  }
}
</style>
