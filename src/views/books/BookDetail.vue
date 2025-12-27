<template>
  <div class="book-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 书籍详情内容 -->
    <div v-else-if="book" class="book-detail-content">
      <!-- 书籍基本信息 -->
      <el-card class="book-info-card" shadow="hover">
        <div class="book-header">
          <div class="book-cover">
            <el-image
              :src="book.coverImage || defaultCover"
              :alt="book.title"
              fit="cover"
              class="cover-image"
              @error="handleImageError"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>封面加载失败</span>
                </div>
              </template>
            </el-image>
          </div>

          <div class="book-info">
            <h1 class="book-title">{{ book.title }}</h1>
            
            <div class="book-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span class="label">作者：</span>
                <el-link 
                  type="primary" 
                  @click="goToAuthor"
                  class="author-link"
                >
                  {{ displayAuthorName }}
                </el-link>
              </div>

              <div class="meta-item">
                <el-icon><Collection /></el-icon>
                <span class="label">分类：</span>
                <el-tag type="info" size="small">{{ book.categoryName || '未分类' }}</el-tag>
              </div>

              <div class="meta-item">
                <el-icon><Document /></el-icon>
                <span class="label">状态：</span>
                <el-tag :type="statusTagType" size="small">{{ statusText }}</el-tag>
              </div>

              <div class="meta-item">
                <el-icon><Reading /></el-icon>
                <span class="label">字数：</span>
                <span>{{ formatWordCount(book.wordCount) }}</span>
              </div>

              <div class="meta-item">
                <el-icon><Notebook /></el-icon>
                <span class="label">章节：</span>
                <span>{{ book.chapterCount || 0 }}章</span>
              </div>

              <div class="meta-item">
                <el-icon><View /></el-icon>
                <span class="label">阅读：</span>
                <span>{{ formatCount(book.viewCount) }}</span>
              </div>
            </div>

            <!-- 标签 -->
            <div v-if="book.tags && book.tags.length > 0" class="book-tags">
              <el-icon><PriceTag /></el-icon>
              <span class="label">标签：</span>
              <el-tag
                v-for="tag in book.tags"
                :key="tag.id"
                size="small"
                class="tag-item"
              >
                {{ tag.name }}
              </el-tag>
            </div>

            <!-- 操作按钮 -->
            <div class="book-actions">
              <el-button
                type="primary"
                size="large"
                @click="startReading"
                :disabled="!hasChapters"
              >
                <el-icon><Reading /></el-icon>
                开始阅读
              </el-button>

              <el-button
                :type="book.isLiked ? 'danger' : 'default'"
                size="large"
                @click="toggleLike"
                :loading="likeLoading"
              >
                <el-icon><StarFilled v-if="book.isLiked" /><Star v-else /></el-icon>
                {{ book.isLiked ? '已点赞' : '点赞' }}
                <span class="count">({{ formatCount(book.likeCount) }})</span>
              </el-button>

              <el-button
                :type="book.isFavorited ? 'warning' : 'default'"
                size="large"
                @click="toggleFavorite"
                :loading="favoriteLoading"
              >
                <el-icon><Collection v-if="book.isFavorited" /><Plus v-else /></el-icon>
                {{ book.isFavorited ? '已收藏' : '收藏' }}
                <span class="count">({{ formatCount(book.favoriteCount) }})</span>
              </el-button>

              <el-button size="large" @click="shareBook">
                <el-icon><Share /></el-icon>
                分享
              </el-button>
            </div>
          </div>
        </div>

        <!-- 书籍简介 -->
        <div class="book-description">
          <h3>
            <el-icon><Document /></el-icon>
            作品简介
          </h3>
          <div class="description-content">
            <p v-if="book.description" class="description-text">
              {{ book.description }}
            </p>
            <p v-else class="no-description">
              暂无简介
            </p>
          </div>
        </div>
      </el-card>

      <!-- 章节列表 -->
      <el-card class="chapters-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3>
              <el-icon><Notebook /></el-icon>
              章节目录
              <span class="chapter-count">(共{{ chapters.length }}章)</span>
            </h3>
            <div class="chapter-actions">
              <el-button
                size="small"
                @click="toggleChapterOrder"
              >
                <el-icon><Sort /></el-icon>
                {{ isAscOrder ? '倒序' : '正序' }}
              </el-button>
            </div>
          </div>
        </template>

        <div v-if="chaptersLoading" class="chapters-loading">
          <el-skeleton :rows="5" animated />
        </div>

        <div v-else-if="chapters.length > 0" class="chapters-list">
          <div
            v-for="(chapter, index) in sortedChapters"
            :key="chapter.id"
            class="chapter-item"
            @click="goToChapter(chapter.id)"
          >
            <div class="chapter-info">
              <span class="chapter-number">第{{ chapter.sortOrder || index + 1 }}章</span>
              <span class="chapter-title">{{ chapter.title }}</span>
              <el-tag
                v-if="chapter.status !== 'published'"
                :type="getChapterStatusType(chapter.status)"
                size="small"
                class="chapter-status"
              >
                {{ getChapterStatusText(chapter.status) }}
              </el-tag>
            </div>
            <div class="chapter-meta">
              <span class="chapter-words">{{ formatWordCount(chapter.wordCount) }}</span>
              <span class="chapter-time">{{ formatTime(chapter.updatedAt) }}</span>
              <el-icon class="chapter-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>

        <div v-else class="no-chapters">
          <el-empty description="暂无章节" />
        </div>
      </el-card>

      <!-- 评论区 -->
      <el-card class="comments-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3>
              <el-icon><ChatDotRound /></el-icon>
              读者评论
              <span class="comment-count">({{ comments.length }}条)</span>
            </h3>
          </div>
        </template>

        <!-- 发表评论 -->
        <div v-if="userStore.isLoggedIn" class="comment-form">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
            maxlength="500"
            show-word-limit
            class="comment-input"
          />
          <div class="comment-actions">
            <el-rate 
              v-model="newRating" 
              show-text 
              :texts="['极差', '失望', '一般', '满意', '惊喜']"
            />
            <el-button
              type="primary"
              @click="submitComment"
              :loading="commentSubmitting"
              :disabled="!newComment.trim()"
            >
              发表评论
            </el-button>
          </div>
        </div>

        <div v-else class="login-prompt">
          <el-alert
            title="请先登录后再发表评论"
            type="info"
            show-icon
            :closable="false"
          >
            <template #default>
              <el-button type="primary" size="small" @click="goToLogin">
                立即登录
              </el-button>
            </template>
          </el-alert>
        </div>

        <!-- 评论列表 -->
        <div v-if="commentsLoading" class="comments-loading">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="comments.length > 0" class="comments-list">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
          >
            <div class="comment-avatar" @click="goToUser(comment.userId)">
              <el-avatar :src="comment.avatar" :size="40">
                <el-icon><User /></el-icon>
              </el-avatar>
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author" @click="goToUser(comment.userId)">{{ comment.nickname || '匿名用户' }}</span>
                <el-tag 
                  v-if="userStore.userInfo?.id === comment.userId" 
                  size="small" 
                  type="primary" 
                  effect="plain" 
                  class="me-tag"
                >
                  我
                </el-tag>
                <el-rate
                  v-if="comment.rating"
                  :model-value="comment.rating"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}分"
                  size="small"
                  class="comment-rating"
                />
                <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
              </div>
              <div class="comment-text">{{ comment.content }}</div>
            </div>
          </div>
        </div>

        <div v-else class="no-comments">
          <el-empty description="暂无评论，快来抢沙发吧！" />
        </div>
      </el-card>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-result
        icon="error"
        title="书籍不存在"
        sub-title="抱歉，您访问的书籍不存在或已被删除"
      >
        <template #extra>
          <el-button type="primary" @click="goBack">返回上一页</el-button>
          <el-button @click="goHome">回到首页</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user-store.js'
