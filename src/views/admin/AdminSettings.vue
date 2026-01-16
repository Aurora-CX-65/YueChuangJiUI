<template>
  <div class="admin-settings">
    <el-card shadow="never">
      <el-tabs v-model="activeTab" class="settings-tabs">
        <!-- Tab 1: 系统参数 -->
        <el-tab-pane label="系统参数" name="params">
          <div class="header">
            <div class="title">系统参数配置</div>
            <el-space>
              <el-button type="primary" :loading="saving" @click="saveSettings">保存配置</el-button>
              <el-button :disabled="saving" @click="resetSettings">重置</el-button>
            </el-space>
          </div>
          <div class="content">
            <div v-if="loading" class="loading"><el-skeleton :rows="6" animated /></div>
            <template v-else>
              <el-form :model="form" label-width="160px">
                <el-form-item label="网站名称">
                  <el-input v-model="form['site.name']" placeholder="阅创集" />
                </el-form-item>
                <el-form-item label="网站描述">
                  <el-input v-model="form['site.description']" />
                </el-form-item>
                <el-form-item label="网站关键词">
                  <el-input v-model="form['site.keywords']" placeholder="逗号分隔" />
                </el-form-item>
                <el-form-item label="最大文件大小(字节)">
                  <el-input-number v-model="formNumber['upload.max_file_size']" :min="1" :max="2147483647" />
                </el-form-item>
                <el-form-item label="允许扩展名(逗号)">
                  <el-input v-model="form['upload.allowed_extensions']" placeholder="jpg,jpeg,png,gif" />
                </el-form-item>
                <el-form-item label="通知批量处理大小">
                  <el-input-number v-model="formNumber['notification.batch_size']" :min="1" :max="10000" />
                </el-form-item>
                <el-form-item label="AI每日使用限制">
                  <el-input-number v-model="formNumber['ai.daily_limit']" :min="0" :max="100000" />
                </el-form-item>
                <el-form-item label="AI模型">
                  <el-input v-model="form['ai.deepseek_model']" placeholder="deepseek-chat" />
                </el-form-item>
                <el-form-item label="AI API Key">
                  <el-input v-model="form['ai.deepseek_api_key']" type="password" show-password placeholder="请输入密钥" />
                </el-form-item>
                <el-form-item label="自动审核通过阈值(0-1)">
                  <el-input-number v-model="formFloat['audit.auto_approve_threshold']" :min="0" :max="1" :step="0.01" />
                </el-form-item>
                <el-form-item label="缓存默认过期(秒)">
                  <el-input-number v-model="formNumber['cache.default_ttl']" :min="0" :max="864000" />
                </el-form-item>
                <el-form-item label="密码最小长度">
                  <el-input-number v-model="formNumber['security.password_min_length']" :min="4" :max="128" />
                </el-form-item>
                <el-form-item label="登录最大尝试次数">
                  <el-input-number v-model="formNumber['security.login_max_attempts']" :min="1" :max="50" />
                </el-form-item>
              </el-form>
            </template>
          </div>
        </el-tab-pane>

        <!-- Tab 2: 轮播图管理 -->
        <el-tab-pane label="轮播图管理" name="banners">
          <div class="header">
            <div class="title">首页轮播图</div>
            <el-button type="primary" :icon="Plus" @click="openCreateBanner">添加轮播图</el-button>
          </div>
          
          <div class="content">
            <div v-if="bannersLoading" class="loading"><el-skeleton :rows="5" animated /></div>
            <el-empty v-else-if="banners.length === 0" description="暂无轮播图" />
            
            <el-table v-else :data="banners" border stripe>
              <el-table-column label="图片" width="180">
                <template #default="{ row }">
                  <el-image 
                    style="width: 150px; height: 80px; border-radius: 4px" 
                    :src="row.imageUrl" 
                    fit="cover"
                    :preview-src-list="[row.imageUrl]"
                    preview-teleported
                  />
                </template>
              </el-table-column>
              <el-table-column prop="title" label="标题" min-width="150" />
              <el-table-column label="跳转目标" min-width="200">
                <template #default="{ row }">
                  <div v-if="row.bookId">
                    <el-tag size="small" type="success">书籍ID: {{ row.bookId }}</el-tag>
                    <span v-if="row.bookTitle" style="margin-left:8px; font-size:12px; color:#666">{{ row.bookTitle }}</span>
                  </div>
                  <div v-else-if="row.linkUrl">
                    <el-link :href="row.linkUrl" target="_blank" type="primary" :underline="false">{{ row.linkUrl }}</el-link>
                  </div>
                  <span v-else class="text-gray">-</span>
                </template>
              </el-table-column>
              <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : 'info'">{{ row.status === 'active' ? '启用' : '停用' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button size="small" type="primary" link @click="openEditBanner(row)">编辑</el-button>
                  <el-popconfirm title="确定删除该轮播图吗？" @confirm="deleteBanner(row)">
                    <template #reference>
                      <el-button size="small" type="danger" link>删除</el-button>
                    </template>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination" v-if="bannerTotal > 0">
              <el-pagination
                v-model:current-page="bannerPage"
                :page-size="bannerSize"
                :total="bannerTotal"
                layout="total, prev, pager, next"
                background
                @current-change="handleBannerPageChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 轮播图编辑对话框 -->
    <el-dialog v-model="bannerDialogVisible" :title="isEditMode ? '编辑轮播图' : '添加轮播图'" width="500px">
      <el-form :model="bannerForm" label-width="80px" :rules="bannerRules" ref="bannerFormRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="bannerForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="图片" prop="imageUrl" required>
          <el-input v-model="bannerForm.imageUrl" placeholder="上传图片或输入图片地址" style="margin-bottom: 10px;" />
          <el-upload
            class="avatar-uploader"
            action="#"
            :http-request="uploadBannerImage"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="bannerForm.imageUrl" :src="bannerForm.imageUrl" class="banner-preview" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="form-tip">建议尺寸: 1200x400px, 支持 jpg/png</div>
        </el-form-item>
        <el-form-item label="跳转类型">
          <el-radio-group v-model="linkType">
            <el-radio label="book">关联书籍</el-radio>
            <el-radio label="url">外部链接</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="linkType === 'book'" label="关联书籍" prop="bookId">
          <el-select
            v-model="bannerForm.bookId"
            filterable
            remote
            reserve-keyword
            placeholder="输入书名搜索"
            :remote-method="searchBooks"
            :loading="bookLoading"
            style="width: 100%"
          >
            <el-option
              v-for="item in bookOptions"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            >
              <span style="float: left">{{ item.title }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">ID: {{ item.id }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="linkType === 'url'" label="链接URL" prop="linkUrl">
          <el-input v-model="bannerForm.linkUrl" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="bannerForm.sortOrder" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="bannerForm.status"
            active-value="active"
            inactive-value="inactive"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bannerDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="bannerSaving" @click="saveBanner">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { AdminService } from '@/services/admin-service.js'
import { UploadService } from '@/services/upload-service.js'
import { Plus } from '@element-plus/icons-vue'
import { markRaw } from 'vue'

export default {
  name: 'AdminSettings',
  components: { Plus },
  data() {
    return {
      activeTab: 'params',
      
      // System Settings Data
      loading: false,
      saving: false,
      original: {},
      form: {},
      formNumber: {},
      formFloat: {},
      Plus: markRaw(Plus), // Expose icon to template non-reactively

      // Banner Data
      banners: [],
      bannersLoading: false,
      bannerPage: 1,
      bannerSize: 10,
      bannerTotal: 0,
      
      // Banner Dialog
      bannerDialogVisible: false,
      bannerSaving: false,
      isEditMode: false,
      linkType: 'book', // 'book' or 'url'
      bookOptions: [],
      bookLoading: false,
      bannerForm: {
        id: null,
        title: '',
        imageUrl: '',
        linkUrl: '',
        bookId: null,
        sortOrder: 0,
        status: 'active'
      },
      bannerRules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        imageUrl: [{ required: true, message: '请上传图片', trigger: 'change' }]
      }
    }
  },
  mounted() {
    this.loadSettings()
    this.loadBanners()
  },
  methods: {
    // === System Settings Methods ===
    async loadSettings() {
      this.loading = true
      try {
        const res = await AdminService.getSystemSettings()
        this.original = res?.settings || {}
        this.form = { ...this.original }
        this.formNumber = this.extractNumbers(this.form)
        this.formFloat = this.extractFloats(this.form)
      } catch (e) {
        console.error('加载系统设置失败:', e)
      } finally {
        this.loading = false
      }
    },
    extractNumbers(map) {
      const out = {}
      const numericKeys = [
        'upload.max_file_size',
        'notification.batch_size',
        'ai.daily_limit',
        'cache.default_ttl',
        'security.password_min_length',
        'security.login_max_attempts'
      ]
      numericKeys.forEach(k => {
        const v = map[k]
        out[k] = v != null ? Number(v) : 0
      })
      return out
    },
    extractFloats(map) {
      const out = {}
      const floatKeys = ['audit.auto_approve_threshold']
      floatKeys.forEach(k => {
        const v = map[k]
        out[k] = v != null ? Number(v) : 0
      })
      return out
    },
    buildPayload() {
      const payload = {}
      const merged = { ...this.form }
      Object.keys(this.formNumber).forEach(k => {
        merged[k] = String(this.formNumber[k] ?? 0)
      })
      Object.keys(this.formFloat).forEach(k => {
        merged[k] = String(this.formFloat[k] ?? 0)
      })
      Object.keys(merged).forEach(k => {
        const oldVal = this.original[k]
        const newVal = merged[k]
        if (String(oldVal ?? '') !== String(newVal ?? '')) {
          payload[k] = newVal
        }
      })
      return payload
    },
    async saveSettings() {
      const changes = this.buildPayload()
      if (Object.keys(changes).length === 0) {
        window.notificationManager && window.notificationManager.info('无改动需要保存')
        return
      }
      if (this.formFloat['audit.auto_approve_threshold'] < 0 || this.formFloat['audit.auto_approve_threshold'] > 1) {
        window.notificationManager && window.notificationManager.error('自动审核阈值需在0-1之间')
        return
      }
      this.saving = true
      try {
        await AdminService.updateSystemSettings(changes)
        this.original = { ...this.original, ...changes }
        window.notificationManager && window.notificationManager.success('保存成功')
      } catch (e) {
        console.error('保存系统设置失败:', e)
      } finally {
        this.saving = false
      }
    },
    resetSettings() {
      this.form = { ...this.original }
      this.formNumber = this.extractNumbers(this.form)
      this.formFloat = this.extractFloats(this.form)
    },

    // === Banner Management Methods ===
    async loadBanners() {
      this.bannersLoading = true
      try {
        const res = await AdminService.getAdminBanners(this.bannerPage, this.bannerSize)
        this.banners = res?.records || []
        this.bannerTotal = res?.total || 0
      } catch (e) {
        console.error('加载轮播图失败:', e)
      } finally {
        this.bannersLoading = false
      }
    },
    handleBannerPageChange(p) {
      this.bannerPage = p
      this.loadBanners()
    },
    openCreateBanner() {
      this.isEditMode = false
      this.bannerForm = {
        id: null,
        title: '',
        imageUrl: '',
        linkUrl: '',
        bookId: null,
        sortOrder: 0,
        status: 'active'
      }
      this.linkType = 'book'
      this.bannerDialogVisible = true
    },
    openEditBanner(row) {
      this.isEditMode = true
      this.bannerForm = { ...row }
      // Determine link type
      if (this.bannerForm.bookId) {
        this.linkType = 'book'
        this.bannerForm.linkUrl = ''
        // Pre-fill options so the ID shows the title if possible
        if (row.bookTitle) {
            this.bookOptions = [{ id: row.bookId, title: row.bookTitle }]
        }
      } else {
        this.linkType = 'url'
        this.bannerForm.bookId = null
      }
      this.bannerDialogVisible = true
    },
    async uploadBannerImage(option) {
      try {
        const res = await AdminService.uploadBannerImage(option.file)
        this.bannerForm.imageUrl = res
      } catch (e) {
        console.error('上传图片失败', e)
        window.notificationManager && window.notificationManager.error('上传图片失败')
      }
    },
    beforeAvatarUpload(rawFile) {
      const isImage = rawFile.type.startsWith('image/')
      const isLt2M = rawFile.size / 1024 / 1024 < 2
      if (!isImage) {
        window.notificationManager && window.notificationManager.error('只能上传图片文件!')
        return false
      }
      if (!isLt2M) {
        window.notificationManager && window.notificationManager.error('图片大小不能超过 2MB!')
        return false
      }
      return true
    },
    async saveBanner() {
      this.$refs.bannerFormRef.validate(async (valid) => {
        if (!valid) return
        
        this.bannerSaving = true
        try {
          // Prepare payload
          const payload = {
            title: this.bannerForm.title,
            imageUrl: this.bannerForm.imageUrl,
            sortOrder: this.bannerForm.sortOrder,
            status: this.bannerForm.status
          }
          
          if (this.linkType === 'book') {
            payload.bookId = this.bannerForm.bookId
            payload.linkUrl = ''
          } else {
            payload.linkUrl = this.bannerForm.linkUrl
            payload.bookId = null
          }
          
          if (this.isEditMode) {
            await AdminService.updateBanner(this.bannerForm.id, payload)
            window.notificationManager && window.notificationManager.success('更新成功')
          } else {
            await AdminService.createBanner(payload)
            window.notificationManager && window.notificationManager.success('创建成功')
          }
          
          this.bannerDialogVisible = false
          this.loadBanners()
        } catch (e) {
          console.error('保存轮播图失败:', e)
          window.notificationManager && window.notificationManager.error(this.isEditMode ? '更新失败' : '创建失败')
        } finally {
          this.bannerSaving = false
        }
      })
    },
    async deleteBanner(row) {
      try {
        await AdminService.deleteBanner(row.id)
        window.notificationManager && window.notificationManager.success('删除成功')
        this.loadBanners()
      } catch (e) {
        console.error('删除轮播图失败:', e)
        window.notificationManager && window.notificationManager.error('删除失败')
      }
    },
    async searchBooks(query) {
      if (query !== '') {
        this.bookLoading = true
        try {
          const res = await AdminService.searchBooks(query)
          this.bookOptions = res || []
        } catch (e) {
          console.error('搜索书籍失败:', e)
          this.bookOptions = []
        } finally {
          this.bookLoading = false
        }
      } else {
        this.bookOptions = []
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
}
.title { font-weight: 600; font-size: 16px; }
.loading { padding: 12px; }
.form-tip { font-size: 12px; color: #909399; margin-top: 4px; }
.text-gray { color: #909399; }
.pagination { margin-top: 16px; display: flex; justify-content: center; }

/* Upload Styles */
.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 300px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
.banner-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
