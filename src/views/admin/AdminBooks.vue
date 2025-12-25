<template>
  <div class="admin-books">
    <el-card shadow="never">
      <div class="header">
        <div class="title">书籍管理</div>
        <el-space>
          <el-select v-model="status" placeholder="状态" size="small" style="width:140px">
            <el-option label="全部" value="" />
            <el-option label="待审核" value="pending_review" />
            <el-option label="已发布" value="published" />
            <el-option label="连载中" value="serializing" />
            <el-option label="已完结" value="completed" />
          </el-select>
        </el-space>
      </div>
      <div class="content">
        <el-empty description="功能开发中" />
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'AdminBooks',
  data() {
    return {
      status: ''
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
