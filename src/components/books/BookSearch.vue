<template>
  <div class="book-search">
    <div class="search-container">
      <div class="search-input-group">
        <div class="search-bar">
          <el-input
            ref="searchInput"
            v-model="searchKeyword"
            placeholder="搜索书名、作者、关键词..."
            @keyup.enter="performSearch"
            @input="onInputChange"
            @focus="showSearchSuggestions"
            @blur="hideSearchSuggestions"
            clearable
            size="large"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button 
            type="primary" 
            @click="performSearch"
            :loading="loading"
            size="large"
            class="search-button"
          >
            搜索
          </el-button>
          <el-button 
            type="default" 
            @click="resetSearch"
            size="large"
            class="reset-button"
            :disabled="!searchKeyword"
          >
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </div>
        
        <!-- 搜索历史 -->
        <div 
          v-if="showSuggestions && searchHistory.length > 0"
          class="search-suggestions"
        >
          <!-- 搜索历史 -->
          <div v-if="searchHistory.length > 0" class="suggestion-section history-section">
            <div class="suggestion-header">
              <span class="suggestion-title">
                <el-icon class="history-icon"><Clock /></el-icon>
                搜索历史
              </span>
              <el-button 
                type="text" 
                size="small"
                @click="clearSearchHistory"
                class="clear-button"
              >
                <el-icon><Delete /></el-icon>
                清空
              </el-button>
            </div>
            <div class="suggestion-list">
              <div 
                v-for="(item, index) in searchHistory" 
                :key="`history-${index}`"
                class="suggestion-item history-item"
                @mousedown="selectSuggestion(item)"
              >
                <div class="item-content">
                  <el-icon class="item-icon"><Clock /></el-icon>
                  <span class="item-text">{{ item }}</span>
                </div>
                <el-button 
                  type="text" 
                  size="small"
                  @click.stop="removeHistoryItem(item)"
                  class="remove-button"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          

        </div>
      </div>
      

    </div>
  </div>
</template>

<script>
import { SearchService } from '../../services/search-service'
import { Search, Clock, Delete, Close, ArrowRight, RefreshLeft } from '@element-plus/icons-vue'

export default {
  name: 'BookSearch',
  components: {
    Search,
    Clock,
    Delete,
    Close,
    ArrowRight,
    RefreshLeft
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ''
    }
  },
  emits: ['search', 'input', 'reset'],
  data() {
    return {
      searchKeyword: this.value,
      showSuggestions: false,
      searchHistory: []
    }
  },
  mounted() {
    this.loadSearchHistory()
  },
  watch: {
    /**
     * 监听value变化，同步searchKeyword
     */
    value(newVal) {
      this.searchKeyword = newVal
    },
    
    /**
     * 监听searchKeyword变化，触发input事件
     */
    searchKeyword(newVal) {
      this.$emit('input', newVal)
    }
  },
  methods: {
    /**
     * 执行搜索
     */
    performSearch() {
      const keyword = this.searchKeyword.trim()
      if (!keyword) {
        this.$toast.warning('请输入搜索关键词')
        return
      }
      
      this.addToSearchHistory(keyword)
      this.hideSearchSuggestions()
      this.$emit('search', keyword)
    },

    /**
     * 输入变化处理
     */
    onInputChange() {
      // 输入变化时不再加载搜索建议
    },

    /**
     * 选择搜索建议或历史
     */
    selectSuggestion(keyword) {
      this.searchKeyword = keyword
      this.performSearch()
    },



    /**
     * 显示搜索历史
     */
    showSearchSuggestions() {
      this.showSuggestions = true
    },


    /**
     * 隐藏搜索建议
     */
    hideSearchSuggestions() {
      setTimeout(() => {
        this.showSuggestions = false
      }, 200)
    },

    /**
     * 加载搜索历史
     */
    loadSearchHistory() {
      this.searchHistory = SearchService.getSearchHistory()
    },

    /**
     * 添加到搜索历史
     */
    addToSearchHistory(keyword) {
      SearchService.addSearchHistory(keyword)
      this.loadSearchHistory() // 重新加载历史记录
    },

    /**
     * 清空搜索历史
     */
    clearSearchHistory() {
      SearchService.clearSearchHistory()
      this.loadSearchHistory() // 重新加载历史记录
    },

    /**
     * 删除单个历史项
     */
    removeHistoryItem(keyword) {
      SearchService.removeSearchHistory(keyword)
      this.loadSearchHistory() // 重新加载历史记录
    },

    /**
     * 重置搜索
     */
    resetSearch() {
      this.searchKeyword = ''
      this.hideSearchSuggestions()
      this.$emit('reset')
      this.$emit('input', '')
    },




  }
}
</script>

<style scoped>
.book-search {
  position: relative;
  z-index: 1000;
}

.search-container {
  max-width: 600px;
  margin-left: auto;
  position: relative;
}

.search-input-group {
  position: relative;
  z-index: 1001;
}

.search-bar {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  flex: 1;
}

.search-button {
  flex-shrink: 0;
}

.reset-button {
  flex-shrink: 0;
  margin-left: 8px;
  border-color: #dcdfe6;
  color: #606266;
  transition: all 0.3s ease;
}

.reset-button:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
  background-color: #ecf5ff;
}

.reset-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-suggestions {
  position: fixed;
  background: white;
  border: 1px solid #e4e7ed;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 9999;
  max-height: 400px;
  overflow-y: auto;
  min-width: 300px;
}

.suggestion-section {
  padding: 12px 0;
}

.suggestion-section:not(:last-child) {
  border-bottom: 1px solid #f5f7fa;
}

.history-section {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
}

.suggestions-section {
  background: linear-gradient(135deg, #fff8f0 0%, #ffffff 100%);
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  margin-bottom: 8px;
}

.suggestion-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
  font-weight: 600;
}

.history-icon {
  color: #409eff;
}

.suggestion-icon {
  color: #e6a23c;
}

.clear-button {
  color: #909399;
  font-size: 12px;
}

.clear-button:hover {
  color: #f56c6c;
}

.suggestion-list {
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #303133;
  transition: all 0.3s ease;
  border-radius: 4px;
  margin: 0 8px;
}

.suggestion-item:hover {
  background-color: #f5f7fa;
  transform: translateX(4px);
}

.history-item:hover {
  background-color: #ecf5ff;
}

.suggestion-item-modern:hover {
  background-color: #fdf6ec;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.item-icon {
  color: #909399;
  font-size: 16px;
}

.item-text {
  color: #303133;
  font-weight: 400;
}

.remove-button {
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #c0c4cc;
  padding: 4px;
}

.history-item:hover .remove-button {
  opacity: 1;
}

.remove-button:hover {
  color: #f56c6c;
}

.arrow-icon {
  color: #c0c4cc;
  font-size: 14px;
  transition: transform 0.2s ease;
}

.suggestion-item-modern:hover .arrow-icon {
  transform: translateX(4px);
  color: #409eff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-container {
    max-width: 100%;
    margin-left: 0;
  }
  
  .search-suggestions {
    left: -8px;
    right: -8px;
    min-width: auto;
    max-height: 300px;
  }
  
  .suggestion-item {
    padding: 12px 16px;
    margin: 0 4px;
  }
  
  .suggestion-header {
    padding: 8px 12px;
  }
}
</style>