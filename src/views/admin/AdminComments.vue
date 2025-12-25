<template>
  <div class="admin-comments">
    <el-card shadow="never">
      <div class="header">
        <div class="title">评论管理</div>
        <el-select v-model="status" placeholder="状态" size="small" style="width:140px">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </div>
      <div class="content">
        <el-empty description="功能开发中" />
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'AdminComments',
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
