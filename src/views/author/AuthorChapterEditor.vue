<template>
  <div class="author-chapter-editor">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div class="left">
            <span>{{ isEdit ? '编辑章节' : '创建章节' }}</span>
            <el-tag v-if="book" type="info" class="ml-2">{{ book.title }}</el-tag>
          </div>
          <div class="actions">
            <el-button @click="$router.back()">返回</el-button>
            <el-button v-if="isEdit" @click="versionDrawerVisible = true">历史版本</el-button>
            <el-button type="primary" :loading="saving" @click="saveChapter('draft')">保存草稿</el-button>
            <el-button type="success" :loading="saving" @click="saveChapter('published')">发布章节</el-button>
          </div>
        </div>
      </template>

      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        label-position="top"
        v-loading="loading"
      >
        <el-row :gutter="20">
          <el-col :span="18">
            <el-form-item label="章节标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入章节标题" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="章节序号" prop="orderNum">
              <el-input-number v-model="form.orderNum" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="章节内容" prop="content">
          <div class="editor-toolbar mb-2">
            <el-button-group>
              <el-button size="small" type="primary" plain @click="handleAiCorrect" :loading="aiLoading">
                <el-icon class="mr-1"><MagicStick /></el-icon> AI 纠错
              </el-button>
              <el-button size="small" type="primary" plain @click="handleAiContinue" :loading="aiLoading">
                <el-icon class="mr-1"><Edit /></el-icon> AI 续写
              </el-button>
            </el-button-group>
            <span class="word-count ml-4">当前字数: {{ wordCount }}</span>
          </div>
          
          <SelfHostedTinyEditor
            v-if="!loading"
            v-model="form.content"
            :init="editorInit"
            class="editor-content"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- AI 结果确认对话框 -->
    <el-dialog v-model="aiDialogVisible" :title="aiDialogTitle" width="600px">
      <div class="ai-result-preview">
        <div class="mb-2 font-bold">AI 生成结果：</div>
        <div class="p-3 bg-gray-50 rounded border result-text">{{ aiResult }}</div>
      </div>
      <template #footer>
        <el-button @click="aiDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="applyAiResult">采纳并应用</el-button>
      </template>
    </el-dialog>

    <!-- 历史版本抽屉 -->
    <el-drawer
      v-model="versionDrawerVisible"
      title="历史版本"
      direction="rtl"
      size="400px"
    >
      <div v-if="versionsLoading" class="loading">
        <el-skeleton :rows="3" animated />
      </div>
      <el-empty v-else-if="versions.length === 0" description="暂无历史版本" />
      <el-timeline v-else>
        <el-timeline-item
          v-for="version in versions"
          :key="version.id"
          :timestamp="formatDateTime(version.createdAt)"
          placement="top"
        >
          <el-card class="version-card">
            <h4>{{ version.versionNote || '自动保存' }}</h4>
            <p>字数: {{ version.wordCount }}</p>
            <el-button type="primary" size="small" @click="restoreVersion(version)">恢复此版本</el-button>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <div class="drawer-footer mt-4">
        <el-button @click="loadVersions">刷新列表</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChapterStore } from '@/stores/chapter-store'
import { useBookStore } from '@/stores/book-store'
import { AiService } from '@/services/ai-service'
import { MagicStick, Edit } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SelfHostedTinyEditor from '@/components/editor/SelfHostedTinyEditor.vue'
import { formatDate } from '@/utils/formatters'
import { ChapterService } from '@/services/chapter-service'

