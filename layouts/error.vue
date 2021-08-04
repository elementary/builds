<template>
  <div>
    <h2>An Error Occured</h2>
    <p>
      Try reloading or heading to the <nuxt-link to="/">
        home page
      </nuxt-link>.
    </p>
  </div>
</template>

<script>
export default {
  layout: 'default',

  props: {
    error: {
      type: [Object, String],
      default: 'An Error Occured'
    }
  },

  mounted () {
    // eslint-disable-next-line no-console
    console.error(this.error)
  }
}
</script>
