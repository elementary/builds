<template>
  <div class="center">
    <h1>elementary OS Early Access Builds</h1>
    <p>Logging in to GitHub</p>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  mounted () {
    this.login()
  },

  methods: {
    ...mapActions('auth', ['loginUrl']),

    async login () {
      const url = await this.loginUrl()
      window.location = url
    }
  }
}
</script>