export default {
  name: 'AuthorChapterEditor',
  components: { SelfHostedTinyEditor, MagicStick, Edit },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const chapterStore = useChapterStore()
    const bookStore = useBookStore()

    const bookId = parseInt(route.params.id)
    const chapterId = route.params.chapterId ? parseInt(route.params.chapterId) : null
    const isEdit = !!chapterId

    const formRef = ref(null)
    const loading = ref(true)
    const saving = ref(false)
    const aiLoading = ref(false)
    const aiDialogVisible = ref(false)
    const aiDialogTitle = ref('')
    const aiResult = ref('')
    const aiActionType = ref('') // 'correct' or 'continue'

    // 版本控制相关
    const versionDrawerVisible = ref(false)
    const versionsLoading = ref(false)
    const versions = ref([])

    const form = reactive({
      title: '',
      orderNum: 1,
      content: ''
    })

    const rules = {
      title: [{ required: true, message: '请输入章节标题', trigger: 'blur' }],
      orderNum: [{ required: true, message: '请输入序号', trigger: 'change' }],
      content: [{ required: true, message: '请输入章节内容', trigger: 'blur' }]
    }

    const editorInit = {
      license_key: 'gpl',
      tinymceScriptSrc: '/tinymce/tinymce.min.js',
      height: 600,
      menubar: false,
      plugins: [
        'lists', 'link', 'image', 'table', 'code', 'help', 'wordcount', 'fullscreen'
      ],
      toolbar: 'undo redo | formatselect | bold italic backcolor | \
                alignleft aligncenter alignright alignjustify | \
                bullist numlist outdent indent | removeformat | help | fullscreen',
      language: 'zh_CN',
      language_url: '/tinymce/langs/zh_CN.js',
      skin_url: '/tinymce/skins/ui/oxide',
      content_css: '/tinymce/skins/content/default/content.css',
      promotion: false, // 禁用升级提示
      branding: false   // 禁用 branding
    }

    const book = computed(() => {
        if (bookStore.currentBook.item?.id === bookId) {
            return bookStore.currentBook.item
        }
        return bookStore.getBookFromLists(bookId)
    })

    // 简单字数统计
    const wordCount = computed(() => {
        // 去除 HTML 标签后统计
        const text = form.content.replace(/<[^>]+>/g, '')
        return text.length
    })

    const init = async () => {
      loading.value = true
      try {
        if (!book.value) {
           await bookStore.fetchBookById(bookId)
        }

        if (isEdit) {
          const chapter = await chapterStore.fetchChapterById(chapterId)
          if (chapter) {
            form.title = chapter.title
            form.orderNum = chapter.sortOrder
            form.content = chapter.content || ''
            // 加载版本历史
            loadVersions()
          }
        } else {
          // 创建模式，自动计算下一个序号
          // 先获取列表以确定最大序号
          await chapterStore.fetchChaptersByBook(bookId)
          const chapters = chapterStore.getChaptersByBookId(bookId).items
          if (chapters.length > 0) {
            const maxOrder = Math.max(...chapters.map(c => c.sortOrder))
            form.orderNum = maxOrder + 1
          }
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('初始化失败')
      } finally {
        loading.value = false
      }
    }

    const loadVersions = async () => {
      if (!isEdit) return
      versionsLoading.value = true
      try {
        const res = await ChapterService.getChapterVersions(chapterId)
        versions.value = res || []
      } catch (e) {
        console.error(e)
      } finally {
        versionsLoading.value = false
      }
    }

    const restoreVersion = async (version) => {
      try {
        await ElMessageBox.confirm('确定要恢复到此版本吗？当前未保存的内容将丢失。', '警告', {
          confirmButtonText: '确定恢复',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await ChapterService.restoreChapterVersion(chapterId, version.id)
        ElMessage.success('版本恢复成功')
        // 重新加载章节内容
        const chapter = await chapterStore.fetchChapterById(chapterId)
        if (chapter) {
          form.title = chapter.title
          form.content = chapter.content
        }
        versionDrawerVisible.value = false
      } catch (e) {
        if (e !== 'cancel') {
          ElMessage.error('恢复失败')
        }
      }
    }

    onMounted(() => {
      init()
    })

    const saveChapter = async (status) => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          saving.value = true
          try {
            const data = {
              bookId,
              title: form.title,
              content: form.content,
              sortOrder: form.orderNum, // 后端字段名为 sortOrder
              status,
              createVersion: true, // 每次保存都创建版本
              versionNote: '用户手动保存'
            }

            if (isEdit) {
              if (status === 'pending_review') {
                  // 如果是提交审核，调用 submit 接口（因为 update 接口不再支持变更状态为 published/pending）
                  // 先保存内容
                  await chapterStore.updateChapter(chapterId, { ...data, status: 'draft' })
                  // 再提交审核
                  await chapterStore.submitChapterForReview(chapterId)
                  ElMessage.success('章节已提交审核')
              } else {
                  await chapterStore.updateChapter(chapterId, data)
                  ElMessage.success('章节更新成功')
              }
              loadVersions() // 刷新版本列表
            } else {
              // 创建时 status 默认为 draft，如果用户点击提交审核，需要在创建后调用 submit
              const realStatus = status === 'pending_review' ? 'draft' : status
              const newChapter = await chapterStore.createChapter({ ...data, status: realStatus })
              
              if (status === 'pending_review' && newChapter) {
                  await chapterStore.submitChapterForReview(newChapter.id)
                  ElMessage.success('章节创建并提交审核成功')
              } else {
                  ElMessage.success('章节创建成功')
              }
            }
            if (!isEdit) {
                router.push(`/author/books/${bookId}/chapters`)
            }
          } catch (error) {
            console.error(error)
          } finally {
            saving.value = false
          }
        }
      })
    }

    // AI 功能实现
    const handleAiCorrect = async () => {
        const text = form.content.replace(/<[^>]+>/g, '').trim()
        if (!text || text.length < 10) {
            ElMessage.warning('内容太少，无法进行AI纠错（至少10个字）')
            return
        }

        aiLoading.value = true
        try {
            // 获取选中的文本，如果 TinyMCE 支持获取选区，否则对全文纠错
            // 这里简单对全文纠错，或者截取一部分
            // 考虑到 token 限制，建议只对最近的段落或全文进行处理
            // 为简化，这里发送全部纯文本
            const result = await AiService.autoCorrect(text)
            if (result) {
                aiResult.value = result
                aiDialogTitle.value = 'AI 自动纠错结果'
                aiActionType.value = 'correct'
                aiDialogVisible.value = true
            }
        } catch (error) {
            console.error(error)
        } finally {
            aiLoading.value = false
        }
    }

    const handleAiContinue = async () => {
        const text = form.content.replace(/<[^>]+>/g, '').trim()
        if (!text) {
            ElMessage.warning('请先输入一些内容作为续写的上下文')
            return
        }
        
        // 取最后 500 字作为上下文
        const context = text.slice(-500)
        
        aiLoading.value = true
        try {
            const result = await AiService.contentContinue(context)
            if (result) {
                aiResult.value = result
                aiDialogTitle.value = 'AI 续写结果'
                aiActionType.value = 'continue'
                aiDialogVisible.value = true
            }
        } catch (error) {
            console.error(error)
        } finally {
            aiLoading.value = false
        }
    }

    const applyAiResult = () => {
        if (aiActionType.value === 'correct') {
            // 纠错：替换全部内容 (这里比较粗暴，实际应该只替换对应部分或高亮差异)
            // 由于返回的是纯文本，可能会丢失格式，这是一个权衡
            // 如果要保留格式，需要更复杂的 diff 算法
            // 这里假设用户接受纯文本替换，或者我们只把结果追加到末尾供参考？
            // 需求是“自动纠错”，通常是替换。
            // 暂时实现为：追加到内容末尾供对比，或者直接替换。
            // 更好的体验是：弹出对比框，确认后替换。这里已经有弹窗确认。
            // 我们简单处理：将纠错结果用 <p> 包裹替换原有内容（慎重）
            // 或者：直接替换内容。
            form.content = aiResult.value // 注意：这会丢失 HTML 格式！
            ElMessage.success('已应用纠错结果（格式已重置）')
        } else if (aiActionType.value === 'continue') {
            // 续写：追加到末尾
            form.content += `<p>${aiResult.value}</p>`
            ElMessage.success('已追加续写内容')
        }
        aiDialogVisible.value = false
    }
    
    const formatDateTime = (val) => formatDate(val)

    return {
      isEdit,
      formRef,
      form,
      rules,
      loading,
      saving,
      aiLoading,
      book,
      wordCount,
      saveChapter,
      editorInit,
      handleAiCorrect,
      handleAiContinue,
      aiDialogVisible,
      aiDialogTitle,
      aiResult,
      applyAiResult,
      versionDrawerVisible,
      versionsLoading,
      versions,
      loadVersions,
      restoreVersion,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.author-chapter-editor {
  max-width: 1200px;
  margin: 0 auto;
}
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
.ml-2 { margin-left: 8px; }
.ml-4 { margin-left: 16px; }
.mr-1 { margin-right: 4px; }
.mb-2 { margin-bottom: 8px; }

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f7fa;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}
.word-count {
  font-size: 12px;
  color: #909399;
}
/* 修复 TinyMCE z-index 问题 */
:deep(.tox-tinymce) {
  border-radius: 0 0 4px 4px !important;
}

.result-text {
  white-space: pre-wrap;
  max-height: 400px;
  overflow-y: auto;
  line-height: 1.6;
}

.version-card {
  margin-bottom: 10px;
}
.version-card h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
}
.version-card p {
  margin: 0 0 8px 0;
  color: #909399;
  font-size: 12px;
}
</style>
