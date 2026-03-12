<template>
  <div class="profile-view">
    <el-container class="profile-container">
      <el-aside width="320px" class="profile-aside">
        <el-card class="profile-card" shadow="never">
          <div class="profile-header">
            <el-avatar :size="80" :src="userStore.userAvatar" />
            <div class="profile-basic">
              <div class="nickname">
                {{ userStore.userNickname }}
                <el-tag v-if="userStore.isAuthor" type="success" size="small">作者</el-tag>
                <el-tag v-if="userStore.isAdmin" type="warning" size="small">管理员</el-tag>
              </div>
              <div class="username" v-if="userStore.currentUser?.username">@{{ userStore.currentUser.username }}</div>
            </div>
          </div>
          <div class="profile-actions">
            <el-button size="small" @click="openEdit">编辑资料</el-button>
            <el-button size="small" type="warning" @click="openPasswordDialog">修改密码</el-button>
            <el-upload
              :show-file-list="false"
              :auto-upload="false"
              accept="image/*"
              :on-change="handleAvatarSelect"
            >
              <el-button size="small" type="primary">更换头像</el-button>
            </el-upload>
          </div>
          <el-divider />
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="邮箱">
              {{ userStore.currentUser?.email || '未绑定' }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ userStore.currentUser?.phone || '未绑定' }}
            </el-descriptions-item>
            <el-descriptions-item label="简介">
              {{ userStore.currentUser?.bio || '暂无简介' }}
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />
          <div class="stats">
            <div class="stat">
              <div class="stat-value">{{ userStore.bookCount }}</div>
              <div class="stat-label">作品</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ userStore.followingCount }}</div>
              <div class="stat-label">关注</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ userStore.followersCount }}</div>
              <div class="stat-label">粉丝</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ formatWordCount(userStore.totalWordCount) }}</div>
              <div class="stat-label">总字数</div>
            </div>
          </div>
        </el-card>
      </el-aside>

      <el-main class="profile-main">
        <el-card class="tabs-card" shadow="never">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="我的书籍" name="my-books">
              <div v-if="loading.myBooks" class="loading-container">
                <el-skeleton :rows="4" animated />
              </div>
              <el-empty v-else-if="myBooks.length === 0" description="暂无作品" />
              <div v-else>
                <el-row :gutter="20">
                  <el-col
                    v-for="book in myBooks"
                    :key="book.id"
                    :xl="6"
                    :lg="8"
                    :md="12"
                    :sm="12"
                    :xs="24"
                  >
                    <BookCard :book="book" :custom-link="`/author/books/${book.id}/chapters`" />
                  </el-col>
                </el-row>
                <div v-if="myBooksPagination.pages > 1" class="pagination">
                  <el-pagination
                    v-model:current-page="myBooksPagination.current"
                    :page-size="myBooksPagination.size"
                    :total="myBooksPagination.total"
                    layout="total, prev, pager, next"
                    background
                    @current-change="loadMyBooks"
                  />
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="收藏书籍" name="favorites">
              <div class="tab-actions mb-3">
                <el-button 
                  v-if="!isManageMode" 
                  type="primary" 
                  link 
                  @click="isManageMode = true"
                >
                  管理
                </el-button>
                <div v-else class="manage-actions">
                  <el-checkbox 
                    v-model="isAllSelected" 
                    :indeterminate="isIndeterminate"
                    @change="handleSelectAll"
                  >
                    全选
                  </el-checkbox>
                  <el-button type="danger" size="small" :disabled="selectedBooks.length === 0" @click="handleBatchDelete">
                    删除({{ selectedBooks.length }})
                  </el-button>
                  <el-button size="small" @click="cancelManageMode">完成</el-button>
                </div>
              </div>

              <div v-if="loading.favorites" class="loading-container">
                <el-skeleton :rows="4" animated />
              </div>
              <el-empty v-else-if="favoriteBooks.length === 0" description="暂无收藏" />
              <div v-else>
                <el-row :gutter="20">
                  <el-col
                    v-for="book in favoriteBooks"
                    :key="book.id"
                    :xl="6"
                    :lg="8"
                    :md="12"
                    :sm="12"
                    :xs="24"
                  >
                    <div class="book-card-wrapper" :class="{ 'is-managing': isManageMode }">
                      <BookCard 
                        :book="book" 
                        @long-press="handleLongPress(book)"
                      />
                      <div v-if="isManageMode" class="book-select-mask" @click.stop="toggleSelect(book)">
                        <el-checkbox :model-value="selectedBooks.includes(book.id)" @click.stop="toggleSelect(book)" />
                      </div>
                    </div>
                  </el-col>
                </el-row>
                <div v-if="favoritePagination.pages > 1" class="pagination">
                  <el-pagination
                    v-model:current-page="favoritePagination.current"
                    :page-size="favoritePagination.size"
                    :total="favoritePagination.total"
                    layout="total, prev, pager, next"
                    background
                    @current-change="loadFavorites"
                  />
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="阅读历史" name="history">
              <div v-if="loading.history" class="loading-container">
                <el-skeleton :rows="4" animated />
              </div>
              <el-empty v-else-if="readingHistory.length === 0" description="暂无阅读记录" />
              <div v-else class="history-list">
                 <div v-for="item in readingHistory" :key="item.id" class="history-item" @click="continueReading(item)">
                    <div class="history-cover">
                      <el-image :src="item.bookCover || '/images/default_book_cover.svg'" fit="cover">
                        <template #error>
                          <div class="image-slot">
                            <img src="/images/default_book_cover.svg" alt="默认封面" style="width: 100%; height: 100%; object-fit: cover;" />
                          </div>
                        </template>
                      </el-image>
                    </div>
                    <div class="history-info">
                       <div class="history-title">{{ item.bookTitle || item.bookName || item.title || '未知书籍' }}</div>
                       <div class="history-chapter">看到：{{ item.chapterTitle || item.chapterName || '未知章节' }}</div>
                       <div class="history-time">
                         <span>{{ formatDate(item.lastReadAt || item.updateTime || item.createTime || item.readTime) }}</span>
                         <span class="history-progress" v-if="item.progressPercentage || item.progress">
                            进度: {{ item.progressPercentage || item.progress }}%
                         </span>
                       </div>
                    </div>
                    <div class="history-action">
                       <el-button type="primary" size="small" round @click.stop="continueReading(item)">继续阅读</el-button>
                    </div>
                 </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="关注作者" name="following">
              <div v-if="loading.following" class="loading-container">
                <el-skeleton :rows="4" animated />
              </div>
              <el-empty v-else-if="following && following.length === 0" description="暂无关注" />
              <div v-else class="user-list">
                <el-row :gutter="16">
                  <el-col
                    v-for="u in following"
                    :key="u.id"
                    :xl="8"
                    :lg="8"
                    :md="12"
                    :sm="24"
                    :xs="24"
                  >
                    <el-card shadow="never" class="user-card">
                      <div class="user-item">
                        <el-avatar :src="u.avatar || '/images/default-avatar.svg'" />
                        <div class="user-info">
                          <div class="user-name">{{ u.nickname || u.username }}</div>
                          <div class="user-meta">{{ u.role || '用户' }}</div>
                        </div>
                        <el-button size="small" @click="goUser(u.id)">查看</el-button>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
                <div v-if="followingPagination.pages > 1" class="pagination">
                  <el-pagination
                    v-model:current-page="followingPagination.current"
                    :page-size="followingPagination.size"
                    :total="followingPagination.total"
                    layout="total, prev, pager, next"
                    background
                    @current-change="loadFollowing"
                  />
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="粉丝" name="followers">
              <div v-if="loading.followers" class="loading-container">
                <el-skeleton :rows="4" animated />
              </div>
              <el-empty v-else-if="followers.length === 0" description="暂无粉丝" />
              <div v-else class="user-list">
                <el-row :gutter="16">
                  <el-col
                    v-for="u in followers"
                    :key="u.id"
                    :xl="8"
                    :lg="8"
                    :md="12"
                    :sm="24"
                    :xs="24"
                  >
                    <el-card shadow="never" class="user-card">
                      <div class="user-item">
                        <el-avatar :src="u.avatar || '/images/default-avatar.svg'" />
                        <div class="user-info">
                          <div class="user-name">{{ u.nickname || u.username }}</div>
                          <div class="user-meta">{{ u.role || '用户' }}</div>
                        </div>
                        <el-button size="small" @click="goUser(u.id)">查看</el-button>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
                <div v-if="followersPagination.pages > 1" class="pagination">
                  <el-pagination
                    v-model:current-page="followersPagination.current"
                    :page-size="followersPagination.size"
                    :total="followersPagination.total"
                    layout="total, prev, pager, next"
                    background
                    @current-change="loadFollowers"
                  />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-main>
    </el-container>

    <el-dialog v-model="editVisible" title="编辑资料" width="520px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" disabled />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input type="textarea" v-model="editForm.bio" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="passwordVisible" title="修改密码" width="400px">
      <el-form :model="passwordForm" label-width="100px" :rules="passwordRules" ref="passwordFormRef">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入旧密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="6-20个字符" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordVisible = false">取消</el-button>
        <el-button type="primary" :loading="changingPassword" @click="submitChangePassword">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/user-store.js'
