<template>
  <div class="author-chapter-manager">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div class="left">
            <span>章节管理</span>
            <el-tag v-if="book" type="info" class="ml-2">{{ book.title }}</el-tag>
          </div>
          <div class="actions">
            <el-button @click="$router.push('/author/books')">返回书籍列表</el-button>
            <el-button type="primary" @click="createChapter">
              <el-icon><Plus /></el-icon> 新建章节
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <el-empty v-else-if="!chapters || chapters.length === 0" description="暂无章节，快去开始创作吧！">
        <el-button type="primary" @click="createChapter">新建第一章</el-button>
      </el-empty>

      <div v-else class="chapter-list">
        <el-table :data="chapters" style="width: 100%" row-key="id">
          <el-table-column prop="sortOrder" label="序号" width="80" align="center" />
          <el-table-column prop="title" label="章节标题" min-width="200" />
          <el-table-column prop="wordCount" label="字数" width="100" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="180" align="center">
            <template #default="{ row }">
              {{ formatDateTime(row.updatedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="editChapter(row)">编辑</el-button>
              
              <el-button 
                v-if="row.status === 'draft'" 
                link 
                type="success" 
                @click="submitChapter(row)"
              >
                提交审核
              </el-button>
              <el-tag v-else-if="row.status === 'pending_review'" type="warning" size="small" class="mx-2">审核中</el-tag>
              <el-button 
                v-else-if="row.status === 'published'" 
                link 
                type="warning" 
                disabled
                title="已发布章节不可撤回"
              >
                已发布
              </el-button>
              
              <el-popconfirm 
                title="确定要删除这一章吗？删除后无法恢复。" 
                @confirm="deleteChapter(row)"
              >
                <template #reference>
                  <el-button link type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChapterStore } from '@/stores/chapter-store'
import { useBookStore } from '@/stores/book-store'
import { Plus } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/formatters'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AuthorChapterManager',
  components: { Plus },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const chapterStore = useChapterStore()
    const bookStore = useBookStore()
    
    const bookId = parseInt(route.params.id)
    const loading = ref(false)
    
    const book = computed(() => {
        // 尝试从 store 获取当前书籍，或者从列表获取
        if (bookStore.currentBook.item?.id === bookId) {
            return bookStore.currentBook.item
        }
        return bookStore.getBookFromLists(bookId)
    })
    
    // 获取 store 中的章节列表
    const chaptersData = computed(() => chapterStore.getChaptersByBookId(bookId))
    const chapters = computed(() => chaptersData.value.items || [])

    const init = async () => {
      loading.value = true
      try {
        // 如果没有书籍信息，尝试获取
        if (!book.value) {
           await bookStore.fetchBookById(bookId)
        }
        
        await chapterStore.fetchChaptersByBook(bookId, 1, 100) // 获取前100章，暂不分页
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      if (bookId) {
        init()
      } else {
        ElMessage.error('参数错误')
        router.push('/author/books')
      }
    })

    const createChapter = () => {
      router.push(`/author/books/${bookId}/chapters/create`)
    }

    const editChapter = (chapter) => {
      router.push(`/author/books/${bookId}/chapters/${chapter.id}/edit`)
    }

    const submitChapter = async (chapter) => {
      try {
        await ElMessageBox.confirm('确定要提交这一章进行审核吗？', '提示', {
          type: 'info'
        })
        await chapterStore.submitChapterForReview(chapter.id)
        // 刷新列表
        await chapterStore.fetchChaptersByBook(bookId, 1, 100)
      } catch (e) {
        if (e !== 'cancel') console.error(e)
      }
    }

    const deleteChapter = async (chapter) => {
      try {
        await chapterStore.deleteChapter(chapter.id)
        // 列表会自动更新
      } catch (e) {
        console.error(e)
      }
    }

    const getStatusLabel = (status) => {
      const map = {
        'draft': '草稿',
        'pending_review': '审核中',
        'published': '已发布',
        'archived': '已归档'
      }
      return map[status] || status
    }

    const getStatusType = (status) => {
      const map = {
        'draft': 'info',
        'pending_review': 'warning',
        'published': 'success',
        'archived': 'warning'
      }
      return map[status] || ''
    }

    return {
      book,
      chapters,
      loading,
      createChapter,
      editChapter,
      submitChapter,
      deleteChapter,
      getStatusLabel,
      getStatusType,
      formatDateTime: formatDate
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.left {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}
.ml-2 {
  margin-left: 12px;
}
.loading-container {
  padding: 20px;
}
.chapter-list {
  margin-top: 10px;
}
</style>
