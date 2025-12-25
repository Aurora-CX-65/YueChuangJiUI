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
                    <BookCard :book="book" />
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
                    <BookCard :book="book" />
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

            <el-tab-pane label="关注作者" name="following">
              <div v-if="loading.following" class="loading-container">
                <el-skeleton :rows="4" animated />
              </div>
              <el-empty v-else-if="following.length === 0" description="暂无关注" />
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
          <el-input v-model="editForm.email" />
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
  </div>
</template>

<script>
import { useUserStore } from '@/stores/user-store.js'
import { useBookStore } from '@/stores/book-store.js'
import BookCard from '@/components/books/BookCard.vue'

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
        followers: false
      },
      myBooks: [],
      myBooksPagination: { current: 1, size: 12, total: 0, pages: 0 },
      favoriteBooks: [],
      favoritePagination: { current: 1, size: 12, total: 0, pages: 0 },
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
      saving: false
    }
  },
  setup() {
    const userStore = useUserStore()
    const bookStore = useBookStore()
    return { userStore, bookStore }
  },
  mounted() {
    this.initialize()
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
        this.loadFollowers(this.followersPagination.current)
      ])
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
