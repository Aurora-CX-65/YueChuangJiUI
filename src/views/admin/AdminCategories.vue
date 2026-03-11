<template>
  <div class="admin-categories">
    <el-card shadow="never">
      <div class="header">
        <div class="title">分类管理</div>
        <el-button type="primary" size="small" @click="openCreate">新增分类</el-button>
      </div>
      <div class="content">
        <div v-if="loading" class="loading"><el-skeleton :rows="6" animated /></div>
        <el-empty v-else-if="categories.length === 0" description="暂无分类" />
        <el-table v-else :data="categories" border size="small">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="名称" width="200" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="sortOrder" label="排序" width="100" />
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

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增分类' : '编辑分类'" width="520px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
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
  name: 'AdminCategories'
  ,
  data() {
    return {
      loading: false,
      categories: [],
      dialogVisible: false,
      dialogMode: 'create',
      saving: false,
      form: { name: '', description: '', sortOrder: 0 },
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
        const res = await AdminService.getAdminCategories(this.page, this.size)
        this.categories = res?.records || []
        this.total = res?.total || 0
      } catch (e) {
        console.error('加载分类失败:', e)
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
      this.form = { name: '', description: '', sortOrder: 0 }
      this.editId = null
      this.dialogVisible = true
    },
    openEdit(row) {
      this.dialogMode = 'edit'
      this.editId = row.id
      this.form = { name: row.name, description: row.description, sortOrder: row.sortOrder ?? 0 }
      this.dialogVisible = true
    },
    async submit() {
      if (!this.form.name || !this.form.name.trim()) {
        window.notificationManager.error('请填写分类名称')
        return
      }
      this.saving = true
      try {
        if (this.dialogMode === 'create') {
          await AdminService.createCategory({ name: this.form.name.trim(), description: this.form.description?.trim() || '', sortOrder: this.form.sortOrder ?? 0 })
          window.notificationManager.success('新增分类成功')
        } else {
          await AdminService.updateCategory(this.editId, { name: this.form.name.trim(), description: this.form.description?.trim() || '', sortOrder: this.form.sortOrder ?? 0 })
          window.notificationManager.success('更新分类成功')
        }
        this.dialogVisible = false
        this.load()
      } catch (e) {
        console.error('保存分类失败:', e)
        window.notificationManager.error(e.message || '保存分类失败')
      } finally {
        this.saving = false
      }
    },
    async remove(row) {
      try {
        await AdminService.deleteCategory(row.id)
        window.notificationManager.success('删除分类成功')
        this.load()
      } catch (e) {
        console.error('删除分类失败:', e)
        window.notificationManager.error(e.message || '删除分类失败')
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
