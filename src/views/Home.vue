<template>
  <div class="home">
    <section class="carousel-section" v-if="banners.length > 0">
      <el-carousel trigger="click" height="360px" :interval="5000" arrow="hover">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div class="banner-item" @click="handleBannerClick(banner)">
            <el-image :src="banner.imageUrl" fit="cover" class="banner-image" />
            <div class="banner-overlay" v-if="banner.title">
              <h3 class="banner-title">{{ banner.title }}</h3>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>
    
    <section class="popular-categories">
      <div class="section-header">
        <h2>热门分类</h2>
        <el-button 
          type="primary" 
          link 
          @click="goToBooks"
          class="more-button"
        >
          获取更多
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="categories-container">
        <!-- 加载状态 -->
        <div v-if="categoryStore.isLoading" class="loading-state">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        
        <!-- 分类列表 -->
        <div v-else-if="displayCategories.length > 0" class="categories-grid" ref="categoriesGrid">
          <router-link 
            v-for="category in visibleCategories" 
            :key="category.id"
            :to="{ path: '/books', query: { categoryId: category.id } }"
            class="category-card"
          >
            <div class="category-icon">
              <el-icon><Collection /></el-icon>
            </div>
            <div class="category-info">
              <h3 class="category-name">{{ category.name }}</h3>
            </div>
          </router-link>
          
          <!-- 省略号卡片 -->
          <div 
            v-if="hasMoreCategories" 
            class="category-card more-card"
            @click="goToBooks"
          >
            <div class="category-icon">
              <el-icon><MoreFilled /></el-icon>
            </div>
            <div class="category-info">
              <h3 class="category-name">...</h3>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else class="empty-state">
          <el-icon><FolderOpened /></el-icon>
          <p>暂无分类数据</p>
        </div>
      </div>
    </section>
    
    <section class="popular-books">
      <div class="section-header">
        <h2>热门书籍</h2>
        <el-button 
          type="primary" 
          link 
          @click="goToBooks"
          class="more-button"
        >
          获取更多
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>
      
      <div class="books-container">
        <!-- 加载状态 -->
        <div v-if="booksLoading" class="loading-state">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        
        <!-- 热门书籍列表 -->
        <div v-else-if="hotBooks.length > 0" class="books-grid">
          <div 
            v-for="book in hotBooks" 
            :key="book.id"
            class="book-item"
          >
            <BookCard :book="book" />
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else class="empty-state">
          <el-icon><Reading /></el-icon>
          <p>暂无热门书籍</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { computed, onMounted, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCategoryStore } from '@/stores/category-store.js'
import { BookService } from '@/services/book-service.js'
import { BannerService } from '@/services/banner-service.js'
import BookCard from '@/components/books/BookCard.vue'
import { Loading, Collection, FolderOpened, ArrowRight, MoreFilled, Reading } from '@element-plus/icons-vue'

