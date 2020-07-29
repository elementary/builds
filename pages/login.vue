<template>
  <div>
    Logging In...
  </div>
</template>

<script>
export default {
  computed: {
    callback () {
      return (this.$route.query.code != null)
    }
  },

  mounted () {
    if (!this.callback) {
      this.login()
    }
  },

  methods: {
    login () {
      return this.$auth.loginWith('github')
    }
  }
}
</script>
