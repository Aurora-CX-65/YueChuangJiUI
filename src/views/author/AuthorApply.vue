<template>
  <div class="author-apply-container">
    <el-card class="apply-card">
      <template #header>
        <div class="card-header">
          <h2>申请成为作者</h2>
          <p class="subtitle">加入阅创集，开启您的创作之旅</p>
        </div>
      </template>
      
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else-if="!canApply && latestApplication" class="application-status">
        <el-result
          :icon="getStatusIcon(latestApplication.status)"
          :title="getStatusTitle(latestApplication.status)"
          :sub-title="getStatusDesc(latestApplication.status)"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
            <el-button v-if="latestApplication.status === 'PENDING'" @click="withdraw" :loading="withdrawing">撤销申请</el-button>
          </template>
        </el-result>
      </div>

      <el-form
        v-else
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="apply-form"
      >
        <el-alert
          title="请认真填写以下信息，我们将会在3个工作日内完成审核。"
          type="info"
          show-icon
          :closable="false"
          class="mb-4"
        />

        <el-form-item label="笔名" prop="penName">
          <el-input 
            v-model="form.penName" 
            placeholder="请输入您的笔名（展示给读者的名字）"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="联系方式" prop="contactInfo">
          <el-input 
            v-model="form.contactInfo" 
            placeholder="请输入您的手机号或邮箱，方便我们联系您"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item label="个人简介/创作计划" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea"
            :rows="6"
            placeholder="请简单介绍一下您自己，或者您的创作计划..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="submit-btn" @click="submitForm" :loading="submitting">
            提交申请
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user-store'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AuthorApply',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const formRef = ref(null)
    const loading = ref(true)
    const submitting = ref(false)
    const withdrawing = ref(false)

    const form = reactive({
      penName: '',
      contactInfo: '',
      description: ''
    })

    const rules = {
      penName: [
        { required: true, message: '请输入笔名', trigger: 'blur' },
        { min: 2, max: 20, message: '笔名长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      contactInfo: [
        { required: true, message: '请输入联系方式', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '请输入个人简介', trigger: 'blur' },
        { min: 10, message: '简介至少 10 个字符', trigger: 'blur' }
      ]
    }

    const latestApplication = computed(() => userStore.authorApplication.latestApplication)
    const canApply = computed(() => userStore.authorApplication.canApply)

    const init = async () => {
      loading.value = true
      try {
        if (!userStore.isLoggedIn) {
          router.push('/auth/login')
          return
        }
        // 如果已经是作者，直接跳转到个人中心
        if (userStore.isAuthor) {
          ElMessage.success('您已经是作者了')
          router.push('/profile')
          return
        }
        
        await Promise.all([
          userStore.checkCanApplyAuthor(),
          userStore.fetchLatestApplication()
        ])
        
        // 如果有被拒绝的申请，可以重新申请，但可能需要预填信息？
        // 这里简化处理，如果是 REJECTED 且 canApply 为 true，则清空表单让用户重新填
        if (canApply.value && latestApplication.value?.status === 'REJECTED') {
           // 可选：预填信息
           form.penName = latestApplication.value.penName
           form.contactInfo = latestApplication.value.contactInfo
           form.description = latestApplication.value.description
        }
      } catch (error) {
        console.error('初始化失败', error)
        ElMessage.error('获取申请状态失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      init()
    })

    const submitForm = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          submitting.value = true
          try {
            await userStore.applyForAuthor(form)
            // 提交成功后重新检查状态
            await init()
          } catch (error) {
            // 错误已在 store 中处理
          } finally {
            submitting.value = false
          }
        }
      })
    }

    const withdraw = async () => {
      if (!latestApplication.value) return
      
      try {
        await ElMessageBox.confirm('确定要撤销当前的申请吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        withdrawing.value = true
        await userStore.withdrawApplication(latestApplication.value.id)
        await init()
        ElMessage.success('申请已撤销')
      } catch (error) {
        if (error !== 'cancel') {
          console.error(error)
        }
      } finally {
        withdrawing.value = false
      }
    }

    const getStatusIcon = (status) => {
      if (!status) return 'info'
      switch (status.toUpperCase()) {
        case 'PENDING': return 'info'
        case 'APPROVED': return 'success'
        case 'REJECTED': return 'warning'
        default: return 'info'
      }
    }

    const getStatusTitle = (status) => {
      if (!status) return '未知状态'
      switch (status.toUpperCase()) {
        case 'PENDING': return '审核中'
        case 'APPROVED': return '审核通过'
        case 'REJECTED': return '申请被驳回'
        default: return '未知状态'
      }
    }

    const getStatusDesc = (status) => {
      if (!status) return ''
      switch (status.toUpperCase()) {
        case 'PENDING': return '您的申请正在审核中，请耐心等待。'
        case 'APPROVED': return '恭喜您成为作者！'
        case 'REJECTED': return `驳回原因：${latestApplication.value?.reason || '不符合要求'}`
        default: return ''
      }
    }

    return {
      formRef,
      form,
      rules,
      loading,
      submitting,
      withdrawing,
      latestApplication,
      canApply,
      submitForm,
      withdraw,
      getStatusIcon,
      getStatusTitle,
      getStatusDesc
    }
  }
}
</script>

<style scoped>
.author-apply-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.apply-card {
  min-height: 400px;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.subtitle {
  margin: 8px 0 0;
  color: #909399;
  font-size: 14px;
}

.apply-form {
  padding: 20px 0;
}

.mb-4 {
  margin-bottom: 24px;
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
  padding: 12px;
  font-size: 16px;
}

.application-status {
  padding: 40px 0;
}
</style>