export default {
  name: 'Home',
  components: {
    BookCard,
    Loading,
    Collection,
    FolderOpened,
    ArrowRight,
    MoreFilled,
    Reading
  },
  setup() {
    const categoryStore = useCategoryStore()
    const router = useRouter()
    const categoriesGrid = ref(null)
    const maxVisibleCategories = ref(5) // 默认显示5个
    
    // 轮播图状态
    const banners = ref([])

    // 热门书籍相关状态
    const hotBooks = ref([])
    const booksLoading = ref(false)
    
    // 获取热门分类
    const popularCategories = computed(() => categoryStore.popularCategories)
    
    // 显示的分类数据（所有分类）
    const displayCategories = computed(() => {
      return popularCategories.value
    })
    
    // 根据屏幕宽度计算可显示的分类数量
    const calculateMaxCategories = () => {
      if (!categoriesGrid.value) return 5
      
      const containerWidth = categoriesGrid.value.offsetWidth
      const cardWidth = 180 // 卡片最小宽度
      const gap = 16 // 间距
      const moreCardWidth = 180 // 省略号卡片宽度
      
      // 计算可以容纳的卡片数量（预留一个省略号卡片的位置）
      const availableWidth = containerWidth - moreCardWidth - gap
      const maxCards = Math.floor(availableWidth / (cardWidth + gap))
      
      // 至少显示2个，最多显示所有分类数量-1（为省略号预留位置）
      return Math.max(2, Math.min(maxCards, displayCategories.value.length - 1))
    }
    
    // 实际显示的分类（不包括省略号）
    const visibleCategories = computed(() => {
      const maxCount = maxVisibleCategories.value
      return displayCategories.value.slice(0, maxCount)
    })
    
    // 是否显示省略号
    const hasMoreCategories = computed(() => {
      return displayCategories.value.length > maxVisibleCategories.value
    })
    
    // 跳转到书库页面
    const goToBooks = () => {
      router.push('/books')
    }
    
    // 更新可显示分类数量
    const updateMaxCategories = () => {
      nextTick(() => {
        maxVisibleCategories.value = calculateMaxCategories()
      })
    }
    
    // 获取轮播图
    const fetchBanners = async () => {
      try {
        const res = await BannerService.getActiveBanners()
        // 假设返回 Result<List<BannerResponse>>，则 res.data 是 list，或者 res 直接是 list (视拦截器而定)
        // 根据 admin-service pattern: return await httpClient.get(...) -> returns res.data
        // 所以这里 res 应该是 List<BannerResponse>
        banners.value = res || []
      } catch (e) {
        console.error('获取轮播图失败:', e)
      }
    }

    const handleBannerClick = (banner) => {
      if (banner.bookId) {
        router.push(`/books/${banner.bookId}`)
      } else if (banner.linkUrl) {
        window.open(banner.linkUrl, '_blank')
      }
    }

    // 获取热门书籍
    const fetchHotBooks = async () => {
      try {
        booksLoading.value = true
        const data = await BookService.getHotBooks()
        if (Array.isArray(data)) {
          // 限制显示数量为10本（两排，每排5本）
          hotBooks.value = data.slice(0, 10)
        } else {
          hotBooks.value = []
        }
      } catch (error) {
        console.error('获取热门书籍失败:', error)
        hotBooks.value = []
      } finally {
        booksLoading.value = false
      }
    }
    
    // 组件挂载时获取数据
    onMounted(async () => {
      try {
        // 并行获取分类数据和热门书籍数据
        await Promise.all([
          categoryStore.fetchCategories(),
          fetchHotBooks(),
          fetchBanners()
        ])
        
        // 数据加载完成后计算可显示数量
        await nextTick()
        updateMaxCategories()
        
        // 监听窗口大小变化
        window.addEventListener('resize', updateMaxCategories)
      } catch (error) {
        console.error('获取数据失败:', error)
      }
    })
    
    return {
      categoryStore,
      popularCategories,
      displayCategories,
      visibleCategories,
      hasMoreCategories,
      categoriesGrid,
      banners,
      hotBooks,
      booksLoading,
      goToBooks,
      handleBannerClick
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px;
  min-height: 100%;
}

.carousel-section, .popular-categories, .popular-books {
  margin-bottom: 40px;
}

.carousel-placeholder {
  height: 200px;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  border-radius: 5px;
}

.banner-item {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: white;
}

.banner-title {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: var(--text-color);
}

/* 章节标题样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.section-header h2 {
  margin: 0;
  text-align: left;
}

.more-button {
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.more-button:hover {
  transform: translateX(2px);
}

.more-button .el-icon {
  margin-left: 4px;
  transition: transform 0.3s ease;
}

.more-button:hover .el-icon {
  transform: translateX(2px);
}

/* 分类容器样式 */
.categories-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--text-color-secondary);
}

.loading-state .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

/* 分类网格布局 */
.categories-grid {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.categories-grid::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* 分类卡片样式 */
.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--border-color, #e4e7ed);
  min-height: 100px;
  width: 180px;
  flex-shrink: 0;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color, #409eff);
}

/* 省略号卡片特殊样式 */
.more-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: 2px dashed var(--primary-color, #409eff);
  cursor: pointer;
  opacity: 0.8;
}

.more-card:hover {
  opacity: 1;
  border-color: var(--primary-color-dark, #337ecc);
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.more-card .category-icon {
  color: var(--primary-color, #409eff);
}

.more-card .category-name {
  color: var(--primary-color, #409eff);
  font-weight: 600;
}

.category-icon {
  width: 40px;
  height: 40px;
  background: var(--primary-color-light, rgba(64, 158, 255, 0.1));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.category-icon .el-icon {
  font-size: 20px;
  color: var(--primary-color, #409eff);
}

.category-info {
  text-align: center;
  width: 100%;
}

.category-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color-primary);
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-description {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-count {
  font-size: 12px;
  color: var(--primary-color, #409eff);
  font-weight: 500;
  background: var(--primary-color-light, rgba(64, 158, 255, 0.1));
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-color-secondary);
}

.empty-state .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

/* 热门书籍区域样式 */
.books-container {
  max-width: 1200px;
  margin: 0 auto;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 20px;
  padding: 0;
}

.book-item {
  width: 100%;
  height: 200px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .category-card {
    width: 160px;
  }
  
  .books-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .home {
    padding: 16px;
  }
  
  .carousel-section, .popular-categories, .popular-books {
    margin-bottom: 30px;
  }
  
  .carousel-placeholder {
    height: 150px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .section-header h2 {
    text-align: center;
    width: 100%;
  }
  
  .more-button {
    align-self: center;
    font-size: 13px;
    padding: 6px 12px;
  }
  
  .categories-grid {
    gap: 12px;
  }
  
  .category-card {
    width: 140px;
    padding: 14px 10px;
    min-height: 90px;
  }
  
  .category-icon {
    width: 36px;
    height: 36px;
    margin-bottom: 6px;
  }
  
  .category-icon .el-icon {
    font-size: 18px;
  }
  
  .category-name {
    font-size: 13px;
  }
  
  .books-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  .book-item {
    height: 180px;
  }
}

@media (max-width: 480px) {
  .categories-grid {
    gap: 10px;
  }
  
  .category-card {
    width: 120px;
    padding: 12px 8px;
    min-height: 80px;
  }
  
  .category-icon {
    width: 32px;
    height: 32px;
    margin-bottom: 4px;
  }
  
  .category-icon .el-icon {
    font-size: 16px;
  }
  
  .category-name {
    font-size: 12px;
  }
  
  .books-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .book-item {
    height: 160px;
  }
}
</style>