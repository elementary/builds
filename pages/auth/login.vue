<template>
  <div class="center">
    <h1>elementary OS Early Access Builds</h1>
    <template v-if="error">
      <p role="alert">{{ error }}</p>
      <button class="button suggested" @click="attemptLogin">Try again</button>
    </template>
    <p v-else>Logging in to GitHub...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRoute } from '#app'

const authStore = useAuthStore()
const route = useRoute()
const error = ref<string | null>(null)

const attemptLogin = async () => {
  error.value = null
  console.log('[Login Page] Fetching login URL...');
  try {
    const url = await authStore.fetchLoginUrl();
    console.log(`[Login Page] Got login URL, redirecting to GitHub: ${url}`);
    window.location.href = url;
  } catch (e) {
    console.error('[Login Page] Failed to get login URL for redirect:', e);
    error.value = "Couldn't reach the login service. Check your network and try again.";
  }
}

onMounted(() => {
  console.log('[Login Page] Mounted.');
  // Check for redirect query parameter and store it
  const redirectPath = route.query.redirect as string | undefined;
  if (redirectPath && typeof redirectPath === 'string') {
    try {
      sessionStorage.setItem('loginRedirect', redirectPath);
      console.log(`[Login Page] Stored redirect path for post-login: ${redirectPath}`);
    } catch (e) {
      console.error('[Login Page] Failed to save redirect path to sessionStorage:', e);
    }
  } else {
    console.log('[Login Page] No redirect path in query.');
    try {
      sessionStorage.removeItem('loginRedirect');
    } catch (e) {
      console.error('[Login Page] Failed to clear redirect path from sessionStorage:', e);
    }
  }

  // Fetch the GitHub login URL and redirect (or surface an error to retry)
  attemptLogin();
});
</script>
