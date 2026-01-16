<template>
  <div class="author-settings">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>创作设置</span>
        </div>
      </template>
      
      <el-form :model="settings" label-width="120px" class="settings-form">
        <div class="section-title">编辑器偏好</div>
        
        <el-form-item label="默认字号">
          <el-input-number v-model="settings.fontSize" :min="12" :max="30" />
          <span class="unit">px</span>
        </el-form-item>
        
        <el-form-item label="行高">
          <el-input-number v-model="settings.lineHeight" :min="1.0" :max="3.0" :step="0.1" />
        </el-form-item>

        <el-form-item label="编辑器主题">
          <el-radio-group v-model="settings.theme">
            <el-radio label="light">明亮 (默认)</el-radio>
            <el-radio label="dark">暗黑</el-radio>
            <el-radio label="eye-care">护眼</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-divider />

        <div class="section-title">写作习惯</div>

        <el-form-item label="自动保存">
          <el-switch v-model="settings.autoSave" />
          <span class="tip" v-if="settings.autoSave">每 2 分钟自动保存</span>
        </el-form-item>

        <el-form-item label="首行缩进">
          <el-switch v-model="settings.indent" />
        </el-form-item>

        <el-form-item label="智能标点">
          <el-switch v-model="settings.smartPunctuation" active-text="自动转换中英文标点" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveSettings" :loading="saving">保存设置</el-button>
          <el-button @click="resetSettings">恢复默认</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'AuthorSettings',
  setup() {
    const saving = ref(false)
    const defaultSettings = {
      fontSize: 16,
      lineHeight: 1.8,
      theme: 'light',
      autoSave: true,
      indent: true,
      smartPunctuation: true
    }

    const settings = reactive({ ...defaultSettings })

    onMounted(() => {
      // 从 LocalStorage 加载设置
      const saved = localStorage.getItem('author_creative_settings')
      if (saved) {
        try {
          Object.assign(settings, JSON.parse(saved))
        } catch (e) {
          console.error('加载设置失败', e)
        }
      }
    })

    const saveSettings = () => {
      saving.value = true
      setTimeout(() => {
        localStorage.setItem('author_creative_settings', JSON.stringify(settings))
        ElMessage.success('设置已保存')
        saving.value = false
        // 这里可以触发一个全局事件或更新 Store，让编辑器即时生效
      }, 500)
    }

    const resetSettings = () => {
      Object.assign(settings, defaultSettings)
      saveSettings()
    }

    return {
      settings,
      saving,
      saveSettings,
      resetSettings
    }
  }
}
</script>

<style scoped>
.author-settings {
  max-width: 800px;
  margin: 0 auto;
}
.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 20px 0;
  padding-left: 10px;
  border-left: 4px solid var(--el-color-primary);
}
.unit {
  margin-left: 10px;
  color: #909399;
}
.tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
</style>
