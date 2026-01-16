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

      <el-empty v-else-if="!currentBookId" description="请选择一本书籍查看评论" />
      <el-empty v-else-if="comments.length === 0" description="暂无评论" />

      <div v-else class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <div class="user-info">
              <el-avatar :size="32" :src="comment.userAvatar">{{ (comment.userNickname || comment.username || 'U').charAt(0) }}</el-avatar>
              <span class="username">{{ comment.userNickname || comment.username }}</span>
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
          
          <div class="comment-content">{{ comment.content }}</div>
          
          <div class="comment-footer">
            <div class="stats">
              <span class="like-count">
                <el-icon><Pointer /></el-icon> {{ comment.likeCount || 0 }} 点赞
              </span>
            </div>
            <!-- 由于后端暂不支持直接回复接口，此处暂不提供回复按钮，或后续跳转 -->
            <!-- <el-button type="primary" link size="small">回复</el-button> -->
          </div>
        </div>

        <div class="pagination-wrapper" v-if="total > 0">
          <el-pagination
            v-model:current-page="page"
            :page-size="size"
            :total="total"
            layout="prev, pager, next"
            @current-change="loadComments"
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

export default {
  name: 'AuthorComments',
  components: { Pointer },
  setup() {
    const bookStore = useBookStore()
    const userStore = useUserStore()
    const books = computed(() => bookStore.myBooks.items)
    const currentBookId = ref(null)
    
    const comments = ref([])
    const loading = ref(false)
    const page = ref(1)
    const size = ref(10)
    const total = ref(0)

    const init = async () => {
      // 确保用户信息已加载
      if (!userStore.currentUserId) {
        await userStore.fetchCurrentUser()
      }

      // 确保书籍列表已加载
      if (bookStore.myBooks.items.length === 0 && userStore.currentUserId) {
        await bookStore.fetchMyBooks(userStore.currentUserId)
      }
      // 默认选中第一本书
      if (bookStore.myBooks.items.length > 0) {
        currentBookId.value = bookStore.myBooks.items[0].id
        loadComments()
      }
    }

    const handleBookChange = () => {
      page.value = 1
      loadComments()
    }

    const loadComments = async () => {
      if (!currentBookId.value) return
      
      loading.value = true
      try {
        // 使用 CommentService 获取书籍评论
        // 假设 API 路径是 /api/comments/book/{bookId}
        // 这里直接使用 httpClient 或者封装好的 Service
        // 暂时假设 CommentService 已存在并有 getBookComments 方法
        // 如果没有，需要创建或直接用 axios
        
        // 检查 CommentService 是否可用，如果不可用则需要实现
        const res = await CommentService.getBookComments(currentBookId.value, page.value, size.value)
        if (res) {
            comments.value = res.records || []
            total.value = res.total || 0
        }
      } catch (e) {
        console.error(e)
        ElMessage.error('加载评论失败')
      } finally {
        loading.value = false
      }
    }

    const formatTime = (time) => {
      if (!time) return ''
      return new Date(time).toLocaleString()
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
      total,handleBookChange,
      loadComments,
      formatTime
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
  align-items: center;
  margin-bottom: 10px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.username {
  font-weight: bold;
  font-size: 14px;
  color: #303133;
}
.comment-time {
  font-size: 12px;
  color: #909399;
}
.comment-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
}
.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #909399;
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
