<template>
  <router-view />
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
/* 全局表格横向滚动修复 */
.el-table {
  width: 100% !important;
  overflow-x: hidden !important;
}
.el-table__body-wrapper {
  overflow-x: auto !important;
}
.el-table__header-wrapper,
.el-table__footer-wrapper {
  overflow-x: hidden !important;
}
</style>
