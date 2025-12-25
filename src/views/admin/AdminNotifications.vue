<template>
  <div class="admin-notifications">
    <el-card shadow="never">
      <div class="header">
        <div class="title">通知管理</div>
        <el-select v-model="status" placeholder="状态" size="small" style="width:140px">
          <el-option label="全部" value="" />
          <el-option label="未读" value="unread" />
          <el-option label="已读" value="read" />
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
  name: 'AdminNotifications',
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
