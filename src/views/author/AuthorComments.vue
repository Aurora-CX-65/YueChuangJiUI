<template>
  <div class="author-comments">
    <el-card shadow="never">
      <template #header>
        <div class="header-actions">
          <span class="title">评论互动管理</span>
          <el-select 
            v-model="currentBookId" 
            placeholder="选择书籍" 
            @change="handleBookChange"
            style="width: 200px"
          >
            <el-option label="全部书籍" :value="0" />
            <el-option
              v-for="book in books"
              :key="book.id"
              :label="book.title"
              :value="book.id"
            />
          </el-select>
        </div>
      </template>

      <div v-if="loading" class="loading-wrapper">
        <el-skeleton :rows="3" animated />
      </div>

      <el-empty v-else-if="comments.length === 0" description="暂无评论" />

      <div v-else class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <div class="user-info">
              <el-avatar :size="32" :src="comment.userAvatar">{{ (comment.userNickname || comment.username || 'U').charAt(0) }}</el-avatar>
              <div class="user-meta">
                <span class="username">{{ comment.userNickname || comment.username }}</span>
                <div class="book-tag" v-if="comment.bookTitle">
                  <el-tag size="small" type="info" effect="plain">《{{ comment.bookTitle }}》</el-tag>
                </div>
              </div>
              <el-rate
                v-model="comment.rating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
                class="ml-2"
              />
            </div>
            <div class="comment-time">{{ formatTime(comment.createdAt) }}</div>
          </div>
          
          <div class="comment-content" @click="goToBookDetail(comment.bookId)">{{ comment.content }}</div>
          
          <div class="comment-footer">
            <div class="stats">
              <span class="like-count">
                <el-icon><Pointer /></el-icon> {{ comment.likeCount || 0 }} 点赞
              </span>
            </div>
            <el-button link type="primary" size="small" @click="goToBookDetail(comment.bookId)">查看详情</el-button>
          </div>
        </div>

        <div class="pagination-wrapper" v-if="total > 0">
          <el-pagination
            v-model:current-page="page"
            :page-size="size"
            :total="total"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useBookStore } from '@/stores/book-store'
import { useUserStore } from '@/stores/user-store'
import { CommentService } from '@/services/comment-service'
import { ElMessage } from 'element-plus'
import { Pointer } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

export default {
  name: 'AuthorComments',
  components: { Pointer },
  setup() {
    const router = useRouter()
    const bookStore = useBookStore()
    const userStore = useUserStore()
    const books = computed(() => bookStore.myBooks.items)
    const currentBookId = ref(0) // 0 表示全部书籍
    
    const comments = ref([])
    const allMixedComments = ref([]) // 用于存储"全部书籍"模式下的所有加载评论
    const loading = ref(false)
    const page = ref(1)
    const size = ref(10)
    const total = ref(0)

    const init = async () => {
      // 确保用户信息已加载
      if (!userStore.currentUserId) {
        await userStore.fetchCurrentUser()
      }

      // 强制刷新我的书籍列表，防止数据污染或过时
      if (userStore.currentUserId) {
        // 加载更多书籍以覆盖大部分情况（例如 100 本）
        await bookStore.fetchMyBooks(userStore.currentUserId, 1, 100)
      }
      
      // 默认加载全部
      loadComments()
    }

    const handleBookChange = () => {
      page.value = 1
      loadComments()
    }

    const handlePageChange = (newPage) => {
      page.value = newPage
      if (currentBookId.value === 0) {
        // 客户端分页
        updateDisplayedComments()
      } else {
        // 服务端分页
        loadComments()
      }
    }

    const updateDisplayedComments = () => {
      const start = (page.value - 1) * size.value
      const end = start + size.value
      comments.value = allMixedComments.value.slice(start, end)
    }

    const formatTime = (time) => {
      if (!time) return ''
      return new Date(time).toLocaleString()
    }

    const loadComments = async () => {
      loading.value = true
      try {
        if (currentBookId.value === 0) {
          // 加载全部书籍的评论
          // 由于后端不支持聚合查询，我们需要遍历所有书籍查询
          // 策略：每本书查询最近的20条评论，然后合并排序
          if (books.value.length === 0) {
            comments.value = []
            total.value = 0
            return
          }

          const promises = books.value.map(book => 
            CommentService.getBookComments(book.id, 1, 20)
              .then(res => {
                const list = (res && res.records) || []
                // 为每条评论附加书籍信息
                return list.map(c => ({ ...c, bookTitle: book.title, bookId: book.id }))
              })
              .catch(err => {
                console.warn(`Failed to load comments for book ${book.id}`, err)
                return []
              })
          )

          const results = await Promise.all(promises)
          const merged = results.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          
          allMixedComments.value = merged
          total.value = merged.length
          updateDisplayedComments()
          
        } else {
          // 加载特定书籍的评论
          const book = books.value.find(b => b.id === currentBookId.value)
          const res = await CommentService.getBookComments(currentBookId.value, page.value, size.value)
          if (res) {
            const list = res.records || []
            comments.value = list.map(c => ({ 
              ...c, 
              bookTitle: book ? book.title : '' 
            }))
            total.value = res.total || 0
          }
        }
      } catch (e) {
        console.error(e)
        ElMessage.error('加载评论失败')
      } finally {
        loading.value = false
      }
    }

    const goToBookDetail = (bookId) => {
      if (bookId) {
        // 跳转到书籍详情页的评论区锚点（如果前端实现了锚点逻辑），或者直接跳到详情页
        // 这里假设书籍详情页路径为 /books/:id
        // 为了更好的体验，可以传递 query 参数 tab=comments 让详情页自动切换到评论 tab
        const routeData = router.resolve({ 
          name: 'BookDetail', 
          params: { id: bookId },
          query: { tab: 'comments' }
        })
        window.open(routeData.href, '_blank')
      }
    }

    onMounted(() => {
      init()
    })

    return {
      books,
      currentBookId,
      comments,
      loading,
      page,
      size,
      total,
      handleBookChange,
      handlePageChange,
      formatTime,
      goToBookDetail
    }
  }
}
</script>

<style scoped>
.author-comments {
  max-width: 1000px;
  margin: 0 auto;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-size: 16px;
  font-weight: bold;
}
.loading-wrapper {
  padding: 20px;
}
.comment-item {
  padding: 20px 0;
  border-bottom: 1px solid #EBEEF5;
}
.comment-item:last-child {
  border-bottom: none;
}
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.user-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.user-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.username {
  font-weight: bold;
  font-size: 14px;
  color: #303133;
}
.book-tag {
  line-height: 1;
}
.comment-time {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  margin-left: 10px;
}
.comment-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
  padding-left: 42px; /* Align with text start */
}
.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #909399;
  padding-left: 42px;
}
.stats {
  display: flex;
  gap: 15px;
}
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.ml-2 { margin-left: 8px; }
</style>
