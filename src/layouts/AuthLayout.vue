<template>
  <div class="auth-layout">
    <div class="left-panel">
      <div class="brand-container">
        <img src="@/assets/logo.svg" alt="Logo" class="logo">
        <h1 class="brand-name">阅创集</h1>
        <p class="description">{{ $route.meta.description }}</p>
      </div>
    </div>
    <div class="right-panel">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthLayout',
};
</script>

<style scoped>
.auth-layout {
  display: flex;
  height: 100vh;
}

.left-panel {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--primary-gradient);
  color: var(--light-text-color, #FFF);
  padding: 40px;
}

.brand-container {
  text-align: center;
  max-width: 320px;
}

.logo {
  width: 100px;
  height: 100px;
  margin-bottom: 24px;
}

.brand-name {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.description {
  font-size: 1.2rem;
  line-height: 1.6;
}

.right-panel {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--secondary-color, #F8F9FA);
}

/* 响应式设计 - 移动端隐藏左侧内容区 */
@media (max-width: 768px) {
  .auth-layout {
    flex-direction: column;
  }
  
  .left-panel {
    display: none;
  }
  
  .right-panel {
    flex: none;
    height: 100vh;
    padding: 20px;
  }
}

/* 平板端适配 */
@media (max-width: 1024px) and (min-width: 769px) {
  .left-panel {
    flex: 0.8;
    padding: 30px;
  }
  
  .right-panel {
    flex: 1.2;
  }
  
  .brand-name {
    font-size: 2rem;
  }
  
  .description {
    font-size: 1rem;
  }
  
  .logo {
    width: 80px;
    height: 80px;
  }
}

/* 小屏幕移动端 */
@media (max-width: 480px) {
  .right-panel {
    padding: 15px;
  }
}
</style>