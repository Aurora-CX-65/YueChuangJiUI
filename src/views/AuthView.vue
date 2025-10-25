<template>
  <div>
    <!-- The form will be placed here -->
    <div class="form-placeholder">表单区域</div>
  </div>
</template>

<script>
export default {
  name: 'AuthView',
};
</script>

<style scoped>
.form-placeholder {
  width: 300px;
  height: 400px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
}
</style>