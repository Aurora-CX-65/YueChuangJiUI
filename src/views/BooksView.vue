<template>
  <div class="books-view">
    <el-container class="books-container">
      <!-- 左侧筛选区域 -->
      <el-aside width="280px" class="filter-aside">
        <el-card class="filter-card" shadow="never">
          <BookFilter 
            @filter-change="handleFilterChange"
            :loading="loading"
            :initial-filters="filters"
          />
        </el-card>
      </el-aside>
      
      <!-- 右侧主内容区域 -->
      <el-main class="books-main">
        <!-- 上部：搜索框区域 -->
        <el-card class="search-card" shadow="never">
          <BookSearch 
            @search="handleSearch"
            @reset="handleReset"
            :loading="loading"
            :value="filters.keyword"
            @input="filters.keyword = $event"
          />
        </el-card>
        
        <!-- 下部：书籍列表区域 -->
        <el-card class="books-card" shadow="never">
              <!-- 排序和视图切换工具栏 -->
              <div class="toolbar">
                <div class="toolbar-content">
                  <div class="results-info">
                    <el-text type="info" size="small">
                      共找到 {{ totalBooks }} 本书籍
                    </el-text>
                  </div>
                  <div class="view-controls">
                    <el-space>
                      <!-- 排序选择 -->
                      <el-radio-group 
                        v-model="sortBy" 
                        @change="changeSortBy"
                        size="small"
                      >
                        <el-radio-button value="latest">
                          <el-icon><Clock /></el-icon>
                          最新
                        </el-radio-button>
                        <el-radio-button value="popular">
                          <el-icon><Star /></el-icon>
                          热门
                        </el-radio-button>
                        <el-radio-button value="rating">
                          <el-icon><Trophy /></el-icon>
                          评分
                        </el-radio-button>
                      </el-radio-group>
                      
                      <!-- 视图切换 -->
                      <el-radio-group 
                        v-model="viewMode" 
                        @change="changeViewMode"
                        size="small"
                      >
                        <el-radio-button value="grid">
                          <el-icon><Grid /></el-icon>
                        </el-radio-button>
                        <el-radio-button value="list">
                          <el-icon><List /></el-icon>
                        </el-radio-button>
                      </el-radio-group>
                    </el-space>
                  </div>
                </div>
              </div>
              
              <!-- 书籍列表 -->
              <div class="books-list" :class="viewMode + '-view'">
                <!-- 加载状态 -->
                <div v-if="loading" class="loading-container">
                  <el-skeleton :rows="6" animated />
                </div>
                
                <!-- 空状态 -->
                <el-empty 
                  v-else-if="books.length === 0" 
                  description="暂无书籍"
                  class="empty-state"
                >
                  <template #image>
                    <el-icon size="80" color="#c0c4cc">
                      <Reading />
                    </el-icon>
                  </template>
                  <template #description>
                    <el-text type="info">尝试调整筛选条件或搜索关键词</el-text>
                  </template>
                </el-empty>
                
                <!-- 书籍内容 -->
                <div v-else>
                  <!-- 网格视图 -->
                  <el-row v-if="viewMode === 'grid'" :gutter="20" class="books-grid">
                    <el-col 
                      v-for="book in books" 
                      :key="book.id"
                      :xl="6" 
                      :lg="8" 
                      :md="12" 
                      :sm="12" 
                      :xs="24"
                      class="book-col"
                    >
                      <BookCard :book="book" />
                    </el-col>
                  </el-row>
                  
                  <!-- 列表视图 -->
                  <div v-else class="books-list-view">
                    <BookCard 
                      v-for="book in books" 
                      :key="book.id"
                      :book="book" 
                      :list-view="true"
                      class="book-list-item"
                    />
                  </div>
                </div>
              </div>
              
              <!-- 分页组件 -->
              <div v-if="totalPages > 1" class="pagination-section">
                <el-pagination
                  v-model:current-page="currentPage"
                  :page-size="pageSize"
                  :total="totalBooks"
                  :page-sizes="[12, 24, 48, 96]"
                  layout="total, sizes, prev, pager, next, jumper"
                  background
                  @size-change="handleSizeChange"
                  @current-change="handlePageChange"
                  class="books-pagination"
                />
              </div>
            </el-card>
          </el-main>
        </el-container>
      </div>
    </template>

<script>
import BookFilter from '../components/books/BookFilter.vue'
import BookSearch from '../components/books/BookSearch.vue'
import BookCard from '../components/books/BookCard.vue'
import { BookService } from '../services/book-service'
import { TagService } from '../services/tag-service'
import { Reading, Grid, List } from '@element-plus/icons-vue'

