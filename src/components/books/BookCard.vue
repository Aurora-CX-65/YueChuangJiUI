<template>
  <div class="book-card" :class="{ 'list-view': listView }">
    <div class="card h-100" @click="goToBookDetail">
      <div class="book-card-content">
        <!-- 左侧：书籍封面 -->
        <div class="book-cover-section">
          <div class="book-cover-container">
            <img 
              :src="bookCover" 
              :alt="book.title"
              class="book-cover"
              @error="handleImageError"
            >
            <div class="book-status-badge" v-if="book.status">
              <span class="badge" :class="statusClass">
                {{ statusText }}
              </span>
            </div>
            <div class="book-overlay">
              <div class="overlay-content">
                <button class="btn btn-sm btn-outline-light me-2" @click.stop="toggleFavorite">
                  <i :class="favoriteIcon"></i>
                </button>
                <button class="btn btn-sm btn-outline-light" @click.stop="addToReadingList">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧：书籍信息 -->
        <div class="book-info-section">
          <!-- 书名 -->
          <h6 class="book-title" :title="book.title">
            {{ book.title }}
          </h6>
          
          <!-- 作者信息 -->
          <div class="book-author">
            <i class="fas fa-user me-1"></i>
            <span @click.stop="goToAuthorPage">{{ displayAuthorName }}</span>
          </div>
          
          <!-- 分类 -->
          <div class="book-category" v-if="book.categoryName">
            <i class="fas fa-folder me-1"></i>
            <span class="category-name">{{ book.categoryName }}</span>
          </div>
          
          
          <!-- 标签已移除 -->
          
          <!-- 书籍统计信息 -->
          <div class="book-stats">
            <div class="stat-item" v-if="book.wordCount">
              <i class="fas fa-file-alt me-1"></i>
              <span>{{ formatWordCount(book.wordCount) }}</span>
            </div>
            <div class="stat-item" v-if="book.chapterCount">
              <i class="fas fa-list me-1"></i>
              <span>{{ book.chapterCount }}章</span>
            </div>
            <div class="stat-item" v-if="book.rating">
              <i class="fas fa-star me-1"></i>
              <span>{{ book.rating.toFixed(1) }}</span>
            </div>
            <div class="stat-item" v-if="book.readCount">
              <i class="fas fa-eye me-1"></i>
              <span>{{ formatNumber(book.readCount) }}</span>
            </div>
          </div>
          
          <!-- 简介（仅列表视图显示） -->
          <div v-if="listView && book.description" class="book-description">
            {{ truncateText(book.description, 100) }}
          </div>
          
          <!-- 更新时间 -->
          <div class="book-update-time" v-if="book.updateTime">
          <i class="fas fa-clock"></i>
          <span>{{ formatUpdateTime(book.updateTime) }}</span>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default {
  name: 'BookCard',
  props: {
    book: {
      type: Object,
      required: true
    },
    listView: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      imageError: false
    }
  },
  computed: {
    /**
     * 书籍封面图片
     */
    bookCover() {
      if (this.imageError || !this.book.coverImage) {
        return '/images/default_book_cover.svg'
      }
      return this.book.coverImage
    },

    /**
     * 状态样式类
     */
    statusClass() {
      switch (this.book.status) {
        case 'serializing':
        case 'ongoing':
          return 'bg-success'
        case 'completed':
          return 'bg-primary'
        case 'published':
          return 'bg-info'
        case 'paused':
        case 'suspended':
          return 'bg-warning'
        case 'draft':
          return 'bg-secondary'
        case 'pending_review':
          return 'bg-warning'
        default:
          return 'bg-secondary'
      }
    },

    /**
     * 状态文本
     */
    statusText() {
      switch (this.book.status) {
        case 'serializing':
        case 'ongoing':
          return '连载中'
        case 'completed':
          return '已完结'
        case 'published':
          return '已发布'
        case 'paused':
        case 'suspended':
          return '暂停'
        case 'draft':
          return '草稿'
        case 'pending_review':
          return '待审核'
        default:
          return '未知'
      }
    },

    /**
     * 收藏图标
     */
    favoriteIcon() {
      return this.book.isFavorited ? 'fas fa-heart text-danger' : 'far fa-heart'
    },

    /* displayTags计算属性已移除 */

    /**
     * 显示的作者名称
     */
    displayAuthorName() {
      // 优先显示笔名，其次是用户名，最后是默认值
      return this.book.penName || this.book.authorUsername || '匿名作者'
    }
  },
  methods: {
    /**
     * 处理图片加载错误
     */
    handleImageError() {
      this.imageError = true
    },

    /**
     * 跳转到书籍详情页
     */
    goToBookDetail() {
      this.$router.push(`/books/${this.book.id}`)
    },

    /**
     * 跳转到作者页面
     */
    goToAuthorPage() {
      if (this.book.authorId) {
        this.$router.push(`/authors/${this.book.authorId}`)
      }
    },

    /* searchByTag方法已移除 */

    /**
     * 切换收藏状态
     */
    async toggleFavorite() {
      try {
        // 这里应该调用收藏API
        this.book.isFavorited = !this.book.isFavorited
        const action = this.book.isFavorited ? '收藏' : '取消收藏'
        this.$toast.success(`${action}成功`)
      } catch (error) {
        console.error('收藏操作失败:', error)
        this.$toast.error('操作失败，请稍后重试')
      }
    },

    /**
     * 添加到阅读列表
     */
    async addToReadingList() {
      try {
        // 这里应该调用添加到阅读列表的API
        this.$toast.success('已添加到阅读列表')
      } catch (error) {
        console.error('添加到阅读列表失败:', error)
        this.$toast.error('操作失败，请稍后重试')
      }
    },

    /**
     * 格式化字数
     */
    formatWordCount(count) {
      if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万字'
      }
      return count + '字'
    },

    /**
     * 格式化数字
     */
    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k'
      }
      return num.toString()
    },

    /**
     * 格式化更新时间
     */
    formatUpdateTime(dateString) {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        // 检查日期是否有效
        if (isNaN(date.getTime())) {
          return ''
        }
        return formatDistanceToNow(date, { 
          addSuffix: true, 
          locale: zhCN 
        })
      } catch (error) {
        console.warn('日期格式化错误:', error)
        return ''
      }
    },

    /**
     * 截断文本
     */
    truncateText(text, maxLength) {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }
  }
}
</script>

