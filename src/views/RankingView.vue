<template>
  <div class="ranking-view">
    <el-container class="ranking-container">
      <el-main class="ranking-main">
        <!-- 顶部工具栏 -->
        <el-card class="toolbar-card" shadow="never">
          <div class="toolbar-content">
            <div class="title">
              <el-icon><Trophy /></el-icon>
              <span>热门榜</span>
            </div>
            <div class="controls">
              <el-space>
                <el-radio-group v-model="limit" size="small" @change="loadHot">
                  <el-radio-button :value="10">10</el-radio-button>
                  <el-radio-button :value="20">20</el-radio-button>
                  <el-radio-button :value="50">50</el-radio-button>
                </el-radio-group>
              </el-space>
            </div>
          </div>
        </el-card>

        <!-- 热门榜列表 -->
        <el-card class="list-card" shadow="never">
          <div v-if="loading.hot" class="loading-container">
            <el-skeleton :rows="6" animated />
          </div>

          <el-empty v-else-if="hotBooks.length === 0" description="暂无数据" />

          <div v-else>
            <el-row :gutter="20">
              <el-col
                v-for="(book, index) in hotBooks"
                :key="book.id"
                :xl="6" :lg="8" :md="12" :sm="12" :xs="24"
              >
                <div class="rank-item">
                  <div class="rank-badge">{{ index + 1 }}</div>
                  <BookCard :book="book" />
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>

        <!-- 最新榜 -->
        <el-card class="toolbar-card secondary" shadow="never">
          <div class="toolbar-content">
            <div class="title">
              <el-icon><Clock /></el-icon>
              <span>最新上架</span>
            </div>
            <div class="controls">
              <el-space>
                <el-radio-group v-model="latestLimit" size="small" @change="loadLatest">
                  <el-radio-button :value="10">10</el-radio-button>
                  <el-radio-button :value="20">20</el-radio-button>
                </el-radio-group>
              </el-space>
            </div>
          </div>
        </el-card>

        <el-card class="list-card" shadow="never">
          <div v-if="loading.latest" class="loading-container">
            <el-skeleton :rows="4" animated />
          </div>

          <el-empty v-else-if="latestBooks.length === 0" description="暂无数据" />

          <div v-else>
            <el-row :gutter="20">
              <el-col
                v-for="book in latestBooks"
                :key="book.id"
                :xl="6" :lg="8" :md="12" :sm="12" :xs="24"
              >
                <BookCard :book="book" />
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import BookCard from '@/components/books/BookCard.vue'
import { BookService } from '@/services/book-service.js'
import { Trophy, Clock } from '@element-plus/icons-vue'

export default {
  name: 'RankingView',
  components: {
    BookCard,
    Trophy,
    Clock
  },
  data() {
    return {
      loading: {
        hot: false,
        latest: false
      },
      hotBooks: [],
      latestBooks: [],
      limit: 20,
      latestLimit: 10
    }
  },
  mounted() {
    this.loadHot()
    this.loadLatest()
  },
  methods: {
    async loadHot() {
      this.loading.hot = true
      try {
        const list = await BookService.getHotBooks(this.limit)
        this.hotBooks = Array.isArray(list) ? list : []
      } catch (e) {
        console.error('加载热门榜失败:', e)
      } finally {
        this.loading.hot = false
      }
    },
    async loadLatest() {
      this.loading.latest = true
      try {
        const list = await BookService.getLatestBooks(this.latestLimit)
        this.latestBooks = Array.isArray(list) ? list : []
      } catch (e) {
        console.error('加载最新榜失败:', e)
      } finally {
        this.loading.latest = false
      }
    }
  }
}
</script>

<style scoped>
.ranking-view {
  padding: 20px;
}
.ranking-main {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.toolbar-card {
  border: 1px solid #e4e7ed;
}
.toolbar-card.secondary {
  margin-top: 8px;
}
.toolbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
.list-card {
  border: 1px solid #e4e7ed;
}
.loading-container {
  padding: 20px;
}
.rank-item {
  position: relative;
}
.rank-badge {
  position: absolute;
  top: -8px;
  left: -8px;
  background: #f56c6c;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  z-index: 1;
}
@media (max-width: 768px) {
  .ranking-view {
    padding: 16px;
  }
}
</style>
