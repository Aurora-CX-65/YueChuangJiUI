<template>
  <div class="author-character-manager">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div class="left">
            <span>角色管理</span>
            <el-tag v-if="book" type="info" class="ml-2">{{ book.title }}</el-tag>
          </div>
          <div class="actions">
            <el-button @click="$router.push('/author/books')">返回书籍列表</el-button>
            <el-button type="primary" @click="openDialog()">创建新角色</el-button>
          </div>
        </div>
      </template>

      <div class="filter-bar mb-4">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索角色姓名" 
          style="width: 200px" 
          @keyup.enter="loadCharacters"
          clearable
          @clear="loadCharacters"
        >
          <template #append>
            <el-button @click="loadCharacters"><el-icon><Search /></el-icon></el-button>
          </template>
        </el-input>
      </div>

      <div v-if="loading" class="loading">
        <el-skeleton :rows="3" animated />
      </div>
      
      <el-empty v-else-if="characters.length === 0" description="暂无角色设定" />
      
      <div v-else class="character-grid">
        <el-card 
          v-for="char in characters" 
          :key="char.id" 
          class="character-card" 
          shadow="hover"
        >
          <div class="char-header">
            <div class="char-name">{{ char.name }}</div>
            <div class="char-role-type">
              <el-tag size="small" :type="getRoleTypeTag(parseRole(char.notes))">{{ parseRole(char.notes) }}</el-tag>
            </div>
          </div>
          <div class="char-content">
            <div class="char-info-item">
              <span class="label">性格:</span>
              <span class="value">{{ char.personality || '暂无' }}</span>
            </div>
            <div class="char-desc">{{ parseDescription(char.notes) || '暂无描述' }}</div>
          </div>
          <div class="char-footer">
            <el-button link type="primary" @click="openDialog(char)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(char)">删除</el-button>
          </div>
        </el-card>
      </div>

      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="page"
          :page-size="size"
          :total="total"
          layout="prev, pager, next"
          background
          @current-change="loadCharacters"
        />
      </div>
    </el-card>

    <!-- 编辑/创建对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑角色' : '创建角色'" 
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="角色姓名" maxlength="50" />
        </el-form-item>
        <el-form-item label="定位" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色定位" style="width: 100%">
            <el-option label="主角" value="主角" />
            <el-option label="配角" value="配角" />
            <el-option label="反派" value="反派" />
            <el-option label="路人" value="路人" />
          </el-select>
        </el-form-item>
        <el-form-item label="性格" prop="personality">
          <el-input v-model="form.personality" placeholder="简要描述性格" maxlength="100" />
        </el-form-item>
        <el-form-item label="外貌" prop="appearance">
          <el-input v-model="form.appearance" type="textarea" :rows="2" placeholder="外貌描写" />
        </el-form-item>
        <el-form-item label="背景" prop="background">
          <el-input v-model="form.background" type="textarea" :rows="3" placeholder="身世背景" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="详细设定描述" />
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
import { CharacterService } from '@/services/character-service'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AuthorCharacterManager',
  components: { Search },
  setup() {
    const route = useRoute()
    const bookStore = useBookStore()
    const bookId = parseInt(route.params.id)

    const loading = ref(false)
    const characters = ref([])
    const page = ref(1)
    const size = ref(12) // 卡片布局每页多一点
    const total = ref(0)
    const searchKeyword = ref('')
    const book = ref(null)

    // 表单相关
    const dialogVisible = ref(false)
    const submitting = ref(false)
    const isEdit = ref(false)
    const formRef = ref(null)
    const form = reactive({
      id: null,
      name: '',
      role: '',
      personality: '',
      appearance: '',
      background: '',
      description: ''
    })

    const rules = {
      name: [{ required: true, message: '请输入角色姓名', trigger: 'blur' }],
      role: [{ required: true, message: '请选择角色定位', trigger: 'change' }]
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
      loadCharacters()
    }

    const loadCharacters = async () => {
      loading.value = true
      try {
        // 后端接口目前返回的是 List<CharacterSettingResponse>，不是分页对象
        // 且后端 getCharacterSettings 接口暂不支持分页参数
        const res = await CharacterService.getCharacters(bookId)
        
        if (Array.isArray(res)) {
          // 如果有搜索关键词，在前端进行过滤（临时方案，或者后续对接后端搜索接口）
          let allData = res
          if (searchKeyword.value) {
            const keyword = searchKeyword.value.toLowerCase()
            allData = allData.filter(c => 
              c.name.toLowerCase().includes(keyword) || 
              (c.notes && c.notes.toLowerCase().includes(keyword))
            )
          }
          
          total.value = allData.length
          // 前端分页
          const start = (page.value - 1) * size.value
          const end = start + size.value
          characters.value = allData.slice(start, end)
        } else if (res && res.records) {
          // 兼容后端如果改为分页结构
          characters.value = res.records
          total.value = res.total
        } else {
            characters.value = []
            total.value = 0
        }
      } catch (e) {
        console.error(e)
        ElMessage.error('加载角色列表失败')
      } finally {
        loading.value = false
      }
    }

    const openDialog = (char = null) => {
      isEdit.value = !!char
      if (char) {
        Object.assign(form, char)
      } else {
        form.id = null
        form.name = ''
        form.role = '主角'
        form.personality = ''
        form.appearance = ''
        form.background = ''
        form.description = ''
      }
      dialogVisible.value = true
    }

    const handleSubmit = async () => {
      if (!formRef.value) return
      await formRef.value.validate(async (valid) => {
        if (valid) {
          submitting.value = true
          try {
      const requestData = {
        name: form.name,
        personality: form.personality,
        background: form.background,
        appearance: form.appearance,
        notes: JSON.stringify({
          role: form.role,
          description: form.description
        })
      }
      
      if (isEdit.value) {
        await CharacterService.updateCharacter(bookId, form.id, requestData)
        ElMessage.success('更新成功')
      } else {
        await CharacterService.createCharacter({ ...requestData, bookId })
        ElMessage.success('创建成功')
      }
            dialogVisible.value = false
            loadCharacters()
          } catch (e) {
            console.error(e)
            ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
          } finally {
            submitting.value = false
          }
        }
      })
    }

    const handleDelete = (char) => {
      ElMessageBox.confirm(`确定要删除角色 "${char.name}" 吗？`, '警告', {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }).then(async () => {
        try {
          await CharacterService.deleteCharacter(bookId, char.id)
          ElMessage.success('删除成功')
          loadCharacters()
        } catch (e) {
          ElMessage.error('删除失败')
        }
      }).catch(() => {})
    }

    const getRoleTypeTag = (role) => {
      const map = {
        '主角': 'danger',
        '配角': 'primary',
        '反派': 'info',
        '路人': ''
      }
      return map[role] || ''
    }

    const parseRole = (notes) => {
        try {
            if (!notes) return '未设定'
            // 尝试判断是否为 JSON 字符串
            if (notes.trim().startsWith('{')) {
                const parsed = JSON.parse(notes)
                return parsed.role || '未设定'
            }
            return '未设定'
        } catch (e) {
            return '未设定'
        }
    }

    const parseDescription = (notes) => {
        try {
            if (!notes) return ''
            if (notes.trim().startsWith('{')) {
                const parsed = JSON.parse(notes)
                return parsed.description || ''
            }
            return notes
        } catch (e) {
            return notes
        }
    }

    onMounted(() => {
      init()
    })

    return {
      book,
      loading,
      characters,
      page,
      size,
      total,
      searchKeyword,
      dialogVisible,
      submitting,
      isEdit,
      form,
      rules,
      formRef,
      loadCharacters,
      openDialog,
      handleSubmit,
      handleDelete,
      getRoleTypeTag,
      parseRole,
      parseDescription
    }
  }
}
</script>

<style scoped>
.author-character-manager {
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
.mb-4 { margin-bottom: 16px; }

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.character-card {
  display: flex;
  flex-direction: column;
}

.char-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.char-name {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.char-content {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  min-height: 80px;
}

.char-info-item {
  margin-bottom: 4px;
}

.label {
  color: #909399;
  margin-right: 4px;
}

.char-desc {
  margin-top: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #909399;
  font-size: 13px;
}

.char-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #ebeef5;
  padding-top: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
