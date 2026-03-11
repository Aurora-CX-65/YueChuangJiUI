<template>
  <div class="author-layout">
    <Navbar />
    <div class="author-body">
      <aside class="author-aside">
        <div class="mode-switch" v-if="userStore.isEditor">
          <el-radio-group v-model="viewMode" size="small" @change="handleModeChange">
            <el-radio-button label="editor">审核</el-radio-button>
            <el-radio-button label="author">创作</el-radio-button>
          </el-radio-group>
        </div>
        <el-menu :default-active="activePath" router class="author-menu">
          <!-- 编辑角色菜单 -->
          <template v-if="viewMode === 'editor'">
            <el-menu-item index="/author/review-dashboard">
              <el-icon><DataAnalysis /></el-icon>
              <span>仪表盘</span>
            </el-menu-item>
            <el-menu-item index="/author/book-reviews">
              <el-icon><Reading /></el-icon>
              <span>书籍审核</span>
            </el-menu-item>
            <el-menu-item index="/author/chapter-reviews">
              <el-icon><DocumentChecked /></el-icon>
              <span>章节审核</span>
            </el-menu-item>
            <el-menu-item index="/author/comment-reviews">
              <el-icon><ChatDotSquare /></el-icon>
              <span>评论审核</span>
            </el-menu-item>
            <el-menu-item index="/author/author-applications">
              <el-icon><User /></el-icon>
              <span>作者申请</span>
            </el-menu-item>
          </template>

          <!-- 作者角色菜单 -->
          <template v-else>
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
          </template>
        </el-menu>
      </aside>
      <main class="author-main">
        <router-view />
      </main>
    </div>
    <Footer />
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { DataAnalysis, Notebook, ChatLineSquare, Setting, Reading, DocumentChecked, ChatDotSquare, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user-store.js'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'AuthorLayout',
  components: { DataAnalysis, Notebook, ChatLineSquare, Setting, Reading, DocumentChecked, ChatDotSquare, User, Navbar, Footer },
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const route = useRoute()
    
    // 默认视图模式：如果是编辑，默认为审核模式；否则为创作模式
    // 如果当前路由已经是创作相关的（如 /author/books），则初始化为 author 模式
    const isAuthorRoute = route.path.startsWith('/author/books') || 
                          route.path.startsWith('/author/comments') || 
                          route.path.startsWith('/author/settings') ||
                          route.path === '/author/dashboard'
                          
    const viewMode = ref((userStore.isEditor && !isAuthorRoute) ? 'editor' : 'author')

    // 监听路由变化，自动更新 viewMode（防止用户直接输入 URL 导致模式不匹配）
    watch(() => route.path, (path) => {
      if (userStore.isEditor) {
        if (path.startsWith('/author/review-dashboard') || 
            path.startsWith('/author/book-reviews') || 
            path.startsWith('/author/chapter-reviews') || 
            path.startsWith('/author/comment-reviews') || 
            path.startsWith('/author/author-applications')) {
          viewMode.value = 'editor'
        } else if (path.startsWith('/author/books') || 
                   path.startsWith('/author/comments') || 
                   path.startsWith('/author/settings') || 
                   path === '/author/dashboard') {
          viewMode.value = 'author'
        }
      }
    })

    const handleModeChange = (mode) => {
      if (mode === 'editor') {
        router.push('/author/review-dashboard')
      } else {
        router.push('/author/dashboard')
      }
    }

    return { userStore, viewMode, handleModeChange }
  },
  computed: {
    activePath() {
      // 匹配子路由，保持高亮
      if (this.$route.path.startsWith('/author/books')) {
        return '/author/books'
      }
      return this.$route.path
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
.author-body {
  display: flex;
  flex: 1;
  padding-top: var(--header-height); /* 适配固定导航栏 */
}
.author-aside {
  width: 240px;
  border-right: 1px solid #e6e6e6;
  background: #fff;
  flex-shrink: 0;
  height: calc(100vh - var(--header-height));
  position: sticky;
  top: var(--header-height);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.mode-switch {
  padding: 16px;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #f0f0f0;
}
.author-menu {
  border-right: none;
  min-height: 100%;
}
.author-main {
  flex: 1;
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - var(--header-height));
}
@media (max-width: 768px) {
  .author-aside {
    width: 64px; 
  }
  .mode-switch {
    padding: 8px 4px;
  }
  .mode-switch :deep(.el-radio-button__inner) {
    padding: 8px;
    font-size: 12px;
  }
  .author-menu :deep(.el-menu-item span) {
    display: none;
  }
}
</style>
