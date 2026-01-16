<template>
  <div class="author-books">
    <el-card shadow="never">
      <div class="header">
        <div class="title">我的作品</div>
        <div class="actions">
          <el-button type="primary" @click="$router.push('/author/books/create')">
            <el-icon><Plus /></el-icon> 创建新书
          </el-button>
        </div>
      </div>
      
      <div v-if="loading" class="loading">
        <el-skeleton :rows="3" animated />
      </div>
      <el-empty v-else-if="books.length === 0" description="您还没有创建任何书籍，快去创建一本吧！">
        <el-button type="primary" @click="$router.push('/author/books/create')">创建第一本书</el-button>
      </el-empty>
      
      <div v-else class="book-list">
        <div v-for="book in books" :key="book.id" class="book-item">
          <div class="book-cover">
            <img :src="book.coverUrl || '/images/default_book_cover.svg'" alt="封面">
          </div>
          <div class="book-info">
            <div class="book-title-row">
              <span class="book-title">{{ book.title }}</span>
              <el-tag size="small" :type="getStatusType(book.status)" class="ml-2">{{ getStatusLabel(book.status) }}</el-tag>
            </div>
            <div class="book-meta">
              <span>{{ book.categoryName }}</span>
              <span class="divider">|</span>
              <span>{{ formatWordCount(book.wordCount) }}字</span>
              <span class="divider">|</span>
              <span>{{ formatDateTime(book.updateTime) }} 更新</span>
            </div>
            <div class="book-desc">{{ book.description }}</div>
          </div>
          <div class="book-actions">
            <el-button type="primary" plain @click="$router.push(`/author/books/${book.id}/chapters`)">
              <el-icon><EditPen /></el-icon> 写章节
            </el-button>
            <el-button @click="$router.push(`/author/books/${book.id}/edit`)">设置</el-button>
            <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, book)">
              <el-button icon="More" circle class="ml-2"></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="book.status === 'draft'" command="publish">提交发布</el-dropdown-item>
                  <el-dropdown-item v-if="book.status === 'serializing'" command="complete">标记完结</el-dropdown-item>
                  <el-dropdown-item v-if="book.status === 'completed'" command="serialize">转为连载</el-dropdown-item>
                  <el-dropdown-item command="delete" style="color: #f56c6c">删除书籍</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <div class="pagination" v-if="total > 0">
          <el-pagination
            v-model:current-page="page"
            :page-size="size"
            :total="total"
            layout="prev, pager, next"
            background
            @current-change="loadBooks"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { Plus, EditPen, More } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user-store'
import { useBookStore } from '@/stores/book-store'
import { formatDate } from '@/utils/formatters'
import { ElMessageBox, ElMessage } from 'element-plus'

export default {
  name: 'AuthorBooks',
  components: { Plus, EditPen, More },
  data() {
    return {
      loading: false,
      books: [],
      page: 1,
      size: 10,
      total: 0
    }
  },
  setup() {
    const userStore = useUserStore()
    const bookStore = useBookStore()
    return { userStore, bookStore }
  },
  mounted() {
    this.loadBooks()
  },
  methods: {
    async loadBooks(p) {
      if (p) this.page = p
      if (!this.userStore.currentUserId) return
      
      this.loading = true
      try {
        const res = await this.bookStore.fetchBooksByAuthor(this.userStore.currentUserId, this.page, this.size)
        if (res) {
          this.books = res.records || []
          this.total = res.total || 0
        }
      } finally {
        this.loading = false
      }
    },
    formatDateTime(val) {
      return formatDate(val)
    },
    formatWordCount(n) {
      if (!n) return '0'
      if (n < 10000) return n
      return (n / 10000).toFixed(1) + '万'
    },
    getStatusLabel(status) {
      const map = {
        'draft': '草稿',
        'pending_review': '审核中',
        'published': '已发布',
        'serializing': '连载中',
        'completed': '已完结',
        'suspended': '已断更'
      }
      return map[status] || status
    },
    getStatusType(status) {
      const map = {
        'draft': 'info',
        'pending_review': 'warning',
        'published': 'success',
        'serializing': 'primary',
        'completed': 'success',
        'suspended': 'danger'
      }
      return map[status] || ''
    },
    handleCommand(cmd, book) {
      if (cmd === 'delete') {
        ElMessageBox.confirm(
          '删除后无法恢复，确定要删除这本书吗？',
          '警告',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(async () => {
          // TODO: Implement delete API in BookStore
          // await this.bookStore.deleteBook(book.id)
          ElMessage.warning('暂未实现删除功能')
        }).catch(() => {})
      }
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title {
  font-size: 18px;
  font-weight: 600;
}
.book-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.book-item {
  display: flex;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.3s;
}
.book-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
.book-cover {
  width: 90px;
  height: 120px;
  flex-shrink: 0;
  margin-right: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}
.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.book-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.book-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.ml-2 {
  margin-left: 8px;
}
.book-meta {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}
.divider {
  margin: 0 8px;
  color: #ebeef5;
}
.book-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.book-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 16px;
  flex-shrink: 0;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
