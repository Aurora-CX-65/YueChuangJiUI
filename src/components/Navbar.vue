<template>
  <header class="navbar">
    <div class="navbar-left">
      <img src="@/assets/logo.svg" alt="Logo" class="logo" />
      <span class="brand-name">阅创集</span>
      <nav class="nav-links">
        <router-link to="/" exact>首页</router-link>
        <router-link to="/books">书库</router-link>
        <router-link to="/ranking">排行</router-link>
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
        
        <!-- 用户下拉菜单 -->
        <div v-if="showDropdown" class="user-dropdown">
          <div class="dropdown-item" @click="goToProfile">
            <el-icon class="icon"><User /></el-icon>
            <span>个人中心</span>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item logout-item" @click="handleLogout">
            <el-icon class="icon"><SwitchButton /></el-icon>
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { useUserStore } from '@/stores/user-store.js'
import { Search, ArrowDown, User, SwitchButton } from '@element-plus/icons-vue'

export default {
  name: 'Navbar',
  components: {
    Search,
    ArrowDown,
    User,
    SwitchButton
  },
  data() {
    return {
      showDropdown: false,
      searchKeyword: ''
    }
  },
  setup() {
    const userStore = useUserStore()
    return {
      userStore
    }
  },
  mounted() {
    // 点击外部关闭下拉菜单
    document.addEventListener('click', this.handleClickOutside)
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
    },
    
    /**
     * 处理点击外部区域
     */
    handleClickOutside(event) {
      if (this.$refs.userInfoRef && !this.$refs.userInfoRef.contains(event.target)) {
        this.showDropdown = false
      }
    },
    
    /**
     * 跳转到个人中心
     */
    goToProfile() {
      this.showDropdown = false
      this.$router.push('/profile')
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

/* 下拉菜单样式 */
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  overflow: hidden;
  z-index: 1001;
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
  
  .user-dropdown {
    right: -10px;
  }
}
</style>