<template>
  <div class="author-outline-manager">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div class="left">
            <span>大纲管理</span>
            <el-tag v-if="book" type="info" class="ml-2">{{ book.title }}</el-tag>
          </div>
          <div class="actions">
            <el-button @click="$router.push('/author/books')">返回书籍列表</el-button>
            <el-button type="primary" @click="openDialog()">创建新大纲</el-button>
          </div>
        </div>
      </template>

      <div v-if="loading" class="loading">
        <el-skeleton :rows="3" animated />
      </div>
      
      <el-empty v-else-if="outlines.length === 0" description="暂无情节大纲" />
      
      <div v-else class="outline-list">
        <el-collapse v-model="activeNames">
          <el-collapse-item 
            v-for="item in outlines" 
            :key="item.id" 
            :name="item.id"
          >
            <template #title>
              <div class="outline-title-row">
                <span class="order-badge">{{ item.sortOrder }}</span>
                <span class="outline-title">{{ item.title }}</span>
                <div class="outline-meta" @click.stop>
                   <el-button link type="primary" @click="openDialog(item)">编辑</el-button>
                   <el-button link type="danger" @click="handleDelete(item)">删除</el-button>
                </div>
              </div>
            </template>
            <div class="outline-content">
              <div class="mb-2" v-if="item.deadline">
                <el-tag size="small" type="warning">截止日期: {{ formatDate(item.deadline) }}</el-tag>
              </div>
              <div class="description">{{ item.description }}</div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>

    <!-- 编辑/创建对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑大纲' : '创建大纲'" 
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="情节标题" maxlength="100" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="1" />
        </el-form-item>
        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker 
            v-model="form.deadline" 
            type="datetime" 
            placeholder="选择日期时间" 
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="6" 
            placeholder="详细情节描述" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBookStore } from '@/stores/book-store'
import { OutlineService } from '@/services/outline-service'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/formatters'

export default {
  name: 'AuthorOutlineManager',
  setup() {
    const route = useRoute()
    const bookStore = useBookStore()
    const bookId = parseInt(route.params.id)

    const loading = ref(false)
    const outlines = ref([])
    const activeNames = ref([])
    const book = ref(null)

    // 表单相关
    const dialogVisible = ref(false)
    const submitting = ref(false)
    const isEdit = ref(false)
    const formRef = ref(null)
    const form = reactive({
      id: null,
      title: '',
      description: '',
      sortOrder: 1,
      deadline: null,
      status: 'pending'
    })

    const rules = {
      title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
      description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
    }

    const init = async () => {
      // 获取书籍信息
      if (bookStore.currentBook.item?.id === bookId) {
        book.value = bookStore.currentBook.item
      } else {
        const b = bookStore.getBookFromLists(bookId)
        if (b) book.value = b
        else {
           await bookStore.fetchBookById(bookId)
           book.value = bookStore.currentBook.item
        }
      }
      loadOutlines()
    }

    const loadOutlines = async () => {
      loading.value = true
      try {
        const res = await OutlineService.getOutlines(bookId, { page: 1, size: 100 })
        if (res) {
          outlines.value = (res.records || []).sort((a, b) => a.sortOrder - b.sortOrder)
        }
      } catch (e) {
        console.error(e)
        ElMessage.error('加载大纲失败')
      } finally {
        loading.value = false
      }
    }

    const openDialog = (item = null) => {
      isEdit.value = !!item
      if (item) {
        Object.assign(form, item)
      } else {
        form.id = null
        form.title = ''
        form.description = ''
        form.deadline = null
        form.status = 'pending'
        // 自动计算序号
        const maxOrder = outlines.value.length > 0 ? Math.max(...outlines.value.map(o => o.sortOrder)) : 0
        form.sortOrder = maxOrder + 1
      }
      dialogVisible.value = true
    }

    const handleSubmit = async () => {
      if (!formRef.value) return
      await formRef.value.validate(async (valid) => {
        if (valid) {
          submitting.value = true
          try {
            const data = { ...form, bookId }
            if (isEdit.value) {
              await OutlineService.updateOutline(form.id, data)
              ElMessage.success('更新成功')
            } else {
              await OutlineService.createOutline(data)
              ElMessage.success('创建成功')
            }
            dialogVisible.value = false
            loadOutlines()
          } catch (e) {
            console.error(e)
            ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
          } finally {
            submitting.value = false
          }
        }
      })
    }

    const handleDelete = (item) => {
      ElMessageBox.confirm(`确定要删除大纲 "${item.title}" 吗？`, '警告', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }).then(async () => {
        try {
          await OutlineService.deleteOutline(bookId, item.id)
          ElMessage.success('删除成功')
          loadOutlines()
        } catch (e) {
          ElMessage.error('删除失败')
        }
      }).catch(() => {})
    }

    onMounted(() => {
      init()
    })

    return {
      book,
      loading,
      outlines,
      activeNames,
      dialogVisible,
      submitting,
      isEdit,
      form,
      rules,
      formRef,
      openDialog,
      handleSubmit,
      handleDelete,
      formatDate
    }
  }
}
</script>

<style scoped>
.author-outline-manager {
  max-width: 1200px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.left {
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
}
.ml-2 { margin-left: 8px; }

.outline-title-row {
  display: flex;
  align-items: center;
  width: 100%;
}
.order-badge {
  background: #409eff;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 12px;
}
.outline-title {
  font-weight: bold;
  flex: 1;
}
.outline-meta {
  margin-right: 12px;
}
.outline-content {
  padding: 8px 36px;
  color: #606266;
  white-space: pre-wrap;
}
.mb-2 { margin-bottom: 8px; }
</style>
