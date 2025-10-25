<template>
  <div id="app">
    <Navbar />
    <main class="content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer
  }
}
</script>

<style>
.content {
  min-height: calc(100vh - var(--header-height) - var(--footer-height));
  padding-top: var(--header-height);
}
</style>
