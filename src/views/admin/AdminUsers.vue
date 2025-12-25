<template>
  <div class="admin-users">
    <el-card shadow="never">
      <div class="header">
        <div class="title">用户管理</div>
        <el-input v-model="keyword" placeholder="搜索用户名/邮箱" size="small" style="max-width:240px" />
      </div>
      <div class="content">
        <el-empty description="功能开发中" />
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'AdminUsers',
  data() {
    return {
      keyword: ''
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
</style>
