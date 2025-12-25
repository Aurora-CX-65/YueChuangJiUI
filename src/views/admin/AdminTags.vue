<template>
  <div class="admin-tags">
    <el-card shadow="never">
      <div class="header">
        <div class="title">标签管理</div>
        <el-button type="primary" size="small">新增标签</el-button>
      </div>
      <div class="content">
        <el-empty description="功能开发中" />
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'AdminTags'
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