import { useBookStore } from '@/stores/book-store.js'
import { useChapterStore } from '@/stores/chapter-store.js' // 引入 chapterStore
import { ReadingProgressService } from '@/services/reading-progress-service.js'
import BookCard from '@/components/books/BookCard.vue'
import { formatDate } from '@/utils/formatters'
import { useRoute } from 'vue-router'
import { watch } from 'vue'

import { UserService } from '@/services/user-service.js'
import { ElMessageBox, ElMessage } from 'element-plus'

export default {
  name: 'ProfileView',
  components: {
    BookCard
  },
  data() {
    return {
      activeTab: 'my-books',
      loading: {
        myBooks: false,
        favorites: false,
        following: false,
        followers: false,
        history: false
      },
      myBooks: [],
      myBooksPagination: { current: 1, size: 12, total: 0, pages: 0 },
      favoriteBooks: [],
      favoritePagination: { current: 1, size: 12, total: 0, pages: 0 },
      isManageMode: false,
      selectedBooks: [],
      readingHistory: [],
      readingHistoryPagination: { current: 1, size: 10, total: 0, pages: 0 },
      following: [],
      followingPagination: { current: 1, size: 12, total: 0, pages: 0 },
      followers: [],
      followersPagination: { current: 1, size: 12, total: 0, pages: 0 },
      editVisible: false,
      editForm: {
        nickname: '',
        email: '',
        phone: '',
        bio: ''
      },
      saving: false,
      passwordVisible: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      changingPassword: false,
      passwordRules: {
        oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.passwordForm.newPassword) {
                callback(new Error('两次输入密码不一致'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  setup() {
    const userStore = useUserStore()
    const bookStore = useBookStore()
    const chapterStore = useChapterStore() // 使用 chapterStore
    const route = useRoute()
    
    // 监听路由参数 tab 的变化
    watch(() => route.query.tab, (newTab) => {
      if (newTab) {
        // ...
      }
    })
    
    return { userStore, bookStore, chapterStore, route }
  },
  mounted() {
    this.initialize()
    // 初始化 tab
    if (this.$route.query.tab) {
      this.activeTab = this.$route.query.tab
    }
  },
  watch: {
    '$route.query.tab'(newTab) {
      if (newTab) {
        this.activeTab = newTab
      }
    }
  },
  computed: {
    isAllSelected: {
      get() {
        return this.favoriteBooks.length > 0 && this.selectedBooks.length === this.favoriteBooks.length
      },
      set(val) {
        this.handleSelectAll(val)
      }
    },
    isIndeterminate() {
      return this.selectedBooks.length > 0 && this.selectedBooks.length < this.favoriteBooks.length
    }
  },
  methods: {
    async initialize() {
      if (!this.userStore.isLoggedIn) {
        await this.userStore.initializeUserState()
      }
      if (!this.userStore.currentUser) {
        await this.userStore.fetchCurrentUser()
      }
      await this.loadStats()
      await Promise.all([
        this.loadMyBooks(this.myBooksPagination.current),
        this.loadFavorites(this.favoritePagination.current),
        this.loadFollowing(this.followingPagination.current),
        this.loadFollowers(this.followersPagination.current),
        this.loadReadingHistory(this.readingHistoryPagination.current)
      ])
    },
    formatDate,
    async loadReadingHistory(page = 1) {
      this.loading.history = true
      try {
        const res = await this.chapterStore.fetchReadingHistory(page, this.readingHistoryPagination.size)
        if (res) {
          // 兼容后端可能返回的不同数据结构
          const records = res.records || res.items || res || []
          this.readingHistory = Array.isArray(records) ? records : []
          
          this.readingHistoryPagination.current = res.current || page
          this.readingHistoryPagination.size = res.size || this.readingHistoryPagination.size
          this.readingHistoryPagination.total = res.total || 0
          this.readingHistoryPagination.pages = res.pages || 0
        }
      } catch (e) {
        console.error('加载阅读历史失败:', e)
      } finally {
        this.loading.history = false
      }
    },
    async continueReading(item) {
      // 尝试跳转到阅读页
      if (item.chapterId) {
        this.$router.push({ 
          name: 'ChapterReading', 
          params: { bookId: item.bookId, chapterId: item.chapterId } 
        })
      } else {
        // Fallback: 如果没有chapterId，跳转到书籍详情
        this.$router.push(`/books/${item.bookId}`)
      }
    },
    async loadStats() {
      if (this.userStore.currentUserId) {
        await this.userStore.fetchUserStats(this.userStore.currentUserId)
      }
    },
    async loadMyBooks(page = 1) {
      if (!this.userStore.currentUserId) return
      this.loading.myBooks = true
      try {
        const res = await this.bookStore.fetchBooksByAuthor(this.userStore.currentUserId, page, this.myBooksPagination.size)
        if (res) {
          this.myBooks = res.records || []
          this.myBooksPagination.current = res.current || page
          this.myBooksPagination.size = res.size || this.myBooksPagination.size
          this.myBooksPagination.total = res.total || 0
          this.myBooksPagination.pages = res.pages || 0
        }
      } finally {
        this.loading.myBooks = false
      }
    },
    async loadFavorites(page = 1) {
      this.loading.favorites = true
      try {
        const res = await this.bookStore.fetchFavoriteBooks(page, this.favoritePagination.size)
        if (res) {
          this.favoriteBooks = res.records || []
          this.favoritePagination.current = res.current || page
          this.favoritePagination.size = res.size || this.favoritePagination.size
          this.favoritePagination.total = res.total || 0
          this.favoritePagination.pages = res.pages || 0
        }
      } finally {
        this.loading.favorites = false
      }
    },
    async loadFollowing(page = 1) {
      this.loading.following = true
      try {
        const res = await this.userStore.fetchFollowing(undefined, page, this.followingPagination.size)
        if (res) {
          this.following = res.records || []
          this.followingPagination.current = res.current || page
          this.followingPagination.size = res.size || this.followingPagination.size
          this.followingPagination.total = res.total || 0
          this.followingPagination.pages = res.pages || 0
        }
      } finally {
        this.loading.following = false
      }
    },
    async loadFollowers(page = 1) {
      this.loading.followers = true
      try {
        const res = await this.userStore.fetchFollowers(undefined, page, this.followersPagination.size)
        if (res) {
          this.followers = res.records || []
          this.followersPagination.current = res.current || page
          this.followersPagination.size = res.size || this.followersPagination.size
          this.followersPagination.total = res.total || 0
          this.followersPagination.pages = res.pages || 0
        }
      } finally {
        this.loading.followers = false
      }
    },
    openEdit() {
      const u = this.userStore.currentUser || {}
      this.editForm.nickname = u.nickname || u.username || ''
      this.editForm.email = u.email || ''
      this.editForm.phone = u.phone || ''
      this.editForm.bio = u.bio || ''
      this.editVisible = true
    },
    async saveProfile() {
      this.saving = true
      try {
        const u = this.userStore.currentUser || {}
        const payload = {}
        const nickname = (this.editForm.nickname || '').trim()
        const email = (this.editForm.email || '').trim()
        const phone = (this.editForm.phone || '').trim()
        const bio = (this.editForm.bio || '').trim()

        if (nickname) {
          if (nickname.length > 50) {
            window.notificationManager && window.notificationManager.error('昵称长度不能超过50个字符')
            return
          }
          if (nickname !== (u.nickname || u.username || '')) {
            payload.nickname = nickname
          }
        }
        if (email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(email)) {
            window.notificationManager && window.notificationManager.error('邮箱格式不正确')
            return
          }
          if (email !== (u.email || '')) {
            payload.email = email
          }
        }
        if (phone) {
          const phoneRegex = /^1[3-9]\d{9}$/
          if (!phoneRegex.test(phone)) {
            window.notificationManager && window.notificationManager.error('手机号格式不正确')
            return
          }
          if (phone !== (u.phone || '')) {
            payload.phone = phone
          }
        }
        if (bio) {
          if (bio.length > 500) {
            window.notificationManager && window.notificationManager.error('个人简介长度不能超过500个字符')
            return
          }
          if (bio !== (u.bio || '')) {
            payload.bio = bio
          }
        }

        if (Object.keys(payload).length === 0) {
          window.notificationManager && window.notificationManager.info('没有需要更新的内容')
        } else {
          await this.userStore.updateProfile(payload)
        }
        this.editVisible = false
      } finally {
        this.saving = false
      }
    },
    openPasswordDialog() {
      this.passwordForm.oldPassword = ''
      this.passwordForm.newPassword = ''
      this.passwordForm.confirmPassword = ''
      this.passwordVisible = true
    },
    async submitChangePassword() {
      if (!this.$refs.passwordFormRef) return
      
      await this.$refs.passwordFormRef.validate(async (valid) => {
        if (valid) {
          this.changingPassword = true
          try {
            await UserService.changePassword(this.passwordForm)
            window.notificationManager && window.notificationManager.success('密码修改成功，请重新登录')
            this.passwordVisible = false
            // 退出登录
            await this.userStore.logout()
            this.$router.push('/auth/login')
          } catch (error) {
            console.error('修改密码失败:', error)
          } finally {
            this.changingPassword = false
          }
        }
      })
    },
    async handleAvatarSelect(file) {
      const raw = file.raw || file
      if (!raw) return
      await this.userStore.uploadAvatar(raw)
    },
    formatWordCount(n) {
      if (!n || n < 10000) return n
      if (n < 100000000) return `${(n / 10000).toFixed(1)}万`
      return `${(n / 100000000).toFixed(1)}亿`
    },
    goUser(userId) {
      this.$router.push(`/users/${userId}`)
    },
    // 管理模式相关方法
    toggleSelect(book) {
      const index = this.selectedBooks.indexOf(book.id)
      if (index === -1) {
        this.selectedBooks.push(book.id)
      } else {
        this.selectedBooks.splice(index, 1)
      }
    },
    handleSelectAll(val) {
      this.selectedBooks = val ? this.favoriteBooks.map(b => b.id) : []
    },
    cancelManageMode() {
      this.isManageMode = false
      this.selectedBooks = []
    },
    handleLongPress(book) {
      if (!this.isManageMode) {
        this.isManageMode = true
        this.toggleSelect(book)
      }
    },
    async handleBatchDelete() {
      if (this.selectedBooks.length === 0) return
      
      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${this.selectedBooks.length} 本书籍吗？`,
          '批量删除',
          {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 批量删除逻辑
        // 由于后端可能没有批量删除接口，这里循环调用 unfavoriteBook
        // 建议后端添加批量接口以优化性能
        const promises = this.selectedBooks.map(id => this.bookStore.unfavoriteBook(id))
        await Promise.all(promises)
        
        ElMessage.success('删除成功')
        this.cancelManageMode()
        this.loadFavorites(1) // 重新加载第一页
      } catch (e) {
        if (e !== 'cancel') {
          console.error('批量删除失败:', e)
          ElMessage.error('删除失败')
        }
      }
    }
  }
}
</script>

<style scoped>
.profile-view {
  padding: 20px;
}
.profile-container {
  min-height: calc(100vh - var(--header-height));
  align-items: flex-start;
}
.profile-aside {
  margin-right: 20px;
}
.profile-card {
  position: sticky;
  top: calc(var(--header-height) + 20px);
  border: 1px solid #e4e7ed;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.profile-basic {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.nickname {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.username {
  font-size: 13px;
  color: #909399;
}
.profile-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 12px;
}
.stat {
  text-align: center;
  padding: 10px 6px;
  border: 1px dashed #ebeef5;
  border-radius: 6px;
}
.stat-value {
  font-size: 18px;
  font-weight: 600;
}
.stat-label {
  font-size: 12px;
  color: #909399;
}
.profile-main {
  padding: 0;
}
.tabs-card {
  border: 1px solid #e4e7ed;
  min-height: 500px;
}
.loading-container {
  padding: 20px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.user-list {
  margin-top: 8px;
}
.user-card {
  border: 1px solid #ebeef5;
}
.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.user-name {
  font-weight: 600;
}
.user-meta {
  font-size: 12px;
  color: #909399;
}

/* History List Styles */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.history-item:hover {
  border-color: var(--el-color-primary-light-5);
  background-color: var(--el-color-primary-light-9);
}
.history-cover {
  width: 60px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}
.history-cover .el-image {
  width: 100%;
  height: 100%;
}
.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.history-title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}
.history-chapter {
  font-size: 14px;
  color: #606266;
}
.history-time {
  font-size: 12px;
  color: #909399;
  display: flex;
  gap: 10px;
}
.history-action {
  flex-shrink: 0;
}

/* Manage Mode Styles */
.book-card-wrapper {
  position: relative;
  height: 100%;
}
.book-card-wrapper.is-managing .book-card {
  pointer-events: none; /* 禁用卡片原有点击事件 */
}
.book-select-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  z-index: 10;
  cursor: pointer;
  display: flex;
  justify-content: flex-end;
  padding: 10px;
}
.manage-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 768px) {
  .profile-view {
    padding: 16px;
  }
  .profile-aside {
    width: 100% !important;
    margin-right: 0;
    margin-bottom: 16px;
  }
  .profile-card {
    position: static;
  }
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
