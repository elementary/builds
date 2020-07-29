<template>
  <div>
    <Navbar />
    <nuxt />
  </div>
</template>

<style lang="scss">
@import "@fortawesome/fontawesome-free/css/all.css";
html {
  font-family: Inter, "Open Sans", "Noto Sans", "Roboto", "Droid Sans", sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}
*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}
</style>

<script>
import Navbar from '../components/Navbar.vue'

export default {
  components: {
    Navbar
  }
}
</script>
