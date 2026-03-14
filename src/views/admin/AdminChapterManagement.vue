<template>
  <div class="admin-chapter-management">
    <el-card shadow="never">
      <div class="header">
        <div class="title">章节管理 - 书籍列表</div>
        <el-space>
          <el-input
            v-model="keyword"
            placeholder="搜索书名/作者"
            style="width: 240px"
            clearable
            @clear="loadBooks"
            @keyup.enter="loadBooks"
          >
            <template #append>
              <el-button icon="Search" @click="loadBooks" />
            </template>
          </el-input>
        </el-space>
      </div>

      <div class="content">
        <div v-if="loading" class="loading"><el-skeleton :rows="6" animated /></div>
        <el-empty v-else-if="books.length === 0" description="暂无书籍数据" />
        
        <div v-else class="book-grid">
          <el-card 
            v-for="book in books" 
            :key="book.id" 
            class="book-card" 
            shadow="hover"
            @click="goToChapters(book.id)"
          >
            <div class="book-info">
              <el-image 
                :src="book.cover || defaultCover" 
                class="book-cover"
                fit="cover"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="book-details">
                <div class="book-title" :title="book.title">{{ book.title }}</div>
                <div class="book-author">
                  <el-icon><User /></el-icon>
                  {{ book.authorUsername }}
                </div>
                <div class="book-meta">
                  <el-tag size="small" :type="getStatusType(book.status)">{{ getStatusText(book.status) }}</el-tag>
                  <span class="chapter-count">{{ book.chapterCount || 0 }} 章</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>

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
    </el-card>
  </div>
</template>

<script>
import { AdminService } from '@/services/admin-service.js'
import { Search, User, Picture } from '@element-plus/icons-vue'

export default {
  name: 'AdminChapterManagement',
  components: { Search, User, Picture },
  data() {
    return {
      keyword: '',
      loading: false,
      books: [],
      page: 1,
      size: 12,
      total: 0,
      defaultCover: '/images/default_book_cover.svg'
    }
  },
  mounted() {
    this.loadBooks()
  },
  methods: {
    // 处理图片URL，如果是相对路径则拼接完整URL
    getImageUrl(url) {
      if (!url) return this.defaultCover
      if (url.startsWith('http')) return url
      return `${import.meta.env.VITE_API_URL}${url.startsWith('/') ? '' : '/'}${url}`
    },
    async loadBooks() {
      this.loading = true
      try {
        const res = await AdminService.getAdminBooks(this.page, this.size, this.keyword)
        this.books = (res?.records || []).map(book => ({
          ...book,
          // 确保封面URL正确处理，后端返回字段为 coverImage
          cover: this.getImageUrl(book.coverImage || book.cover)
        }))
        this.total = res?.total || 0
      } catch (e) {
        console.error('加载书籍列表失败:', e)
        window.notificationManager?.error('加载书籍列表失败')
      } finally {
        this.loading = false
      }
    },
    handlePageChange(p) {
      this.page = p
      this.loadBooks()
    },
    goToChapters(bookId) {
      // 动态判断跳转路由：如果是编辑角色路由进来，则跳转到编辑对应的路由
      const isEditorRoute = this.$route.path.startsWith('/author')
      this.$router.push({
        name: isEditorRoute ? 'EditorBookChapters' : 'AdminBookChapters',
        params: { bookId }
      })
    },
    getStatusType(status) {
      const map = {
        'published': 'success',
        'serializing': 'success',
        'completed': 'warning',
        'draft': 'info',
        'pending_review': 'primary',
        'suspended': 'danger'
      }
      return map[status] || 'info'
    },
    getStatusText(status) {
      const map = {
        'published': '已发布',
        'serializing': '连载中',
        'completed': '已完结',
        'draft': '草稿',
        'pending_review': '待审核',
        'suspended': '已下架'
      }
      return map[status] || status
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.title { font-weight: 600; font-size: 16px; }
.loading { padding: 20px; }

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.book-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.book-card:hover {
  transform: translateY(-4px);
}

.book-info {
  display: flex;
  gap: 16px;
}

.book-cover {
  width: 80px;
  height: 110px;
  border-radius: 4px;
  flex-shrink: 0;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #909399;
  font-size: 24px;
}

.book-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.book-title {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-author {
  font-size: 13px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 4px;
}

.book-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.chapter-count {
  font-size: 12px;
  color: #909399;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>