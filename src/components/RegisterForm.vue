<template>
  <div class="form-container">
    <h2>注册</h2>
    <el-form 
      ref="registerFormRef"
      :model="formData" 
      :rules="rules" 
      label-width="120px"
      @submit.prevent="register"
    >
      <!-- 用户名字段 -->
      <el-form-item label="用户名" prop="username">
        <el-input 
          v-model="formData.username" 
          placeholder="请输入用户名（3-20位字母、数字、下划线）"
          :prefix-icon="User"
          clearable
        />
      </el-form-item>

      <!-- 邮箱字段 -->
      <el-form-item label="邮箱" prop="email">
        <el-input 
          v-model="formData.email" 
          type="email"
          placeholder="请输入邮箱地址"
          :prefix-icon="Message"
          clearable
        />
      </el-form-item>

      <!-- 手机号字段 -->
      <el-form-item label="手机号" prop="phone">
        <el-input 
          v-model="formData.phone" 
          placeholder="请输入手机号（可选）"
          :prefix-icon="Phone"
          clearable
        />
      </el-form-item>

      <!-- 昵称字段 -->
      <el-form-item label="昵称" prop="nickname">
        <el-input 
          v-model="formData.nickname" 
          placeholder="请输入昵称（可选）"
          :prefix-icon="Avatar"
          clearable
        />
      </el-form-item>

      <!-- 密码字段 -->
      <el-form-item label="密码" prop="password">
        <el-input 
          v-model="formData.password" 
          type="password"
          placeholder="请输入密码（6-20位）"
          :prefix-icon="Lock"
          show-password
          clearable
        />
        <div v-if="formData.password && passwordStrength" class="password-strength">
          <el-tag 
            :type="getStrengthTagType(passwordStrength.strength)"
            size="small"
          >
            密码强度：{{ getStrengthText(passwordStrength.strength) }}
          </el-tag>
        </div>
      </el-form-item>

      <!-- 确认密码字段 -->
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input 
          v-model="formData.confirmPassword" 
          type="password"
          placeholder="请再次输入密码"
          :prefix-icon="Lock"
          show-password
          clearable
        />
      </el-form-item>

      <!-- 邮箱验证码字段 -->
      <el-form-item label="邮箱验证码" prop="emailCode">
        <div class="verification-code-group">
          <el-input 
            v-model="formData.emailCode" 
            placeholder="请输入验证码"
            :prefix-icon="Key"
            maxlength="6"
            clearable
            style="flex: 1; margin-right: 10px;"
          />
          <el-button 
            type="primary"
            @click="sendEmailCode"
            :disabled="!canSendCode || sendingCode"
            :loading="sendingCode"
          >
            {{ sendingCode ? '发送中...' : (countdown > 0 ? `${countdown}s` : '发送验证码') }}
          </el-button>
        </div>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button 
          type="primary" 
          @click="register"
          :loading="submitting"
          style="width: 100%"
        >
          {{ submitting ? '注册中...' : '注册' }}
        </el-button>
      </el-form-item>
    </el-form>
    
    <div class="links">
      <router-link to="/auth/login">已有账号？去登录</router-link>
    </div>
  </div>
</template>

