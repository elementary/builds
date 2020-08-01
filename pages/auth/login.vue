<template>
  <div class="center">
    <h1>elementary OS Daily Builds</h1>
    <p>Logging into GitHub</p>
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
