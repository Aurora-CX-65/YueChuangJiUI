<template>
  <div class="user-profile-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 用户信息内容 -->
    <div v-else-if="user" class="profile-content">
      <!-- 顶部个人信息卡片 -->
      <el-card class="profile-header-card" shadow="hover">
        <div class="profile-header">
          <div class="avatar-section">
            <el-avatar :src="user.avatar" :size="100" class="user-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>
          
          <div class="info-section">
            <div class="name-row">
              <h1 class="nickname">{{ user.nickname || user.username }}</h1>
              <el-tag v-if="user.role === 'author'" type="success" size="small" effect="dark" class="role-tag">
                认证作者
              </el-tag>
              <el-tag v-else-if="user.role === 'admin'" type="danger" size="small" effect="dark" class="role-tag">
                管理员
              </el-tag>
            </div>
            
            <p class="username">@{{ user.username }}</p>
            
            <p class="bio">{{ user.bio || '这个人很懒，什么都没有写~' }}</p>
            
            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-value">{{ formatCount(stats.followingCount) }}</span>
                <span class="stat-label">关注</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ formatCount(stats.followerCount) }}</span>
                <span class="stat-label">粉丝</span>
              </div>
              <!-- 可以根据需要添加其他统计，如获赞数 -->
            </div>
          </div>
          
          <div class="action-section">
            <template v-if="isCurrentUser">
              <el-button type="primary" plain @click="editProfile">
                <el-icon><Edit /></el-icon>
                编辑资料
              </el-button>
            </template>
            <template v-else>
              <el-button 
                :type="isFollowing ? 'info' : 'primary'" 
                :loading="followLoading"
                @click="toggleFollow"
              >
                <el-icon v-if="isFollowing"><Check /></el-icon>
                <el-icon v-else><Plus /></el-icon>
                {{ isFollowing ? '已关注' : '关注' }}
              </el-button>
            </template>
          </div>
        </div>
      </el-card>

      <!-- 内容标签页 -->
      <el-tabs v-model="activeTab" class="profile-tabs">
        <!-- 作者的作品 -->
        <el-tab-pane v-if="user.role === 'author'" label="发布的作品" name="published">
          <div v-if="publishedBooksLoading" class="tab-loading">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="publishedBooks.length > 0" class="book-list">
            <el-card 
              v-for="book in publishedBooks" 
              :key="book.id" 
              class="book-item-card" 
              shadow="hover"
              @click="goToBook(book.id)"
            >
              <div class="book-item">
                <el-image :src="book.coverImage || defaultCover" class="book-cover" fit="cover" />
                <div class="book-info">
                  <h3 class="book-title">{{ book.title }}</h3>
                  <div class="book-meta">
                    <el-tag size="small" type="info">{{ book.categoryName || '未分类' }}</el-tag>
                    <span class="status-text">{{ getStatusText(book.status) }}</span>
                  </div>
                  <p class="book-desc">{{ book.description || '暂无简介' }}</p>
                  <div class="book-stats">
                    <span><el-icon><View /></el-icon> {{ formatCount(book.viewCount) }}</span>
                    <span><el-icon><Star /></el-icon> {{ formatCount(book.likeCount) }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无发布作品" />
        </el-tab-pane>

        <!-- 收藏的书籍 -->
        <el-tab-pane label="收藏的书籍" name="favorites">
          <div v-if="favoritesLoading" class="tab-loading">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="favoriteBooks.length > 0" class="book-list">
            <el-card 
              v-for="book in favoriteBooks" 
              :key="book.id" 
              class="book-item-card" 
              shadow="hover"
              @click="goToBook(book.id)"
            >
              <div class="book-item">
                <el-image :src="book.coverImage || defaultCover" class="book-cover" fit="cover" />
                <div class="book-info">
                  <h3 class="book-title">{{ book.title }}</h3>
                  <div class="book-meta">
                    <span class="author-name">作者: {{ book.penName || book.authorUsername }}</span>
                    <el-tag size="small" type="info">{{ book.categoryName || '未分类' }}</el-tag>
                  </div>
                  <p class="book-desc">{{ book.description || '暂无简介' }}</p>
                </div>
              </div>
            </el-card>
          </div>
          <el-empty v-else description="暂无收藏书籍" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 错误提示 -->
    <div v-else class="error-container">
      <el-result icon="error" title="用户不存在" sub-title="无法找到该用户的信息">
        <template #extra>
          <el-button type="primary" @click="goHome">返回首页</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user-store.js'
import { UserService } from '@/services/user-service.js'
import { BookService } from '@/services/book-service.js' // 假设有获取作者书籍的方法
import { ElMessage } from 'element-plus'
import { User, Edit, Plus, Check, View, Star } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const user = ref(null)
const stats = ref({
  followingCount: 0,
  followerCount: 0
})
const isFollowing = ref(false)
const followLoading = ref(false)
const activeTab = ref('published') // 默认tab，如果不是作者会自动切换
const publishedBooks = ref([])
const favoriteBooks = ref([])
const publishedBooksLoading = ref(false)
const favoritesLoading = ref(false)

const defaultCover = '/images/default_book_cover.svg'

const userId = computed(() => parseInt(route.params.id))
const isCurrentUser = computed(() => userStore.isLoggedIn && userStore.userInfo?.id === userId.value)

// 加载用户数据
const loadUserData = async () => {
  try {
    loading.value = true
    const userData = await UserService.getUserById(userId.value)
    user.value = userData
    
    // 加载统计信息
    const statsData = await UserService.getUserStats(userId.value)
    stats.value = statsData || { followingCount: 0, followerCount: 0 }
    
    // 如果登录且不是自己，检查关注状态
    if (userStore.isLoggedIn && !isCurrentUser.value) {
      isFollowing.value = await UserService.checkFollowStatus(userId.value)
    }
    
    // 设置默认Tab
    if (user.value.role === 'author') {
      activeTab.value = 'published'
      loadPublishedBooks()
    } else {
      activeTab.value = 'favorites'
    }
    
    // 总是加载收藏（或者懒加载）
    loadFavorites()
    
  } catch (error) {
    console.error('加载用户信息失败:', error)
    user.value = null
  } finally {
    loading.value = false
  }
}

// 加载发布的作品（假设有这个接口，或者通过搜索接口）
const loadPublishedBooks = async () => {
  try {
    publishedBooksLoading.value = true
    // 这里假设有一个根据作者ID获取书籍的接口，或者使用搜索接口过滤
    // 暂时用 BookService.getBooksByAuthor 或类似方法
    // 如果没有专门接口，可能需要 SearchBooks 并传 authorId
    // 检查 BookService 发现没有 getBooksByAuthor，使用 searchBooks
    const result = await BookService.searchBooks({ authorId: userId.value, page: 1, size: 20 })
    publishedBooks.value = result.records || []
  } catch (error) {
    console.error('加载作品失败:', error)
  } finally {
    publishedBooksLoading.value = false
  }
}

// 加载收藏的书籍
const loadFavorites = async () => {
  try {
    favoritesLoading.value = true
    const result = await UserService.getUserFavorites(userId.value, 1, 20)
    favoriteBooks.value = result.records || []
  } catch (error) {
    console.error('加载收藏失败:', error)
  } finally {
    favoritesLoading.value = false
  }
}

// 关注/取消关注
const toggleFollow = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/auth/login')
    return
  }
  
  try {
    followLoading.value = true
    if (isFollowing.value) {
      await UserService.unfollowUser(userId.value)
      isFollowing.value = false
      stats.value.followerCount--
      ElMessage.success('已取消关注')
    } else {
      await UserService.followUser(userId.value)
      isFollowing.value = true
      stats.value.followerCount++
      ElMessage.success('关注成功')
    }
  } catch (error) {
    console.error('关注操作失败:', error)
    ElMessage.error('操作失败')
  } finally {
    followLoading.value = false
  }
}