export default {
  name: 'BooksView',
  components: {
    BookFilter,
    BookSearch,
    BookCard,
    Reading,
    Grid,
    List
  },
  data() {
    return {
      books: [],
      loading: false,
      currentPage: 1,
      totalPages: 1,
      totalBooks: 0,
      pageSize: 12,
      viewMode: 'grid', // 'grid' 或 'list'
      sortBy: 'latest', // 'latest', 'popular', 'rating'
      filters: {
        categoryId: '',
        tagIds: [],
        status: '',
        keyword: ''
      }
    }
  },
  mounted() {
    // 检查URL参数中是否有搜索关键词
    const keyword = this.$route.query.keyword
    if (keyword) {
      this.filters.keyword = keyword
    }
    
    // 检查URL参数中是否有分类ID
    const categoryId = this.$route.query.categoryId
    if (categoryId) {
      this.filters.categoryId = categoryId
    }
    
    // 检查URL参数中是否有标签名称
    const tagName = this.$route.query.tag
    if (tagName) {
      this.handleTagSearch(tagName)
    }
    
    this.loadBooks()
    this.loadViewMode()
  },
  watch: {
    /**
     * 监听路由变化，处理搜索和分类联动
     */
    '$route'(to, from) {
      let needReload = false
      
      // 处理搜索关键词变化
      const keyword = to.query.keyword
      if (keyword && keyword !== this.filters.keyword) {
        this.filters.keyword = keyword
        needReload = true
      }
      
      // 处理分类ID变化
      const categoryId = to.query.categoryId
      if (categoryId && categoryId !== this.filters.categoryId) {
        this.filters.categoryId = categoryId
        needReload = true
      }
      
      // 处理标签变化
      const tagName = to.query.tag
      if (tagName && tagName !== from.query.tag) {
        this.handleTagSearch(tagName)
        needReload = true
      }
      
      if (needReload) {
        this.currentPage = 1
        this.loadBooks()
      }
    }
  },
  methods: {
    /**
     * 加载书籍列表
     */
    async loadBooks() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          sortBy: this.sortBy,
          ...this.filters
        }
        
        const response = await BookService.searchBooks(params)
        
        // 更新书籍列表 - 响应拦截器已经提取了data部分
        this.books = response.records || []
        this.totalPages = response.pages || 0
        this.totalBooks = response.total || 0
      } catch (error) {
        console.error('加载书籍失败:', error)
        this.$toast.error('加载书籍失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 处理筛选条件变化
     */
    handleFilterChange(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      this.currentPage = 1
      this.loadBooks()
    },
    
    /**
     * 处理搜索
     */
    handleSearch(keyword) {
      this.filters.keyword = keyword
      this.currentPage = 1
      this.loadBooks()
    },
    
    /**
     * 处理重置
     */
    handleReset() {
      // 清空所有筛选条件
      this.filters = {
        categoryId: '',
        tagIds: [],
        status: '',
        keyword: ''
      }
      this.currentPage = 1
      this.loadBooks()
    },
    
    /**
     * 处理分页变化
     */
    handlePageChange(page) {
      this.currentPage = page
      this.loadBooks()
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    
    /**
     * 改变排序方式
     */
    changeSortBy(sortBy) {
      this.sortBy = sortBy
      this.currentPage = 1
      this.loadBooks()
    },
    
    /**
     * 改变视图模式
     */
    changeViewMode(mode) {
      this.viewMode = mode
      this.saveViewMode()
    },
    
    /**
     * 保存视图模式到本地存储
     */
    saveViewMode() {
      localStorage.setItem('books-view-mode', this.viewMode)
    },
    
    /**
     * 从本地存储加载视图模式
     */
    loadViewMode() {
      const savedMode = localStorage.getItem('books-view-mode')
      if (savedMode && ['grid', 'list'].includes(savedMode)) {
        this.viewMode = savedMode
      }
    },
    
    /**
     * 处理分页大小变化
     */
    handleSizeChange(newSize) {
      this.pageSize = newSize
      this.currentPage = 1
      this.loadBooks()
    },
    
    /**
     * 处理标签搜索
     */
    async handleTagSearch(tagName) {
      try {
        // 根据标签名称搜索标签，获取标签ID
        const tags = await TagService.searchTags(tagName, 1)
        if (tags && tags.length > 0) {
          const tag = tags.find(t => t.name === tagName)
          if (tag) {
            // 清空其他筛选条件，只保留标签筛选
            this.filters = {
              categoryId: '',
              tagIds: [tag.id],
              status: '',
              keyword: ''
            }
          }
        }
      } catch (error) {
        console.error('处理标签搜索失败:', error)
        // 如果获取标签ID失败，使用关键词搜索作为备选方案
        this.filters.keyword = tagName
        this.filters.tagIds = []
      }
    }
  }
}
</script>

<style scoped>
.books-view {
  padding: 20px;
}

.books-container {
  min-height: 100vh;
  align-items: flex-start;
}

.filter-aside {
  margin-right: 20px;
}

.filter-card {
  position: fixed;
  top: var(--header-height);
  left: 20px;
  width: 280px;
  height: fit-content;
  max-height: calc(100vh - var(--header-height) - 20px);
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 900;
}

.books-main {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-card {
  border: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.books-card {
  border: 1px solid #e4e7ed;
  flex: 1;
  min-height: 500px;
}

.toolbar {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-info {
  font-size: 14px;
  color: #606266;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 书籍列表样式 */
.books-list {
  min-height: 400px;
}

.loading-container {
  padding: 20px;
}

.empty-state {
  padding: 60px 20px;
}

.books-grid {
  margin-bottom: 20px;
}

.book-col {
  margin-bottom: 20px;
}

.books-list-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.book-list-item {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.book-list-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* 分页样式 */
.pagination-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
}

.books-pagination {
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .books-view {
    padding: 16px;
  }
  
  .books-container {
    flex-direction: column;
    height: auto;
  }
  
  .filter-aside {
    width: 100% !important;
    margin-right: 0;
    margin-bottom: 20px;
  }
  
  .filter-card {
    position: static;
    width: 100% !important;
    left: auto !important;
    top: auto !important;
    max-height: none !important;
  }
  
  .books-main {
    padding: 0;
  }
  
  .toolbar-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .view-controls {
    justify-content: center;
  }
  
  .books-pagination {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 992px) {
  .filter-aside {
    width: 320px;
  }
  
  .books-view {
    padding: 15px;
  }
}
</style>