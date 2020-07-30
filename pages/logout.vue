<template>
  <div class="center">
    <p>Logging Out...</p>
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