import { useBookStore } from '@/stores/book-store.js'
import { useChapterStore } from '@/stores/chapter-store.js'
import { useCommentStore } from '@/stores/comment-store.js'

import { BookService } from '@/services/book-service.js'
import { ReadingProgressService } from '@/services/reading-progress-service.js'
import { ChapterService } from '@/services/chapter-service.js'
import { CommentService } from '@/services/comment-service.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Picture,
  User,
  Collection,
  Document,
  Reading,
  Notebook,
  View,
  PriceTag,
  StarFilled,
  Star,
  Plus,
  Share,
  Sort,
  ArrowRight,
  ChatDotRound
} from '@element-plus/icons-vue'

// 路由和状态管理
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const bookStore = useBookStore()
const chapterStore = useChapterStore()
const commentStore = useCommentStore()

// 响应式数据
const loading = ref(true)
const book = ref(null)
const chapters = ref([])
const comments = ref([])
const chaptersLoading = ref(false)
const commentsLoading = ref(false)
const likeLoading = ref(false)
const favoriteLoading = ref(false)
const commentSubmitting = ref(false)
const isAscOrder = ref(true)
const newComment = ref('')
const newRating = ref(5)

// 默认封面
const defaultCover = '/images/default_book_cover.svg'

// 计算属性
const bookId = computed(() => parseInt(route.params.id))

