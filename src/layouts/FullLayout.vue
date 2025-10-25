<template>
  <div class="full-layout">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script>
import Navbar from '../components/Navbar.vue';
import Footer from '../components/Footer.vue';

export default {
  name: 'FullLayout',
  components: {
    Navbar,
    Footer,
  },
};
</script>

<style scoped>
.full-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  overflow-x: hidden;
  padding-top: var(--header-height);
}
</style>