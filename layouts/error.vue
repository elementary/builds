<template>
  <div>
    <!-- Consider adding minimal styling or layout components if needed -->
    <h2>An Error Occurred</h2>
    <p v-if="error">{{ error.message || 'Something went wrong.' }}</p>
    <p>
      Try reloading or heading to the <NuxtLink to="/">
        home page
      </NuxtLink>.
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useError, NuxtLink } from '#app'

// Get the error object provided by Nuxt
const error = useError()

onMounted(() => {
  if (error.value) {
    console.error('Error page mounted with error:', error.value)
  }
})

// You can add functions here to handle specific error codes if needed
// Example: Clear error and redirect
// import { clearError } from '#app'
// const handleError = () => clearError({ redirect: '/' })
</script>

<style scoped>
  /* Add minimal styling for the error page */
  div {
    padding: 2rem;
    text-align: center;
    font-family: sans-serif;
  }
  h2 {
    color: #d32f2f; /* Or use CSS variables */
    margin-bottom: 1rem;
  }
  p {
    margin-bottom: 0.5rem;
  }
  a {
    color: var(--link-color, blue); /* Use theme variable if available */
    text-decoration: underline;
  }
</style>
