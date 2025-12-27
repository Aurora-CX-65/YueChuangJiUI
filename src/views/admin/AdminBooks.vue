<template>
  <div class="admin-books-management">
    <el-card shadow="never">
      <div class="header">
        <div class="title">书籍管理</div>
        <div class="controls">
          <el-input v-model="keyword" placeholder="搜索标题/作者" size="small" style="width:180px" clearable @keyup.enter="loadBooks" />
          <el-select v-model="status" placeholder="状态" size="small" style="width:120px" clearable @change="loadBooks">
            <el-option label="全部" value="" />
            <el-option label="连载中" value="serializing" />
            <el-option label="已完结" value="completed" />
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
            <el-option label="待审核" value="pending_review" />
          </el-select>
          <el-button size="small" type="primary" @click="loadBooks">搜索</el-button>
          <el-button size="small" @click="reset">重置</el-button>
          <el-button size="small" type="warning" :disabled="!selectedRows.length" @click="openBatchSuspend">批量下架</el-button>
        </div>
      </div>

      <div class="content">
        <div v-if="loading" class="loading"><el-skeleton :rows="6" animated /></div>
        <el-empty v-else-if="books.length === 0" description="暂无书籍数据" />
        <div class="table-wrapper" v-else>
          <el-table :data="books" border size="small" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="authorUsername" label="作者" width="120" show-overflow-tooltip />
            <el-table-column prop="categoryName" label="分类" width="100" />
            <el-table-column label="推荐" width="80" align="center">
              <template #default="{ row }">
                <el-switch
                  v-model="row.isRecommended"
                  size="small"
                  :loading="row.recommendLoading"
                  @change="val => handleRecommendChange(row, val)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="160">
              <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button 
                  size="small" 
                  type="warning" 
                  link 
                  v-if="!['draft', 'pending_review'].includes(row.status)"
                  @click="openSuspendDialog(row)"
                >下架</el-button>
                <el-button 
                  size="small" 
                  type="success" 
                  link 
                  v-else
                  @click="openUnsuspendDialog(row)"
                >上架</el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  link 
                  @click="openStatusDialog(row)"
                >状态</el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  link 
                  @click="openDetailDialog(row)"
                >详情/审核</el-button>
                <el-popconfirm title="确定要删除这本书籍吗？" @confirm="deleteBook(row)">
                  <template #reference>
                    <el-button size="small" type="danger" link>删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination" v-if="total > 0">
          <el-pagination
            v-model:current-page="page"
            :page-size="size"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 20, 50]"
            background
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </el-card>

    <el-dialog v-model="suspendVisible" title="书籍下架" width="400px">
      <el-form label-position="top">
        <el-form-item label="下架原因" required>
          <el-input 
            v-model="suspendReason" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入下架原因，将通过系统通知发送给作者" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="suspendVisible = false">取消</el-button>
          <el-button type="primary" :loading="actionLoading" @click="confirmSuspend">确定下架</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="unsuspendVisible" title="书籍重新上架" width="400px">
      <el-form label-position="top">
        <el-form-item label="上架状态" required>
           <el-radio-group v-model="unsuspendStatus">
            <el-radio label="serializing">连载中</el-radio>
            <el-radio label="completed">已完结</el-radio>
            <el-radio label="published">已发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="unsuspendVisible = false">取消</el-button>
          <el-button type="success" :loading="actionLoading" @click="confirmUnsuspend">确定上架</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="batchSuspendVisible" title="批量下架" width="400px">
      <el-form label-position="top">
        <el-alert 
          type="warning" 
          :closable="false" 
          show-icon
          style="margin-bottom: 12px"
        >
          即将下架 {{ selectedRows.length }} 本书籍，请确认。
        </el-alert>
        <el-form-item label="下架原因" required>
          <el-input 
            v-model="batchSuspendReason" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入统一的下架原因，将通过系统通知发送给所有作者" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchSuspendVisible = false">取消</el-button>
          <el-button type="primary" :loading="actionLoading" @click="confirmBatchSuspend">确定批量下架</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="statusVisible" title="修改书籍状态" width="400px">
      <el-form label-position="top">
        <el-form-item label="新状态" required>
          <el-select v-model="newStatus" style="width: 100%">
            <el-option label="连载中" value="serializing" />
            <el-option label="已完结" value="completed" />
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
            <el-option label="待审核" value="pending_review" />
            <el-option label="已断更" value="suspended" />
          </el-select>
        </el-form-item>
        <el-form-item label="变更原因">
          <el-input 
            v-model="statusReason" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入变更原因（可选）" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statusVisible = false">取消</el-button>
          <el-button type="primary" :loading="actionLoading" @click="confirmUpdateStatus">确定修改</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 书籍详情与审核对话框 -->
    <el-dialog v-model="detailVisible" title="书籍详情与章节审核" width="800px" destroy-on-close>
      <div v-if="detailLoading" class="loading"><el-skeleton :rows="10" animated /></div>
      <div v-else class="book-detail-container">
        <!-- 书籍基本信息 -->
        <div class="book-info-section">
          <div class="cover-wrapper">
             <img :src="currentBook?.coverUrl || 'https://placeholder.com/150'" class="book-cover-large" />
          </div>
          <div class="info-content">
            <h3>{{ currentBook?.title }}</h3>
            <p><strong>作者：</strong>{{ currentBook?.authorUsername }}</p>
            <p><strong>分类：</strong>{{ currentBook?.categoryName }}</p>
            <p><strong>状态：</strong><el-tag size="small" :type="getStatusType(currentBook?.status)">{{ getStatusLabel(currentBook?.status) }}</el-tag></p>
            <p class="intro"><strong>简介：</strong>{{ currentBook?.description || '暂无简介' }}</p>
          </div>
        </div>
        
        <el-divider content-position="left">章节列表</el-divider>
        
        <!-- 章节列表 -->
        <div class="chapter-list-section">
          <el-table :data="chapters" border size="small" height="400px">
            <el-table-column prop="sortOrder" label="序号" width="60" align="center" />
            <el-table-column prop="title" label="章节标题" min-width="150" />
            <el-table-column prop="wordCount" label="字数" width="80" align="center" />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                 <el-tag size="small" :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="140">
               <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="openChapterReview(row)">查看/审核</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 章节内容审核对话框 -->
    <el-dialog v-model="chapterReviewVisible" title="章节审核" width="700px" append-to-body>
      <div v-if="chapterLoading" class="loading"><el-skeleton :rows="10" animated /></div>
      <div v-else class="chapter-review-container">
        <h2 class="chapter-title">{{ currentChapter?.title }}</h2>
        <div class="chapter-meta">
          <span>字数：{{ currentChapter?.wordCount }}</span>
          <span>状态：<el-tag size="small" :type="getStatusType(currentChapter?.status)">{{ getStatusLabel(currentChapter?.status) }}</el-tag></span>
        </div>
        <div class="chapter-content" v-html="currentChapter?.content"></div>
        
        <div class="review-actions" v-if="currentChapter?.status === 'pending_review'">
          <el-divider>审核操作</el-divider>
          <el-input 
            v-model="reviewComment" 
            placeholder="请输入审核意见（驳回时必填）" 
            type="textarea" 
            :rows="2" 
            style="margin-bottom: 12px"
          />
          <div class="action-buttons">
            <el-button type="danger" @click="handleRejectChapter">驳回</el-button>
            <el-button type="success" @click="handleApproveChapter">通过</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { AdminService } from '@/services/admin-service.js'

