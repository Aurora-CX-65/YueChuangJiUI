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
          <el-table-column prop="orderNum" label="序号" width="80" align="center" />
          <el-table-column prop="title" label="章节标题" min-width="200" />
          <el-table-column prop="wordCount" label="字数" width="100" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="180" align="center">
            <template #default="{ row }">
              {{ formatDateTime(row.updateTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="editChapter(row)">编辑</el-button>
              
              <el-button 
                v-if="row.status === 'draft'" 
                link 
                type="success" 
                @click="publishChapter(row)"
              >
                发布
              </el-button>
              <el-button 
                v-else-if="row.status === 'published'" 
                link 
                type="warning" 
                @click="unpublishChapter(row)"
              >
                撤回
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

    const publishChapter = async (chapter) => {
      try {
        await ElMessageBox.confirm('确定要发布这一章吗？发布后读者可见。', '提示', {
          type: 'info'
        })
        await chapterStore.publishChapter(chapter.id)
        // 刷新列表
        await chapterStore.fetchChaptersByBook(bookId, 1, 100)
      } catch (e) {
        if (e !== 'cancel') console.error(e)
      }
    }

    const unpublishChapter = async (chapter) => {
        // 需要 store 支持 unpublish，或者调用 service
        // 检查 store 是否有 unpublishChapter
        // 之前 read store 时没有 unpublishChapter，但 service 有
        // 我们可以补充 store action 或者直接调用 service
        // 为了规范，建议补充 store action，但这里先用 service 临时解决，或者假设 store 已经有了（实际上没有）
        // 让我们看看 chapter-store.js ... 确实只有 publishChapter
        // 我们需要修改 chapter-store.js 添加 unpublishChapter
        // 这里先暂时 catch 错误
        try {
            await ElMessageBox.confirm('确定要撤回这一章吗？撤回后读者不可见。', '提示', {
                type: 'warning'
            })
            const { ChapterService } = await import('@/services/chapter-service')
            await ChapterService.unpublishChapter(chapter.id)
            ElMessage.success('已撤回')
            // 手动更新本地状态
            chapterStore.updateChapterInLists(chapter.id, { status: 'draft' })
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
        'published': '已发布',
        'archived': '已归档'
      }
      return map[status] || status
    }

    const getStatusType = (status) => {
      const map = {
        'draft': 'info',
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
      publishChapter,
      unpublishChapter,
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
