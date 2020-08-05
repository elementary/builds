<template>
  <div class="center">
    <h1>elementary OS Early Access Builds</h1>
    <p>Checking Sponsorship</p>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  mounted () {
    this.checkForErrors()
    this.auth()
  },

  methods: {
    ...mapActions('auth', ['authenticate']),

    async auth () {
      const { code } = this.$route.query
      const success = await this.authenticate({ code })

      if (success) {
        this.$router.push('/downloads')
      } else {
        this.$router.push('/sponsor')
      }
    },

    checkForErrors () {
      const { code, error_description: error } = this.$route.query

      if (error != null) {
        this.$error({
          statusCode: 500,
          message: error
        })
      } else if (code == null) {
        this.$error({
          statusCode: 404,
          message: 'Bad authentication from GitHub'
        })
      }
    }
  }
}
</script>
