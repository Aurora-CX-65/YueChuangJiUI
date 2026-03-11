<template>
  <div class="form-container">
    <h2>登录</h2>
    <el-form 
      ref="loginFormRef"
      :model="loginForm" 
      :rules="rules" 
      label-width="120px"
      @submit.prevent="login"
    >
      <el-form-item label="用户名或邮箱" prop="username">
        <el-input 
          v-model="loginForm.username" 
          placeholder="请输入用户名或邮箱"
          :prefix-icon="User"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="密码" prop="password">
        <el-input 
          v-model="loginForm.password" 
          type="password" 
          placeholder="请输入密码"
          :prefix-icon="Lock"
          show-password
          clearable
        />
      </el-form-item>
      
      <el-form-item>
        <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
      </el-form-item>
      
      <el-form-item>
        <el-button 
          type="primary" 
          @click="login"
          :loading="loading"
          style="width: 100%"
        >
          {{ loading ? '登录中...' : '登录' }}
        </el-button>
      </el-form-item>
    </el-form>
    
    <div class="links">
      <router-link to="/auth/register">注册新账号</router-link>
      <router-link to="/auth/forgot-password">忘记密码？</router-link>
    </div>
    <el-dialog v-model="banDialogVisible" title="登录受限" width="520px">
      <div class="ban-content">
        <p v-if="banInfo.type === 'banned'">您的账户已被永久封禁</p>
        <p v-else-if="banInfo.type === 'suspended'">您的账户已被临时封禁，解封时间：{{ formatDateTime(banInfo.until) }}</p>
        <p v-if="banInfo.reason">封禁原因：{{ banInfo.reason }}</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="banDialogVisible = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/user-store.js';
import { notificationManager } from '@/utils/notification-manager.js';
import { User, Lock } from '@element-plus/icons-vue';
import { UserService } from '@/services/user-service.js'

export default {
  name: 'LoginForm',
  data() {
    return {
      loading: false,
      loginForm: {
        username: '',
        password: '',
        rememberMe: false,
      },
      banDialogVisible: false,
      banInfo: { type: '', reason: '', until: '' },
      rules: {
        username: [
          { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
          { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      }
    };
  },
  setup() {
    return {
      User,
      Lock
    };
  },
  methods: {
    formatDateTime(val) {
      if (!val) return ''
      const d = typeof val === 'string' ? new Date(val) : val
      if (isNaN(d.getTime())) return val
      const y = d.getFullYear()
      const M = String(d.getMonth() + 1).padStart(2, '0')
      const D = String(d.getDate()).padStart(2, '0')
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      const s = String(d.getSeconds()).padStart(2, '0')
      return `${y}-${M}-${D} ${h}:${m}:${s}`
    },
    async login() {
      // 验证表单
      if (!this.$refs.loginFormRef) return;
      
      const valid = await this.$refs.loginFormRef.validate().catch(() => false);
      if (!valid) return;
      
      this.loading = true;
      const userStore = useUserStore();
      
      try {
        await userStore.login({ 
          username: this.loginForm.username, 
          password: this.loginForm.password,
          rememberMe: this.loginForm.rememberMe
        });
        if (userStore.isLoggedIn) {
          notificationManager.show('登录成功！', 'success');
          this.$router.push('/');
        }
      } catch (error) {
        const status = error.status || error.response?.status
        const code = error.code || error.data?.code
        if (status === 403 && (code === 309 || code === 310)) {
          try {
            const u = this.loginForm.username.trim()
            if (u) {
              const info = await UserService.getUserByUsername(u)
              const reason = info?.banReason || ''
              const until = info?.banUntil || ''
              this.banInfo = { type: code === 309 ? 'banned' : 'suspended', reason, until }
              this.banDialogVisible = true
            } else {
              this.banInfo = { type: code === 309 ? 'banned' : 'suspended', reason: '', until: '' }
              this.banDialogVisible = true
            }
          } catch {
            this.banInfo = { type: code === 309 ? 'banned' : 'suspended', reason: '', until: '' }
            this.banDialogVisible = true
          }
        } else {
          // 其他登录错误提示
          notificationManager.show(error.message || '登录失败，请检查用户名和密码', 'error');
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
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
}

.remember-me {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.remember-me input[type="checkbox"] {
  width: auto;
  margin-right: 10px;
}

.remember-me label {
  display: inline;
  margin-bottom: 0;
  font-weight: normal;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.links {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
}
</style>
