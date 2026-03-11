<template>
  <div class="admin-tags">
    <el-card shadow="never">
      <div class="header">
        <div class="title">标签管理</div>
        <el-button type="primary" size="small" @click="openCreate">新增标签</el-button>
      </div>
      <div class="content">
        <div v-if="loading" class="loading"><el-skeleton :rows="6" animated /></div>
        <el-empty v-else-if="tags.length === 0" description="暂无标签" />
        <el-table v-else :data="tags" border size="small">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="名称" width="200" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="color" label="颜色" width="140" />
          <el-table-column label="操作" width="260" fixed="right">
            <template #default="{ row }">
              <el-space wrap>
                <el-button size="small" @click="openEdit(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="remove(row)">删除</el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination" v-if="total > 0">
          <el-pagination
            v-model:current-page="page"
            :page-size="size"
            :total="total"
            layout="total, prev, pager, next, jumper"
            background
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增标签' : '编辑标签'" width="520px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="form.color" show-alpha />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { AdminService } from '@/services/admin-service.js'
export default {
  name: 'AdminTags'
  ,
  data() {
    return {
      loading: false,
      tags: [],
      dialogVisible: false,
      dialogMode: 'create',
      saving: false,
      form: { name: '', description: '', color: '' },
      editId: null,
      page: 1,
      size: 10,
      total: 0
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const res = await AdminService.getAdminTags(this.page, this.size)
        this.tags = res?.records || []
        this.total = res?.total || 0
      } catch (e) {
        console.error('加载标签失败:', e)
      } finally {
        this.loading = false
      }
    },
    handlePageChange(p) {
      this.page = p
      this.load()
    },
    openCreate() {
      this.dialogMode = 'create'
      this.form = { name: '', description: '', color: '' }
      this.editId = null
      this.dialogVisible = true
    },
    openEdit(row) {
      this.dialogMode = 'edit'
      this.editId = row.id
      this.form = { name: row.name, description: row.description, color: row.color || '' }
      this.dialogVisible = true
    },
    async submit() {
      if (!this.form.name || !this.form.name.trim()) {
        window.notificationManager.error('请填写标签名称')
        return
      }
      this.saving = true
      try {
        // 确保颜色值为字符串，如果为 null 则设为空字符串
        const colorVal = this.form.color || ''
        
        if (this.dialogMode === 'create') {
          await AdminService.createTag({ 
            name: this.form.name.trim(), 
            description: this.form.description?.trim() || '', 
            color: colorVal 
          })
          window.notificationManager.success('新增标签成功')
        } else {
          await AdminService.updateTag(this.editId, { 
            name: this.form.name.trim(), 
            description: this.form.description?.trim() || '', 
            color: colorVal 
          })
          window.notificationManager.success('更新标签成功')
        }
        this.dialogVisible = false
        this.load()
      } catch (e) {
        console.error('保存标签失败:', e)
        window.notificationManager.error(e.message || '保存标签失败')
      } finally {
        this.saving = false
      }
    },
    async remove(row) {
      try {
        await AdminService.deleteTag(row.id)
        window.notificationManager.success('删除标签成功')
        this.load()
      } catch (e) {
        console.error('删除标签失败:', e)
        window.notificationManager.error(e.message || '删除标签失败')
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
  margin-bottom: 12px;
}
.title { font-weight: 600; }
.loading { padding: 12px; }
</style>
