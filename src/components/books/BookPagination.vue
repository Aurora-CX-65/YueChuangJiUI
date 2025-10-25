<template>
  <div class="book-pagination">
    <div class="pagination-info">
      <span class="text-muted">
        共 {{ totalItems }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
      </span>
    </div>
    
    <nav aria-label="书籍分页导航">
      <ul class="pagination pagination-sm justify-content-center">
        <!-- 首页 -->
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button 
            class="page-link" 
            @click="goToPage(1)"
            :disabled="currentPage === 1"
            title="首页"
          >
            <i class="fas fa-angle-double-left"></i>
          </button>
        </li>
        
        <!-- 上一页 -->
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button 
            class="page-link" 
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            title="上一页"
          >
            <i class="fas fa-angle-left"></i>
          </button>
        </li>
        
        <!-- 页码 -->
        <li 
          v-for="page in visiblePages" 
          :key="page"
          class="page-item" 
          :class="{ active: page === currentPage }"
        >
          <button 
            class="page-link" 
            @click="goToPage(page)"
            :class="{ 'bg-primary border-primary text-white': page === currentPage }"
          >
            {{ page }}
          </button>
        </li>
        
        <!-- 下一页 -->
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button 
            class="page-link" 
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            title="下一页"
          >
            <i class="fas fa-angle-right"></i>
          </button>
        </li>
        
        <!-- 末页 -->
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button 
            class="page-link" 
            @click="goToPage(totalPages)"
            :disabled="currentPage === totalPages"
            title="末页"
          >
            <i class="fas fa-angle-double-right"></i>
          </button>
        </li>
      </ul>
    </nav>
    
    <!-- 快速跳转 -->
    <div class="quick-jump">
      <div class="input-group input-group-sm">
        <span class="input-group-text">跳转到</span>
        <input 
          type="number" 
          class="form-control" 
          v-model.number="jumpPage"
          :min="1"
          :max="totalPages"
          @keyup.enter="quickJump"
          placeholder="页码"
          style="width: 80px;"
        >
        <button 
          class="btn btn-outline-secondary" 
          type="button"
          @click="quickJump"
        >
          跳转
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookPagination',
  props: {
    currentPage: {
      type: Number,
      required: true,
      default: 1
    },
    totalPages: {
      type: Number,
      required: true,
      default: 1
    },
    totalItems: {
      type: Number,
      required: true,
      default: 0
    },
    maxVisiblePages: {
      type: Number,
      default: 5
    }
  },
  emits: ['page-change'],
  data() {
    return {
      jumpPage: null
    }
  },
  computed: {
    /**
     * 计算可见的页码列表
     */
    visiblePages() {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage
      const maxVisible = this.maxVisiblePages
      
      if (total <= maxVisible) {
        // 总页数小于等于最大可见页数，显示所有页码
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // 总页数大于最大可见页数，需要计算显示范围
        const half = Math.floor(maxVisible / 2)
        let start = Math.max(1, current - half)
        let end = Math.min(total, start + maxVisible - 1)
        
        // 调整起始位置，确保显示足够的页码
        if (end - start + 1 < maxVisible) {
          start = Math.max(1, end - maxVisible + 1)
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i)
        }
        
        // 添加省略号逻辑（可选）
        if (start > 1) {
          if (start > 2) {
            pages.unshift('...')
          }
          pages.unshift(1)
        }
        
        if (end < total) {
          if (end < total - 1) {
            pages.push('...')
          }
          pages.push(total)
        }
      }
      
      return pages
    }
  },
  watch: {
    currentPage(newVal) {
      this.jumpPage = newVal
    }
  },
  mounted() {
    this.jumpPage = this.currentPage
  },
  methods: {
    /**
     * 跳转到指定页码
     */
    goToPage(page) {
      if (page === '...' || page < 1 || page > this.totalPages || page === this.currentPage) {
        return
      }
      this.$emit('page-change', page)
    },
    
    /**
     * 快速跳转
     */
    quickJump() {
      const page = parseInt(this.jumpPage)
      if (isNaN(page) || page < 1 || page > this.totalPages) {
        this.$toast.warning(`请输入1-${this.totalPages}之间的页码`)
        this.jumpPage = this.currentPage
        return
      }
      
      if (page !== this.currentPage) {
        this.goToPage(page)
      }
    }
  }
}
</script>

<style scoped>
.book-pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px 0;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
}

.pagination {
  margin: 0;
}

.page-link {
  color: #6c757d;
  border-color: #dee2e6;
  padding: 6px 12px;
  font-size: 14px;
}

.page-link:hover {
  color: #007bff;
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.page-link:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.page-item.disabled .page-link {
  color: #6c757d;
  background-color: #fff;
  border-color: #dee2e6;
  cursor: not-allowed;
}

.quick-jump {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quick-jump .input-group {
  width: auto;
}

.quick-jump .form-control {
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .book-pagination {
    gap: 10px;
  }
  
  .pagination-info {
    font-size: 12px;
    text-align: center;
  }
  
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .page-link {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .quick-jump {
    flex-direction: column;
    gap: 5px;
  }
  
  .quick-jump .input-group {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .book-pagination {
    padding: 15px 0;
  }
  
  /* 在小屏幕上隐藏首页和末页按钮 */
  .page-item:first-child,
  .page-item:last-child {
    display: none;
  }
  
  .pagination {
    margin: 0 -5px;
  }
  
  .page-link {
    margin: 0 2px;
    border-radius: 4px;
  }
}
</style>