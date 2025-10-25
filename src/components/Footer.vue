<template>
  <footer class="footer">
    <p>&copy; 2024 阅创集. All rights reserved.</p>
    <nav>
      <a href="/about">关于我们</a>
      <a href="/contact">联系我们</a>
      <a href="/privacy">隐私政策</a>
    </nav>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: var(--footer-height);
  background-color: #f8f8f8;
  border-top: 1px solid #e7e7e7;
  color: var(--text-color);
  font-size: 14px;
}

.footer nav a {
  margin: 0 10px;
  color: var(--text-color);
  text-decoration: none;
}

.footer nav a:hover {
  color: var(--accent-color);
}
</style>