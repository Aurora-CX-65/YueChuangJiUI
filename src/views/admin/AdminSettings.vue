<template>
  <div class="admin-settings">
    <el-card shadow="never">
      <div class="header">
        <div class="title">系统设置</div>
        <el-space>
          <el-button type="primary" :loading="saving" @click="save">保存</el-button>
          <el-button :disabled="saving" @click="resetChanges">重置</el-button>
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
    </el-card>
  </div>
  </template>
  
  <script>
  import { AdminService } from '@/services/admin-service.js'
  export default {
    name: 'AdminSettings',
    data() {
      return {
        loading: false,
        saving: false,
        original: {},
        form: {},
        formNumber: {},
        formFloat: {}
      }
    },
    mounted() {
      this.load()
    },
    methods: {
      async load() {
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
      async save() {
        const changes = this.buildPayload()
        if (Object.keys(changes).length === 0) {
          window.notificationManager && window.notificationManager.info('无改动需要保存')
          return
        }
        // 简单校验
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
      resetChanges() {
        this.form = { ...this.original }
        this.formNumber = this.extractNumbers(this.form)
        this.formFloat = this.extractFloats(this.form)
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
