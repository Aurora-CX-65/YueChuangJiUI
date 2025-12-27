<template>
  <div class="book-filter">
    <div class="filter-header">
      <el-row justify="space-between" align="middle" class="mb-3">
        <el-col>
          <h6 class="filter-main-title">
            <el-icon><Filter /></el-icon>
            筛选条件
          </h6>
        </el-col>
        <el-col :span="8">
          <el-button 
            v-if="hasActiveFilters"
            size="small"
            type="danger"
            plain
            @click="clearAllFilters"
          >
            清空筛选
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选表单 -->
    <el-form :model="filterForm" label-position="top" class="filter-form">
      <!-- 分类筛选 -->
      <el-form-item>
        <template #label>
          <span class="filter-label">
            <el-icon><Folder /></el-icon>
            分类
          </span>
        </template>
        <el-select 
          v-model="selectedCategory" 
          placeholder="选择分类"
          clearable
          @change="onFilterChange"
          class="filter-select"
        >
          <el-option value="" label="全部分类" />
          <el-option 
            v-for="category in categories" 
            :key="category.id"
            :value="String(category.id)"
            :label="`${category.name} (${category.bookCount || 0})`"
          />
        </el-select>
      </el-form-item>

      <!-- 状态筛选 -->
      <el-form-item>
        <template #label>
          <span class="filter-label">
            <el-icon><Collection /></el-icon>
            状态
          </span>
        </template>
        <el-select 
          v-model="selectedStatus" 
          placeholder="选择状态"
          clearable
          @change="onFilterChange"
          class="filter-select"
        >
          <el-option value="" label="全部状态" />
          <el-option value="serializing" label="连载中" />
          <el-option value="completed" label="已完结" />
        </el-select>
      </el-form-item>

      <!-- 标签筛选 -->
      <el-form-item>
        <template #label>
          <span class="filter-label">
            <el-icon><Collection /></el-icon>
            热门标签
          </span>
        </template>
        <el-select 
          v-model="selectedTags" 
          placeholder="选择标签"
          multiple
          clearable
          collapse-tags
          collapse-tags-tooltip
          @change="onFilterChange"
          class="filter-select"
        >
          <el-option 
            v-for="tag in popularTags" 
            :key="tag.id"
            :value="tag.id"
            :label="tag.name"
          />
        </el-select>
      </el-form-item>

      <!-- 字数筛选 -->
      <el-form-item>
        <template #label>
          <span class="filter-label">
            <el-icon><Document /></el-icon>
            字数
          </span>
        </template>
        <el-select 
          v-model="selectedWordCount" 
          placeholder="选择字数范围"
          clearable
          @change="onFilterChange"
          class="filter-select"
        >
          <el-option value="" label="不限字数" />
          <el-option value="short" label="10万字以下" />
          <el-option value="medium" label="10-50万字" />
          <el-option value="long" label="50万字以上" />
        </el-select>
      </el-form-item>

      <!-- 更新时间筛选 -->
      <el-form-item>
        <template #label>
          <span class="filter-label">
            <el-icon><Clock /></el-icon>
            更新时间
          </span>
        </template>
        <el-select 
          v-model="selectedUpdateTime" 
          placeholder="选择更新时间"
          clearable
          @change="onFilterChange"
          class="filter-select"
        >
          <el-option value="" label="不限时间" />
          <el-option value="today" label="今日更新" />
          <el-option value="week" label="本周更新" />
          <el-option value="month" label="本月更新" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { CategoryService } from '../../services/category-service'
import { TagService } from '../../services/tag-service'
import { Filter, Folder, Collection, Document, Clock } from '@element-plus/icons-vue'

