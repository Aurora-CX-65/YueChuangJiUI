<template>
  <div class="author-book-edit">
    <el-card shadow="never" class="edit-card" v-loading="loading">
      <template #header>
        <div class="header">
          <span>编辑书籍信息</span>
          <el-button @click="$router.back()">返回</el-button>
        </div>
      </template>
      
      <el-form 
        v-if="!loading"
        ref="formRef"
        :model="form" 
        :rules="rules" 
        label-width="80px" 
        label-position="top"
        class="edit-form"
        v-loading="submitting"
      >
        <el-row :gutter="24">
          <el-col :span="16">
            <el-form-item label="书名" prop="title">
              <el-input v-model="form.title" placeholder="请输入书名（2-50字）" maxlength="50" show-word-limit />
            </el-form-item>

            <el-form-item label="笔名" prop="penName">
              <el-input v-model="form.penName" placeholder="请输入笔名" maxlength="20" />
            </el-form-item>
            
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="分类" prop="categoryId">
                  <el-select v-model="form.categoryId" placeholder="选择分类" style="width: 100%">
                    <el-option 
                      v-for="cat in categories" 
                      :key="cat.id" 
                      :label="cat.name" 
                      :value="cat.id" 
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="标签" prop="tagIds">
                  <el-select 
                    v-model="form.tagIds" 
                    multiple 
                    filterable 
                    placeholder="选择标签（最多5个）" 
                    style="width: 100%"
                    :multiple-limit="5"
                  >
                    <el-option 
                      v-for="tag in tags" 
                      :key="tag.id" 
                      :label="tag.name" 
                      :value="tag.id" 
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="简介" prop="description">
              <el-input 
                v-model="form.description" 
                type="textarea" 
                :rows="6" 
                placeholder="请输入书籍简介（10-500字）" 
                maxlength="500" 
                show-word-limit 
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="封面" prop="coverImage">
              <el-upload
                class="cover-uploader"
                action=""
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleCoverChange"
                accept="image/*"
              >
                <img v-if="coverUrl" :src="coverUrl" class="cover-image" />
                <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="form-tip">
                点击图片修改封面<br>
                建议尺寸 600x800，支持 jpg/png
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item class="form-actions">
          <el-button type="primary" @click="submitForm">保存修改</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBookStore } from '@/stores/book-store'
import { useCategoryStore } from '@/stores/category-store'
import { useTagStore } from '@/stores/tag-store'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'AuthorBookEdit',
  components: { Plus },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const bookStore = useBookStore()
    const categoryStore = useCategoryStore()
    const tagStore = useTagStore()
    
    const formRef = ref(null)
    const loading = ref(true)
    const submitting = ref(false)
    const coverFile = ref(null)
    const coverUrl = ref('')
    const bookId = route.params.id

    const form = reactive({
      title: '',
      penName: '',
      description: '',
      categoryId: null,
      tagIds: []
    })

    const rules = {
      title: [
        { required: true, message: '请输入书名', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      categoryId: [
        { required: true, message: '请选择分类', trigger: 'change' }
      ],
      description: [
        { required: true, message: '请输入简介', trigger: 'blur' },
        { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
      ]
    }

    onMounted(async () => {
      try {
        await Promise.all([
          categoryStore.fetchCategories(),
          tagStore.fetchTags(),
          bookStore.fetchBookById(bookId)
        ])
        
        const book = bookStore.currentBook.item
        if (book) {
          form.title = book.title
          form.penName = book.penName || book.authorUsername
          form.description = book.description
          form.categoryId = book.categoryId
          form.tagIds = book.tagIds || []
          coverUrl.value = book.coverUrl
          
          // 如果后端没返回 tagIds，但返回了 tags 对象列表，则需要转换
          if ((!book.tagIds || book.tagIds.length === 0) && book.tags && book.tags.length > 0) {
             form.tagIds = book.tags.map(t => t.id)
          }
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('加载书籍信息失败')
      } finally {
        loading.value = false
      }
    })

    const handleCoverChange = (file) => {
      const isJPG = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'
      const isLt2M = file.raw.size / 1024 / 1024 < 2

      if (!isJPG) {
        ElMessage.error('上传封面图片只能是 JPG/PNG 格式!')
        return
      }
      if (!isLt2M) {
        ElMessage.error('上传封面图片大小不能超过 2MB!')
        return
      }

      coverFile.value = file.raw
      coverUrl.value = URL.createObjectURL(file.raw)
    }

    const submitForm = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          submitting.value = true
          try {
            // 1. 更新书籍基本信息
            await bookStore.updateBook(bookId, form)
            
            // 2. 如果有新封面，上传封面
            if (coverFile.value) {
               await bookStore.uploadBookCover(bookId, coverFile.value)
            }
            
            ElMessage.success('修改成功')
            router.push('/author/books')
          } catch (error) {
            console.error(error)
          } finally {
            submitting.value = false
          }
        }
      })
    }

    return {
      formRef,
      form,
      rules,
      categories: computed(() => categoryStore.categories),
      tags: computed(() => tagStore.tags),
      loading,
      submitting,
      handleCoverChange,
      coverUrl,
      submitForm
    }
  }
}
</script>

<style scoped>
.edit-card {
  max-width: 1000px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.edit-form {
  padding: 20px 0;
}
.cover-uploader {
  text-align: center;
}
.cover-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 150px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: border-color 0.3s;
}
.cover-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}
.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 150px;
  height: 200px;
  line-height: 200px;
  text-align: center;
}
.cover-image {
  width: 150px;
  height: 200px;
  display: block;
  object-fit: cover;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.5;
}
.form-actions {
  margin-top: 40px;
}
</style>
