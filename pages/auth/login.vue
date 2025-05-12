<template>
  <div class="center">
    <h1>elementary OS Early Access Builds</h1>
    <p>Logging in to GitHub...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRoute, navigateTo } from '#app'

const authStore = useAuthStore()
const route = useRoute()

onMounted(async () => {
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
    } catch (e) {}
  }

  // Fetch the GitHub login URL
  console.log('[Login Page] Fetching login URL...');
  const url = await authStore.fetchLoginUrl();
  if (url) {
    console.log(`[Login Page] Got login URL, redirecting to GitHub: ${url}`);
    window.location.href = url;
  } else {
    console.error('[Login Page] Failed to get login URL for redirect.');
  }
});
</script>