<script>
import { reactive, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { AuthService } from '@/services/auth-service.js'
import { 
  validateEmail, 
  validatePhone, 
  validatePassword, 
  validateUsername 
} from '@/utils/validators.js'
import { notificationManager } from '@/utils'
import { User, Lock, Message, Phone, Avatar, Key } from '@element-plus/icons-vue'

export default {
  name: 'RegisterForm',
  setup() {
    const router = useRouter()
    const registerFormRef = ref(null)
    
    // 表单数据
    const formData = reactive({
      username: '',
      email: '',
      phone: '',
      nickname: '',
      password: '',
      confirmPassword: '',
      emailCode: ''
    })
    
    // Element Plus 表单验证规则
    const rules = reactive({
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
      ],
      phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
      ],
      nickname: [
        { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== formData.password) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ],
      emailCode: [
        { required: true, message: '请输入邮箱验证码', trigger: 'blur' },
        { pattern: /^\d{6}$/, message: '验证码应为6位数字', trigger: 'blur' }
      ]
    })
    
    // 错误信息（保留用于兼容性）
    const errors = reactive({
      username: '',
      email: '',
      phone: '',
      nickname: '',
      password: '',
      confirmPassword: '',
      emailCode: ''
    })
    
    // 状态管理
    const submitting = ref(false)
    const sendingCode = ref(false)
    const countdown = ref(0)
    
    // 密码强度
    const passwordStrength = computed(() => {
      if (!formData.password) return null
      return validatePassword(formData.password, {
        minLength: 6,
        maxLength: 20,
        requireNumbers: true
      })
    })
    
    // 是否可以发送验证码
    const canSendCode = computed(() => {
      return formData.email && validateEmail(formData.email) && countdown.value === 0
    })
    
    // 表单是否有效
    const isFormValid = computed(() => {
      return formData.username && 
             formData.email && 
             formData.password && 
             formData.confirmPassword && 
             formData.emailCode &&
             !Object.values(errors).some(error => error)
    })
    
    // 验证单个字段
    const validateField = async (fieldName) => {
      switch (fieldName) {
        case 'username':
          const usernameResult = validateUsername(formData.username)
          if (!usernameResult.isValid) {
            errors.username = usernameResult.errors[0]
          } else {
            // API验证用户名是否可用
            try {
              const isAvailable = await AuthService.checkUsername(formData.username.trim())
              errors.username = isAvailable ? '' : '用户名已被使用'
            } catch (error) {
              console.error('检查用户名失败:', error)
              errors.username = '用户名验证失败，请稍后重试'
            }
          }
          break
          
        case 'email':
          if (!formData.email) {
            errors.email = '邮箱不能为空'
          } else if (!validateEmail(formData.email)) {
            errors.email = '请输入有效的邮箱地址'
          } else {
            // API验证邮箱是否可用
            try {
              const isAvailable = await AuthService.checkEmail(formData.email.trim())
              errors.email = isAvailable ? '' : '邮箱已被注册'
            } catch (error) {
              console.error('检查邮箱失败:', error)
              errors.email = '邮箱验证失败，请稍后重试'
            }
          }
          break
          
        case 'phone':
          if (formData.phone && !validatePhone(formData.phone)) {
            errors.phone = '请输入有效的手机号码'
          } else {
            errors.phone = ''
          }
          break
          
        case 'nickname':
          if (formData.nickname && (formData.nickname.length < 2 || formData.nickname.length > 20)) {
            errors.nickname = '昵称长度应在2-20位之间'
          } else {
            errors.nickname = ''
          }
          break
          
        case 'password':
          const passwordResult = validatePassword(formData.password, {
            minLength: 6,
            maxLength: 20,
            requireNumbers: true
          })
          errors.password = passwordResult.isValid ? '' : passwordResult.errors[0]
          break
          
        case 'confirmPassword':
          if (!formData.confirmPassword) {
            errors.confirmPassword = '请确认密码'
          } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = '两次输入的密码不一致'
          } else {
            errors.confirmPassword = ''
          }
          break
          
        case 'emailCode':
          if (!formData.emailCode) {
            errors.emailCode = '请输入邮箱验证码'
          } else if (!/^\d{6}$/.test(formData.emailCode)) {
            errors.emailCode = '验证码应为6位数字'
          } else {
            errors.emailCode = ''
          }
          break
      }
    }
    
    // 清除字段错误
    const clearFieldError = (fieldName) => {
      errors[fieldName] = ''
    }
    
    // 发送邮箱验证码
    const sendEmailCode = async () => {
      if (!canSendCode.value) return
      
      try {
        sendingCode.value = true
        const result = await AuthService.sendEmailCode({
          email: formData.email,
          type: 'register'
        })
        
        if (result) {
          notificationManager.success('验证码已发送到您的邮箱')
          startCountdown()
        } else {
          notificationManager.error('验证码发送失败，请稍后重试')
        }
      } catch (error) {
        console.error('发送验证码失败:', error)
        notificationManager.error('验证码发送失败：' + (error.message || '网络错误'))
      } finally {
        sendingCode.value = false
      }
    }
    
    // 开始倒计时
    const startCountdown = () => {
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    }
    
    // 获取密码强度文本
    const getStrengthText = (strength) => {
      const strengthMap = {
        weak: '弱',
        medium: '中',
        strong: '强'
      }
      return strengthMap[strength] || '弱'
    }
    
    // 获取密码强度标签类型
    const getStrengthTagType = (strength) => {
      const typeMap = {
        weak: 'danger',
        medium: 'warning',
        strong: 'success'
      }
      return typeMap[strength] || 'danger'
    }
    
    // 注册处理
    const register = async () => {
      // 使用 Element Plus 表单验证
      if (!registerFormRef.value) return
      
      const valid = await registerFormRef.value.validate().catch(() => false)
      if (!valid) {
        notificationManager.error('请检查表单信息')
        return
      }
      
      try {
        submitting.value = true
        
        const registerRequest = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          emailCode: formData.emailCode.trim()
        }
        
        // 添加可选字段
        if (formData.phone) {
          registerRequest.phone = formData.phone.trim()
        }
        if (formData.nickname) {
          registerRequest.nickname = formData.nickname.trim()
        }
        
        const result = await AuthService.register(registerRequest)
        
        if (result) {
          notificationManager.success('注册成功！请登录')
          router.push('/auth/login')
        } else {
          notificationManager.error('注册失败，请稍后重试')
        }
      } catch (error) {
        console.error('注册失败:', error)
        notificationManager.error('注册失败：' + (error.message || '网络错误'))
      } finally {
        submitting.value = false
      }
    }
    
    // 监听密码变化，重新验证确认密码
    watch(() => formData.password, () => {
      if (formData.confirmPassword) {
        validateField('confirmPassword')
      }
    })
    
    return {
      registerFormRef,
      formData,
      rules,
      errors,
      submitting,
      sendingCode,
      countdown,
      passwordStrength,
      canSendCode,
      isFormValid,
      validateField,
      clearFieldError,
      sendEmailCode,
      getStrengthText,
      getStrengthTagType,
      register,
      // 图标
      User,
      Lock,
      Message,
      Phone,
      Avatar,
      Key
    }
  }
}
</script>

<style scoped>
.form-container {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.required {
  color: #e74c3c;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

input.error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
}

.verification-code-group {
  display: flex;
  gap: 10px;
}

.verification-code-group input {
  flex: 1;
}

.send-code-btn {
  padding: 12px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  transition: background-color 0.3s ease;
}

.send-code-btn:hover:not(:disabled) {
  background-color: #218838;
}

.send-code-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.password-strength {
  margin-top: 5px;
  font-size: 12px;
}

.strength-weak {
  color: #e74c3c;
}

.strength-medium {
  color: #f39c12;
}

.strength-strong {
  color: #27ae60;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.links {
  margin-top: 20px;
  text-align: center;
}

.links a {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
}

.links a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .form-container {
    width: 100%;
    padding: 20px;
    margin: 0 10px;
  }
  
  .verification-code-group {
    flex-direction: column;
  }
  
  .send-code-btn {
    width: 100%;
  }
}
</style>