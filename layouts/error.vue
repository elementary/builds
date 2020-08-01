<template>
  <div class="center">
    <h1>elementary OS Daily Builds</h1>
    <p>An Error Occured</p>
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
