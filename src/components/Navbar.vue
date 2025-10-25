<template>
  <header class="navbar">
    <div class="navbar-left">
      <img src="@/assets/logo.svg" alt="Logo" class="logo" />
      <span class="brand-name">阅创集</span>
      <nav class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/books">书库</router-link>
        <router-link to="/ranking">排行</router-link>
      </nav>
    </div>
    <div class="navbar-right">
      <div class="search-bar">
        <input type="text" placeholder="搜索..." />
        <button>搜索</button>
      </div>
      <div class="user-info">
        <router-link to="/login">登录</router-link>
        <router-link to="/register">注册</router-link>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Navbar'
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--header-height);
  padding: 0 20px;
  background: var(--primary-gradient);
  color: white;
}

.navbar-left, .navbar-right, .nav-links, .user-info {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  margin-right: 10px;
}

.brand-name {
  font-size: 20px;
  font-weight: bold;
  margin-right: 20px;
}

.nav-links a, .user-info a {
  color: white;
  text-decoration: none;
  margin: 0 10px;
  transition: color 0.3s;
}

.nav-links a:hover, .user-info a:hover {
  color: var(--accent-color);
}

.search-bar {
  display: flex;
}

.search-bar input {
  border: none;
  padding: 5px;
  border-radius: 3px 0 0 3px;
}

.search-bar button {
  border: none;
  padding: 5px 10px;
  background-color: var(--accent-color);
  color: white;
  border-radius: 0 3px 3px 0;
  cursor: pointer;
}
</style>