export default {
  name: 'AdminBooks',
  data() {
    return {
      loading: false,
      books: [],
      page: 1,
      size: 10,
      total: 0,
      keyword: '',
      status: '',
      suspendVisible: false,
      suspendReason: '',
      currentBook: null,
      actionLoading: false,
      unsuspendVisible: false,
      unsuspendStatus: 'serializing',
      selectedRows: [],
      batchSuspendVisible: false,
      batchSuspendReason: '',
      statusVisible: false,
      newStatus: '',
      statusReason: '',
      detailVisible: false,
      detailLoading: false,
      chapters: [],
      chapterReviewVisible: false,
      chapterLoading: false,
      currentChapter: null,
      reviewComment: ''
    }
  },
  mounted() {
    this.loadBooks()
  },
  methods: {
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    formatDateTime(val) {
      if (!val) return ''
      const d = typeof val === 'string' ? new Date(val) : val
      if (isNaN(d.getTime())) return val
      const y = d.getFullYear()
      const M = String(d.getMonth() + 1).padStart(2, '0')
      const D = String(d.getDate()).padStart(2, '0')
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      return `${y}-${M}-${D} ${h}:${m}`
    },
    getStatusLabel(status) {
      const map = {
        'draft': '草稿',
        'pending_review': '待审核',
        'published': '已发布',
        'serializing': '连载中',
        'completed': '已完结',
        'suspended': '已断更'
      }
      return map[status] || status
    },
    getStatusType(status) {
      const map = {
        'draft': 'info',
        'pending_review': 'warning',
        'published': 'success',
        'serializing': 'primary',
        'completed': 'success',
        'suspended': 'danger'
      }
      return map[status] || ''
    },
    async loadBooks() {
      this.loading = true
      console.log('Loading books with:', { page: this.page, size: this.size, keyword: this.keyword, status: this.status })
      try {
        const res = await AdminService.getAdminBooks(this.page, this.size, this.keyword.trim(), this.status)
        this.books = res?.records || []
        this.total = res?.total || 0
      } catch (e) {
        console.error('加载书籍列表失败:', e)
      } finally {
        this.loading = false
      }
    },
    reset() {
      this.keyword = ''
      this.status = ''
      this.page = 1
      this.loadBooks()
    },
    handleSizeChange(s) {
      this.size = s
      this.page = 1
      this.loadBooks()
    },
    handlePageChange(p) {
      this.page = p
      this.loadBooks()
    },
    async deleteBook(row) {
      try {
        await AdminService.deleteBook(row.id)
        if (window.notificationManager) {
          window.notificationManager.success('删除成功')
        }
        this.loadBooks()
      } catch (e) {
        console.error('删除书籍失败:', e)
        if (window.notificationManager) {
          window.notificationManager.error('删除失败')
        }
      }
    },
    openSuspendDialog(row) {
      this.currentBook = row
      this.suspendReason = ''
      this.suspendVisible = true
    },
    async confirmSuspend() {
      if (!this.currentBook) return
      
      if (!this.suspendReason.trim()) {
        if (window.notificationManager) {
          window.notificationManager.error('请输入下架原因')
        }
        return
      }
      
      this.actionLoading = true
      try {
        await AdminService.updateBookStatus(this.currentBook.id, 'draft', this.suspendReason.trim())
        if (window.notificationManager) {
          window.notificationManager.success('下架成功，已发送通知')
        }
        this.suspendVisible = false
        this.loadBooks()
      } catch (e) {
        console.error('下架书籍失败:', e)
        if (window.notificationManager) {
          window.notificationManager.error('下架失败')
        }
      } finally {
        this.actionLoading = false
      }
    },
    openUnsuspendDialog(row) {
      this.currentBook = row
      this.unsuspendStatus = 'serializing'
      this.unsuspendVisible = true
    },
    async confirmUnsuspend() {
      if (!this.currentBook) return
      
      this.actionLoading = true
      try {
        await AdminService.updateBookStatus(this.currentBook.id, this.unsuspendStatus, '管理员重新上架')
        if (window.notificationManager) {
          window.notificationManager.success('上架成功')
        }
        this.unsuspendVisible = false
        this.loadBooks()
      } catch (e) {
        console.error('上架书籍失败:', e)
        if (window.notificationManager) {
          window.notificationManager.error('上架失败')
        }
      } finally {
        this.actionLoading = false
      }
    },
    openBatchSuspend() {
      this.batchSuspendReason = ''
      this.batchSuspendVisible = true
    },
    async confirmBatchSuspend() {
      if (!this.batchSuspendReason.trim()) {
        if (window.notificationManager) {
          window.notificationManager.error('请输入下架原因')
        }
        return
      }
      
      this.actionLoading = true
      try {
        const ids = this.selectedRows.map(r => r.id)
        await AdminService.batchUpdateBookStatus(ids, 'draft', this.batchSuspendReason.trim())
        if (window.notificationManager) {
          window.notificationManager.success('批量下架成功，已发送通知')
        }
        this.batchSuspendVisible = false
        this.selectedRows = []
        this.loadBooks()
      } catch (e) {
        console.error('批量下架书籍失败:', e)
        if (window.notificationManager) {
          window.notificationManager.error('批量下架失败')
        }
      } finally {
        this.actionLoading = false
      }
    },
    async handleRecommendChange(row, val) {
      row.recommendLoading = true
      try {
        await AdminService.setBookRecommendStatus(row.id, val)
        if (window.notificationManager) {
          window.notificationManager.success(val ? '已设为推荐' : '已取消推荐')
        }
      } catch (e) {
        console.error('设置推荐状态失败:', e)
        row.isRecommended = !val // Revert
        if (window.notificationManager) {
          window.notificationManager.error('设置失败')
        }
      } finally {
        row.recommendLoading = false
      }
    },
    openStatusDialog(row) {
      this.currentBook = row
      this.newStatus = row.status
      this.statusReason = ''
      this.statusVisible = true
    },
    async confirmUpdateStatus() {
      if (!this.currentBook) return
      
      this.actionLoading = true
      try {
        await AdminService.updateBookStatus(this.currentBook.id, this.newStatus, this.statusReason)
        if (window.notificationManager) {
          window.notificationManager.success('状态更新成功')
        }
        this.statusVisible = false
        this.loadBooks()
      } catch (e) {
        console.error('更新状态失败:', e)
        if (window.notificationManager) {
          window.notificationManager.error('更新状态失败')
        }
      } finally {
        this.actionLoading = false
      }
    },
    async openDetailDialog(row) {
      this.currentBook = row
      this.detailVisible = true
      this.detailLoading = true
      this.chapters = []
      try {
        const res = await AdminService.getBookChapters(row.id)
        // Check structure: res could be array or PageResult
        if (Array.isArray(res)) {
           this.chapters = res
        } else if (res && res.records) {
           this.chapters = res.records
        } else if (res && res.data) { // fallback
           this.chapters = res.data
        }
      } catch (e) {
        console.error('加载章节列表失败:', e)
        if (window.notificationManager) {
          window.notificationManager.error('加载章节列表失败')
        }
      } finally {
        this.detailLoading = false
      }
    },
    async openChapterReview(chapter) {
      this.currentChapter = null
      this.reviewComment = ''
      this.chapterReviewVisible = true
      this.chapterLoading = true
      try {
        const res = await AdminService.getChapterContent(chapter.id)
        this.currentChapter = res // Interceptor unwraps it
      } catch (e) {
        console.error('加载章节内容失败:', e)
        if (window.notificationManager) {
          window.notificationManager.error('加载章节内容失败')
        }
      } finally {
        this.chapterLoading = false
      }
    },
    async handleApproveChapter() {
      if (!this.currentChapter) return
      try {
        await AdminService.approveChapter(this.currentChapter.id, this.reviewComment)
        if (window.notificationManager) {
          window.notificationManager.success('章节审核通过')
        }
        this.chapterReviewVisible = false
        // Reload chapters to update status
        this.openDetailDialog(this.currentBook) 
      } catch (e) {
        console.error('审核通过失败:', e)
        if (window.notificationManager) {
          window.notificationManager.error('操作失败')
        }
      }
    },
    async handleRejectChapter() {
      if (!this.currentChapter) return
      if (!this.reviewComment.trim()) {
        if (window.notificationManager) {
          window.notificationManager.warning('请填写驳回原因')
        }
        return
      }
      try {
        await AdminService.rejectChapter(this.currentChapter.id, this.reviewComment)
        if (window.notificationManager) {
          window.notificationManager.success('章节已驳回')
        }
        this.chapterReviewVisible = false
        // Reload chapters to update status
        this.openDetailDialog(this.currentBook)
      } catch (e) {
        console.error('审核驳回失败:', e)
        if (window.notificationManager) {
          window.notificationManager.error('操作失败')
        }
      }
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.title { font-weight: 600; font-size: 16px; }
.controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.loading { padding: 24px; }
.pagination { margin-top: 16px; display: flex; justify-content: center; }
.table-wrapper { width: 100%; overflow-x: auto; }

.book-detail-container {
  padding: 0 10px;
}
.book-info-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.cover-wrapper {
  flex-shrink: 0;
  width: 120px;
}
.book-cover-large {
  width: 100%;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.info-content {
  flex: 1;
}
.info-content h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}
.info-content p {
  margin: 6px 0;
  color: #666;
  font-size: 14px;
}
.intro {
  margin-top: 12px !important;
  line-height: 1.5;
  color: #555;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.chapter-review-container {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 10px;
}
.chapter-title {
  text-align: center;
  margin-bottom: 10px;
  font-size: 20px;
}
.chapter-meta {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}
.chapter-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}
.review-actions {
  margin-top: 20px;
  background: #fff;
  position: sticky;
  bottom: 0;
  padding: 10px 0;
  border-top: 1px solid #eee;
}
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