<style scoped>
.book-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.book-card:hover {
  transform: translateY(-2px);
}

/* 旧的列表视图样式已移除，使用新的左右布局 */

.card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  height: 200px; /* 固定卡片高度 */
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-color: #007bff;
}

.book-card-content {
  display: flex;
  height: 100%;
}

.book-cover-section {
  width: 140px; /* 固定封面宽度 */
  flex-shrink: 0;
}

.book-cover-container {
  position: relative;
  overflow: hidden;
  height: 100%;
  border-radius: 8px 0 0 8px;
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
  background-color: #f8f9fa;
}

.book-info-section {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.book-card:hover .book-cover {
  transform: scale(1.05);
}

.book-status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.book-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.book-card:hover .book-overlay {
  opacity: 1;
}

.overlay-content {
  display: flex;
  gap: 10px;
}

/* card-body样式已移除，使用book-info-section替代 */

.book-title {
  font-size: 15px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 39px;
}

.book-author {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 6px;
  font-weight: 500;
}

.book-author span {
  cursor: pointer;
  transition: color 0.2s ease;
}

.book-author span:hover {
  color: #007bff;
}

.book-category {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.category-name {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

/* main-stats相关样式已移除，避免重复显示 */

/* book-tags相关样式已移除 */

.book-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f1f3f4;
}

.stat-item {
  font-size: 10px;
  color: #6c757d;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.book-description {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 10px;
}

.book-update-time {
  font-size: 10px;
  color: #999;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid #f8f9fa;
}

/* 列表视图特殊样式 */
.book-card.list-view .card {
  height: 160px; /* 列表视图稍微矮一些 */
}

.book-card.list-view .book-cover-section {
  width: 100px; /* 列表视图封面更窄 */
}

.book-card.list-view .book-info-section {
  padding: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .book-card.list-view .card {
    flex-direction: column;
  }
  
  .book-card.list-view .book-cover-container {
    width: 100%;
  }
  
  .book-card.list-view .book-cover {
    height: 200px;
  }
  
  .book-overlay {
    display: none;
  }
}
</style>