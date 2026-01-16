<template>
  <div class="author-timeline-manager">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div class="left">
            <span>时间线管理</span>
            <el-tag v-if="book" type="info" class="ml-2">{{ book.title }}</el-tag>
          </div>
          <div class="actions">
            <el-button @click="$router.push('/author/books')">返回书籍列表</el-button>
            <el-button type="primary" @click="openDialog()">添加事件</el-button>
          </div>
        </div>
      </template>

      <div v-if="loading" class="loading">
        <el-skeleton :rows="3" animated />
      </div>
      
      <el-empty v-else-if="events.length === 0" description="暂无时间线事件" />
      
      <div v-else class="timeline-wrapper">
        <el-timeline>
          <el-timeline-item
            v-for="(event, index) in events"
            :key="event.id"
            :timestamp="event.timePoint"
            placement="top"
            type="primary"
          >
            <el-card class="timeline-card">
              <div class="event-header">
                <span class="event-title">{{ event.title }}</span>
                <div class="event-actions">
                  <el-button link type="primary" size="small" @click="openDialog(event)">编辑</el-button>
                  <el-button link type="danger" size="small" @click="handleDelete(event)">删除</el-button>
                </div>
              </div>
              <div class="event-desc">{{ event.description }}</div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>

    <!-- 编辑/创建对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑事件' : '添加事件'" 
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="时间点" prop="timePoint">
          <el-input v-model="form.timePoint" placeholder="如：公元2023年、第一纪元等" maxlength="50" />
        </el-form-item>
        <el-form-item label="事件标题" prop="title">
          <el-input v-model="form.title" placeholder="简要概括事件" maxlength="100" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="1" />
        </el-form-item>
        <el-form-item label="详细描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="4" 
            placeholder="详细事件经过" 
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
import { TimelineService } from '@/services/timeline-service'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AuthorTimelineManager',
  setup() {
    const route = useRoute()
    const bookStore = useBookStore()
    const bookId = parseInt(route.params.id)

    const loading = ref(false)
    const events = ref([])
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
      timePoint: '',
      sortOrder: 1
    })

    const rules = {
      title: [{ required: true, message: '请输入事件标题', trigger: 'blur' }],
      timePoint: [{ required: true, message: '请输入时间点', trigger: 'blur' }]
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
      loadEvents()
    }

    const loadEvents = async () => {
      loading.value = true
      try {
        const res = await TimelineService.getEvents(bookId)
        if (res) {
          events.value = res
        }
      } catch (e) {
        console.error(e)
        ElMessage.error('加载时间线失败')
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
        form.timePoint = ''
        // 自动计算序号
        const maxOrder = events.value.length > 0 ? Math.max(...events.value.map(e => e.sortOrder)) : 0
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
              await TimelineService.updateEvent(form.id, data)
              ElMessage.success('更新成功')
            } else {
              await TimelineService.createEvent(data)
              ElMessage.success('创建成功')
            }
            dialogVisible.value = false
            loadEvents()
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
      ElMessageBox.confirm(`确定要删除事件 "${item.title}" 吗？`, '警告', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }).then(async () => {
        try {
          await TimelineService.deleteEvent(item.id)
          ElMessage.success('删除成功')
          loadEvents()
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
      events,
      dialogVisible,
      submitting,
      isEdit,
      form,
      rules,
      formRef,
      openDialog,
      handleSubmit,
      handleDelete
    }
  }
}
</script>

<style scoped>
.author-timeline-manager {
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

.timeline-container {
  position: relative;
  padding: 40px 0 80px;
  min-height: 400px;
}

.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #e4e7ed;
  transform: translateX(-50%);
  border-radius: 2px;
}

.timeline-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  position: relative;
  width: 100%;
}

.timeline-item.left {
  flex-direction: row;
}

.timeline-item.right {
  flex-direction: row-reverse;
}

.timeline-content {
  width: 45%;
  position: relative;
  z-index: 1;
}

.timeline-item.left .timeline-content {
  margin-right: auto;
  text-align: right;
}

.timeline-item.right .timeline-content {
  margin-left: auto;
  text-align: left;
}

.timeline-point {
  position: absolute;
  left: 50%;
  width: 16px;
  height: 16px;
  background: #409eff;
  border-radius: 50%;
  transform: translateX(-50%);
  border: 4px solid #fff;
  box-shadow: 0 0 0 2px #409eff;
  z-index: 2;
}

.timeline-time {
  position: absolute;
  top: 0;
  width: 45%;
  font-size: 14px;
  color: #909399;
  font-weight: bold;
}

.timeline-item.left .timeline-time {
  right: 0;
  text-align: left;
  padding-left: 30px;
}

.timeline-item.right .timeline-time {
  left: 0;
  text-align: right;
  padding-right: 30px;
}

.timeline-add-btn {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transition: all 0.3s;
  z-index: 2;
  border: 4px solid #fff;
}

.timeline-add-btn:hover {
  transform: translateX(-50%) scale(1.1);
  background: #66b1ff;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.timeline-item.left .event-header {
  flex-direction: row-reverse;
}

.event-title {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.event-desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

/* 适配左侧内容的特殊排版 */
.timeline-item.left .event-desc {
  /* text-align: right; */ /* 保持内容左对齐可能更好读，视需求而定 */
}
</style>
