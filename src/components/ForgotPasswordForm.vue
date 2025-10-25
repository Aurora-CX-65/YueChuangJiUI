<template>
  <div class="forgot-password-container">
    <div class="form-header">
      <h2>忘记密码</h2>
      <p class="subtitle">请按照以下步骤重置您的密码</p>
    </div>

    <!-- 步骤时间线 -->
    <el-steps :active="currentStep - 1" finish-status="success" align-center>
      <el-step 
        v-for="(step, index) in steps" 
        :key="index"
        :title="step.title"
      />
    </el-steps>

    <!-- 表单内容 -->
    <div class="form-content">
      <!-- 步骤1: 输入邮箱 -->
      <div v-if="currentStep === 1" class="step-form">
        <el-form 
          ref="emailFormRef"
          :model="formData" 
          :rules="emailRules"
          label-width="120px"
          @submit.prevent="sendVerificationCode"
        >
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="formData.email"
              type="email"
              placeholder="请输入您的邮箱"
              :prefix-icon="Message"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary"
              :loading="loading"
              :disabled="!formData.email"
              @click="sendVerificationCode"
              class="send-code-btn"
              style="width: 100%;"
            >
              {{ loading ? '发送中...' : '发送验证码' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2: 验证邮箱验证码 -->
      <div v-if="currentStep === 2" class="step-form">
        <el-alert
          :title="`验证码已发送至 ${formData.email}，请查收邮件并输入验证码`"
          type="info"
          :closable="false"
          show-icon
          class="info-alert"
        />
        <el-form 
          ref="codeFormRef"
          :model="formData" 
          :rules="codeRules"
          label-width="120px"
          @submit.prevent="verifyCode"
        >
          <el-form-item label="验证码" prop="code">
            <el-input
              v-model="formData.code"
              placeholder="请输入6位验证码"
              maxlength="6"
              :prefix-icon="Key"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary"
              :loading="loading"
              :disabled="!formData.code"
              @click="verifyCode"
              class="verify-btn"
              style="width: 100%;"
            >
              {{ loading ? '验证中...' : '验证' }}
            </el-button>
          </el-form-item>
          <div class="resend-section">
            <el-button 
              type="text"
              @click="resendCode"
              :disabled="resendCountdown > 0 || loading"
              class="resend-btn"
            >
              {{ resendCountdown > 0 ? `${resendCountdown}s后重发` : '重新发送验证码' }}
            </el-button>
          </div>
          <div class="form-actions">
            <el-button @click="goToPreviousStep">
              上一步
            </el-button>
          </div>
        </el-form>
      </div>

      <!-- 步骤3: 设置新密码 -->
      <div v-if="currentStep === 3" class="step-form">
        <el-alert
          title="请设置您的新密码"
          type="info"
          :closable="false"
          show-icon
          class="info-alert"
        />
        <el-form 
          ref="passwordFormRef"
          :model="formData" 
          :rules="passwordRules"
          label-width="120px"
          @submit.prevent="resetPassword"
        >
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="formData.newPassword"
              type="password"
              placeholder="请输入新密码（6-20位）"
              :prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
              v-model="formData.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              :prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>
          <div class="form-actions">
            <el-button @click="goToPreviousStep">
              上一步
            </el-button>
            <el-button 
              type="primary"
              :loading="loading"
              :disabled="!formData.newPassword || !formData.confirmPassword"
              @click="resetPassword"
            >
              {{ loading ? '重置中...' : '完成重置' }}
            </el-button>
          </div>
        </el-form>
      </div>

      <!-- 成功页面 -->
      <div v-if="currentStep === 4" class="success-step">
        <el-result
          icon="success"
          title="密码重置成功！"
          sub-title="您的密码已成功重置，请使用新密码登录"
        >
          <template #extra>
            <el-button type="primary" @click="goToLogin">
              前往登录
            </el-button>
          </template>
        </el-result>
      </div>
    </div>

    <!-- 返回登录链接 -->
    <div v-if="currentStep < 4" class="links">
      <router-link to="/auth/login">返回登录</router-link>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Lock, Key } from '@element-plus/icons-vue'
import { AuthService } from '@/services/auth-service.js'
import { notificationManager } from '@/utils/notification-manager.js'

export default {
  name: 'ForgotPasswordForm',
  setup() {
    const router = useRouter()
    
    // 表单引用
    const emailFormRef = ref(null)
    const codeFormRef = ref(null)
    const passwordFormRef = ref(null)
    
    // 状态管理
    const currentStep = ref(1)
    const loading = ref(false)
    const resendCountdown = ref(0)
    const resendTimer = ref(null)
    
    // 步骤配置
    const steps = [
      { title: '输入邮箱' },
      { title: '验证邮箱' },
      { title: '设置密码' }
    ]
    
    // 表单数据
    const formData = reactive({
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    // Element Plus 验证规则
    const emailRules = reactive({
      email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
      ]
    })
    
    const codeRules = reactive({
      code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { pattern: /^\d{6}$/, message: '验证码应为6位数字', trigger: 'blur' }
      ]
    })
    
    const passwordRules = reactive({
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== formData.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    })
    
    // 错误信息（保留用于兼容性）
    const errors = reactive({})
    
    // 生命周期钩子
    onBeforeUnmount(() => {
      if (resendTimer.value) {
        clearInterval(resendTimer.value)
      }
    })
    
    // 步骤1: 发送验证码
    const sendVerificationCode = async () => {
      if (!emailFormRef.value) return
      
      const valid = await emailFormRef.value.validate().catch(() => false)
      if (!valid) return
      
      loading.value = true
      try {
        await AuthService.sendEmailCode({
          email: formData.email,
          type: 'reset'
        })
        
        notificationManager.success('验证码已发送到您的邮箱，请查收')
        currentStep.value = 2
        startResendCountdown()
      } catch (error) {
        notificationManager.error(error.message || '发送验证码失败，请重试')
      } finally {
        loading.value = false
      }
    }
    
    // 步骤2: 验证验证码
    const verifyCode = async () => {
      if (!codeFormRef.value) return
      
      const valid = await codeFormRef.value.validate().catch(() => false)
      if (!valid) return
      
      loading.value = true
      try {
        await AuthService.verifyEmailCode(
          formData.email,
          formData.code,
          'reset'
        )
        
        notificationManager.success('验证码验证成功')
        currentStep.value = 3
      } catch (error) {
        notificationManager.error(error.message || '验证码错误或已过期')
      } finally {
        loading.value = false
      }
    }
    
    // 步骤3: 重置密码
    const resetPassword = async () => {
      if (!passwordFormRef.value) return
      
      const valid = await passwordFormRef.value.validate().catch(() => false)
      if (!valid) return
      
      loading.value = true
      try {
        await AuthService.resetPassword({
          email: formData.email,
          code: formData.code,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
        
        notificationManager.success('密码重置成功！')
        currentStep.value = 4
      } catch (error) {
        notificationManager.error(error.message || '密码重置失败，请重试')
      } finally {
        loading.value = false
      }
    }
    
    // 重新发送验证码
    const resendCode = async () => {
      loading.value = true
      try {
        await AuthService.sendEmailCode({
          email: formData.email,
          type: 'reset'
        })
        
        notificationManager.success('验证码已重新发送')
        startResendCountdown()
      } catch (error) {
        notificationManager.error(error.message || '发送验证码失败，请重试')
      } finally {
        loading.value = false
      }
    }
    
    // 开始重发倒计时
    const startResendCountdown = () => {
      resendCountdown.value = 60
      resendTimer.value = setInterval(() => {
        resendCountdown.value--
        if (resendCountdown.value <= 0) {
          clearInterval(resendTimer.value)
          resendTimer.value = null
        }
      }, 1000)
    }
    
    // 返回上一步
    const goToPreviousStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--
      }
    }
    
    // 前往登录页面
    const goToLogin = () => {
      router.push('/auth/login')
    }
    
    return {
      // 表单引用
      emailFormRef,
      codeFormRef,
      passwordFormRef,
      // 状态
      currentStep,
      loading,
      resendCountdown,
      steps,
      // 表单数据和规则
      formData,
      emailRules,
      codeRules,
      passwordRules,
      errors,
      // 方法
      sendVerificationCode,
      verifyCode,
      resetPassword,
      resendCode,
      goToPreviousStep,
      goToLogin,
      // 图标
      Message,
      Lock,
      Key
    }
  }
}
</script>

<style scoped>
.forgot-password-container {
  width: 400px;
  margin: 0 auto;
  padding: 30px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h2 {
  color: #333;
  margin-bottom: 8px;
  font-size: 24px;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* Element Plus 步骤条样式调整 */
.el-steps {
  margin-bottom: 40px;
}

/* Element Plus 表单样式调整 */
.el-form {
  width: 100%;
}

.el-form-item {
  margin-bottom: 20px;
}

/* 按钮间距调整 */
.send-code-btn,
.verify-btn {
  margin-top: 10px;
}

/* 按钮样式 */
.el-button {
  width: 100%;
  margin-bottom: 10px;
}

.el-button + .el-button {
  margin-left: 0;
}

/* 成功页面样式 */
.el-result {
  padding: 40px 0;
}

/* 返回登录链接样式 */
.back-to-login {
  text-align: center;
  margin-top: 20px;
}

.back-to-login .el-link {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .forgot-password-container {
    width: calc(100% - 20px);
    margin: 10px;
    padding: 20px;
  }
}
</style>