export default {
  name: 'BookFilter',
  components: {
    Filter,
    Folder,
    Collection,
    Document,
    Clock
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    initialFilters: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['filter-change'],
  data() {
    return {
      categories: [],
      popularTags: [],
      selectedCategory: '',
      selectedStatus: '',
      selectedTags: [],
      selectedWordCount: '',
      selectedUpdateTime: '',
      filterForm: {}
    }
  },
  computed: {
    /**
     * 检查是否有激活的筛选条件
     */
    hasActiveFilters() {
      return this.selectedCategory || 
             this.selectedStatus || 
             this.selectedTags.length > 0 ||
             this.selectedWordCount ||
             this.selectedUpdateTime
    }
  },
  mounted() {
    this.loadCategories()
    this.loadTags()
    this.initializeFilters()
  },
  watch: {
    /**
     * 监听初始筛选条件变化
     */
    initialFilters: {
      handler(newFilters) {
        this.initializeFilters()
      },
      deep: true
    }
  },
  methods: {
    /**
     * 加载分类列表
     */
    async loadCategories() {
      try {
        this.categories = await CategoryService.getCategories()
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    },

    /**
     * 加载热门标签
     */
    async loadTags() {
      try {
        this.popularTags = await TagService.getHotTags(20)
      } catch (error) {
        console.error('加载标签失败:', error)
      }
    },

    /**
     * 切换标签选择
     */
    toggleTag(tagId) {
      const index = this.selectedTags.indexOf(tagId)
      if (index > -1) {
        this.selectedTags.splice(index, 1)
      } else {
        this.selectedTags.push(tagId)
      }
      this.onFilterChange()
    },

    /**
     * 筛选条件变化处理
     */
    onFilterChange() {
      const filters = {
        categoryId: this.selectedCategory,
        status: this.selectedStatus,
        tagIds: this.selectedTags,
        wordCount: this.selectedWordCount,
        updateTime: this.selectedUpdateTime
      }
      this.$emit('filter-change', filters)
    },

    /**
     * 初始化筛选条件
     */
    initializeFilters() {
      if (this.initialFilters.categoryId) {
        this.selectedCategory = this.initialFilters.categoryId
      }
      if (this.initialFilters.status) {
        this.selectedStatus = this.initialFilters.status
      }
      if (this.initialFilters.tagIds && this.initialFilters.tagIds.length > 0) {
        this.selectedTags = [...this.initialFilters.tagIds]
      }
      if (this.initialFilters.wordCount) {
        this.selectedWordCount = this.initialFilters.wordCount
      }
      if (this.initialFilters.updateTime) {
        this.selectedUpdateTime = this.initialFilters.updateTime
      }
    },

    /**
     * 清空所有筛选条件
     */
    clearAllFilters() {
      this.selectedCategory = ''
      this.selectedStatus = ''
      this.selectedTags = []
      this.selectedWordCount = ''
      this.selectedUpdateTime = ''
      this.onFilterChange()
    }
  }
}
</script>

<style scoped>
.book-filter {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.filter-main-title {
  margin: 0;
  color: #333;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-form {
  margin-top: 10px;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.filter-form :deep(.el-form-item__label) {
  padding: 0;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #333;
}

.filter-select {
  width: 100%;
}

.filter-select :deep(.el-select__wrapper) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.filter-select :deep(.el-select__wrapper:hover) {
  border-color: #409eff;
}

.filter-select :deep(.el-select__wrapper.is-focused) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 多选标签样式 */
.filter-select :deep(.el-tag) {
  margin: 2px;
  border-radius: 4px;
}

/* 清空筛选按钮样式 */
.filter-header :deep(.el-button) {
  border-radius: 6px;
  font-size: 12px;
  padding: 6px 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .book-filter {
    padding: 15px;
    margin: 10px;
    border-radius: 6px;
  }
  
  .filter-main-title {
    font-size: 15px;
  }
  
  .filter-label {
    font-size: 13px;
  }
  
  .filter-form :deep(.el-form-item) {
    margin-bottom: 16px;
  }
  
  .filter-header {
    margin-bottom: 15px;
    padding-bottom: 12px;
  }
}

@media (max-width: 480px) {
  .book-filter {
    padding: 12px;
    margin: 8px;
  }
  
  .filter-main-title {
    font-size: 14px;
  }
  
  .filter-label {
    font-size: 12px;
  }
  
  .filter-form :deep(.el-form-item) {
    margin-bottom: 14px;
  }
}
</style>