const editProfile = () => {
  router.push('/profile')
}

const goToBook = (bookId) => {
  router.push(`/books/${bookId}`)
}

const goHome = () => {
  router.push('/')
}

const formatCount = (count) => {
  if (!count) return '0'
  if (count < 10000) return count.toString()
  return (count / 10000).toFixed(1) + '万'
}

const getStatusText = (status) => {
  const map = {
    'serializing': '连载中',
    'completed': '已完结',
    'suspended': '已暂停'
  }
  return map[status] || '未知'
}

onMounted(() => {
  loadUserData()
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    loadUserData()
  }
})
</script>

<style scoped>
.user-profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header-card {
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.avatar-section {
  flex-shrink: 0;
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nickname {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.username {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.role-tag {
  font-weight: normal;
}

.bio {
  margin: 5px 0 15px;
  color: #606266;
  line-height: 1.5;
}

.stats-row {
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.action-section {
  display: flex;
  align-items: center;
}

.book-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.book-item-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.book-item-card:hover {
  transform: translateY(-2px);
}

.book-item {
  display: flex;
  gap: 15px;
}

.book-cover {
  width: 80px;
  height: 112px;
  border-radius: 4px;
  flex-shrink: 0;
}

.book-info {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.book-title {
  margin: 0 0 5px;
  font-size: 16px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.status-text {
  font-size: 12px;
  color: #909399;
}

.book-desc {
  margin: 0;
  font-size: 12px;
  color: #909399;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.book-stats {
  margin-top: 5px;
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #909399;
}

.book-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.author-name {
  font-size: 12px;
  color: #606266;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .name-row {
    justify-content: center;
  }
  
  .stats-row {
    justify-content: center;
  }
  
  .action-section {
    width: 100%;
    justify-content: center;
    margin-top: 10px;
  }
  
  .action-section .el-button {
    width: 100%;
  }
}
</style>