const displayAuthorName = computed(() => {
  return book.value?.penName || book.value?.authorUsername || '匿名作者'
})

const statusText = computed(() => {
  if (!book.value?.status) return '未知'
  
  const statusMap = {
    'draft': '草稿',
    'pending_review': '待审核',
    'published': '已发布',
    'serializing': '连载中',
    'completed': '已完结',
    'suspended': '已暂停'
  }
  
  return statusMap[book.value.status] || '未知'
})

const statusTagType = computed(() => {
  if (!book.value?.status) return 'info'
  
  const typeMap = {
    'draft': 'info',
    'pending_review': 'warning',
    'published': 'success',
    'serializing': 'primary',
    'completed': 'success',
    'suspended': 'danger'
  }
  
  return typeMap[book.value.status] || 'info'
})

const hasChapters = computed(() => {
  return chapters.value.length > 0
})

const sortedChapters = computed(() => {
  const sorted = [...chapters.value]
  return isAscOrder.value 
    ? sorted.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    : sorted.sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0))
})

// 方法
const loadBookDetail = async () => {
  try {
    loading.value = true
    const bookData = await BookService.getBookById(bookId.value)
    book.value = bookData
    
    // 同时加载章节和评论
    await Promise.all([
      loadChapters(),
      loadComments()
    ])
  } catch (error) {
    console.error('加载书籍详情失败:', error)
    ElMessage.error('加载书籍详情失败')
    book.value = null
  } finally {
    loading.value = false
  }
}

const loadChapters = async () => {
  try {
    chaptersLoading.value = true
    const chaptersData = await ChapterService.getChaptersByBookId(bookId.value, 1, 100)
    chapters.value = chaptersData?.records || []
  } catch (error) {
    console.error('加载章节列表失败:', error)
    chapters.value = []
  } finally {
    chaptersLoading.value = false
  }
}

const loadComments = async () => {
  try {
    commentsLoading.value = true
    const commentsData = await CommentService.getBookComments(bookId.value, 1, 20)
    comments.value = commentsData?.records || []
  } catch (error) {
    console.error('加载评论失败:', error)
    comments.value = []
  } finally {
    commentsLoading.value = false
  }
}

const handleImageError = () => {
  // 图片加载错误处理已在模板中处理
}

const formatWordCount = (count) => {
  if (!count) return '0字'
  if (count < 10000) return `${count}字`
  return `${(count / 10000).toFixed(1)}万字`
}

const formatCount = (count) => {
  if (!count) return '0'
  if (count < 10000) return count.toString()
  return `${(count / 10000).toFixed(1)}万`
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString()
}

const goToAuthor = () => {
  if (book.value?.authorId) {
    router.push(`/users/${book.value.authorId}`)
  }
}

const startReading = async () => {
  if (!hasChapters.value) {
    ElMessage.warning('暂无可阅读的章节')
    return
  }
  
  // 尝试获取阅读进度
  if (userStore.isLoggedIn) {
    try {
      const progress = await ReadingProgressService.getReadingProgress(bookId.value)
      if (progress && progress.chapterId) {
        router.push(`/books/${bookId.value}/chapters/${progress.chapterId}`)
        return
      }
    } catch (e) {
      console.error('获取阅读进度失败', e)
    }
  }
  
  const firstChapter = sortedChapters.value[0]
  if (firstChapter) {
    router.push(`/books/${bookId.value}/chapters/${firstChapter.id}`)
  }
}

const toggleLike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  
  try {
    likeLoading.value = true
    
    if (book.value.isLiked) {
      await BookService.unlikeBook(bookId.value)
      book.value.isLiked = false
      book.value.likeCount = Math.max(0, (book.value.likeCount || 0) - 1)
      ElMessage.success('取消点赞成功')
    } else {
      await BookService.likeBook(bookId.value)
      book.value.isLiked = true
      book.value.likeCount = (book.value.likeCount || 0) + 1
      ElMessage.success('点赞成功')
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    likeLoading.value = false
  }
}

const toggleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  
  try {
    favoriteLoading.value = true
    
    if (book.value.isFavorited) {
      await BookService.unfavoriteBook(bookId.value)
      book.value.isFavorited = false
      book.value.favoriteCount = Math.max(0, (book.value.favoriteCount || 0) - 1)
      ElMessage.success('取消收藏成功')
    } else {
      await BookService.favoriteBook(bookId.value)
      book.value.isFavorited = true
      book.value.favoriteCount = (book.value.favoriteCount || 0) + 1
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    favoriteLoading.value = false
  }
}

