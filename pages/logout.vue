<template>
  <div class="center">
    <h1>Logging Out...</h1>
  </div>
</template>

<script>
export default {
  mounted () {
    if (process.client) {
      this.logout()
    }
  },

  methods: {
    async logout () {
      await this.$auth.logout()
      this.$router.push('/')
    }
  }
}
</script>