const shareBook = async () => {
  try {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('分享失败')
  }
}

const toggleChapterOrder = () => {
  isAscOrder.value = !isAscOrder.value
}

const goToChapter = (chapterId) => {
  router.push(`/books/${bookId.value}/chapters/${chapterId}`)
}

const getChapterStatusType = (status) => {
  const typeMap = {
    'draft': 'info',
    'pending_review': 'warning',
    'published': 'success'
  }
  return typeMap[status] || 'info'
}

const getChapterStatusText = (status) => {
  const textMap = {
    'draft': '草稿',
    'pending_review': '待审核',
    'published': '已发布'
  }
  return textMap[status] || '未知'
}

const submitComment = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  try {
    commentSubmitting.value = true
    
    await CommentService.addComment(bookId.value, {
      content: newComment.value.trim(),
      rating: newRating.value
    })
    
    ElMessage.success('评论发表成功')
    newComment.value = ''
    newRating.value = 5
    
    // 重新加载评论
    await loadComments()
  } catch (error) {
    console.error('发表评论失败:', error)
    ElMessage.error('发表评论失败，请稍后重试')
  } finally {
    commentSubmitting.value = false
  }
}

const goToLogin = () => {
  router.push('/auth/login')
}

const goToUser = (userId) => {
  if (userId) {
    router.push(`/users/${userId}`)
  }
}

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/')
}

// 生命周期
onMounted(() => {
  loadBookDetail()
})

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadBookDetail()
  }
})
</script>

<style scoped>
.book-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container,
.error-container {
  padding: 40px 20px;
}

.book-detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 书籍信息卡片 */
.book-info-card {
  margin-bottom: 20px;
}

.book-header {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.book-cover {
  flex-shrink: 0;
  width: 200px;
  height: 280px;
}

.cover-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  background: #f5f7fa;
  border-radius: 8px;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.book-title {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 0;
  line-height: 1.3;
}

.book-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.meta-item .el-icon {
  color: #909399;
}

.label {
  font-weight: 500;
  min-width: 40px;
}

.author-link {
  font-weight: 500;
}

.book-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-item {
  margin-right: 8px;
}

.book-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.book-actions .el-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.count {
  font-size: 12px;
  opacity: 0.8;
}

.book-description {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.book-description h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: #303133;
  margin: 0 0 15px 0;
}

.description-content {
  line-height: 1.6;
  color: #606266;
}

.description-text {
  margin: 0;
  white-space: pre-wrap;
}

.no-description {
  color: #909399;
  font-style: italic;
  margin: 0;
}

/* 章节列表卡片 */
.chapters-card,
.comments-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: #303133;
  margin: 0;
}

.chapter-count,
.comment-count {
  font-size: 14px;
  color: #909399;
  font-weight: normal;
}

.chapters-loading,
.comments-loading {
  padding: 20px 0;
}

.chapters-list {
  display: flex;
  flex-direction: column;
}

.chapter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chapter-item:hover {
  background-color: #f8f9fa;
}

.chapter-item:last-child {
  border-bottom: none;
}

.chapter-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.chapter-number {
  font-size: 14px;
  color: #909399;
  min-width: 60px;
}

.chapter-title {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

.chapter-status {
  margin-left: 8px;
}

.chapter-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.chapter-arrow {
  color: #c0c4cc;
}

.no-chapters,
.no-comments {
  padding: 40px 0;
}

/* 评论区 */
.comment-form {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.comment-input {
  margin-bottom: 15px;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-prompt {
  margin-bottom: 30px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-avatar {
  cursor: pointer;
}

.comment-author {
  font-weight: 500;
  color: #303133;
  cursor: pointer;
}

.comment-author:hover {
  color: var(--el-color-primary);
}

.me-tag {
  margin-right: 8px;
}

.comment-rating {
  margin: 0;
}

.comment-time {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}

.comment-text {
  color: #606266;
  line-height: 1.5;
  white-space: pre-wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .book-detail-container {
    padding: 15px;
  }

  .book-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .book-cover {
    width: 160px;
    height: 224px;
  }

  .book-title {
    font-size: 24px;
  }

  .book-actions {
    justify-content: center;
  }

  .book-actions .el-button {
    flex: 1;
    min-width: 0;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .chapter-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .chapter-meta {
    align-self: flex-end;
  }

  .comment-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
</style>
