<template>
  <div class="center">
    <h1>elementary OS Early Access Builds</h1>
    <p>Verifying authentication...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, showError, navigateTo } from '#app'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const processing = ref(false)

// Function to check for errors in query params
const checkForErrors = () => {
  console.log('[Callback Page] Checking for errors in query params:', route.query);
  const { code, error_description } = route.query

  if (typeof error_description === 'string' && error_description) {
    console.error('GitHub Auth Error:', error_description)
    // Display error, server won't redirect in this case
    showError({
      statusCode: 500,
      message: `Authentication Error: ${error_description}`
    })
    return true
  } else if (typeof code !== 'string' || !code) {
    console.error('GitHub Auth Error: Missing code')
    // Display error
    showError({
      statusCode: 400,
      message: 'Bad authentication callback from GitHub (Missing Code)'
    })
    return true
  }
  console.log('[Callback Page] No query errors found.');
  return false
}

// Function to perform authentication and client-side redirect
const performAuthentication = async () => {
  console.log('[Callback Page] Performing authentication...');
  const { code } = route.query
  if (typeof code !== 'string' || !code) return;

  try {
    // Await the result from the store action
    console.log('[Callback Page] Calling authStore.authenticate...');
    const success = await authStore.authenticate(code);
    console.log(`[Callback Page] authStore.authenticate returned: ${success}`);

    // Retrieve and clear the intended redirect path
    let intendedSessionRedirect: string | null = null;
    try {
      intendedSessionRedirect = sessionStorage.getItem('loginRedirect');
      if (intendedSessionRedirect != null) { // Check for null or undefined explicitly
        console.log(`[Callback Page] Raw intended redirect from sessionStorage: '${intendedSessionRedirect}' (length: ${intendedSessionRedirect.length})`);
        sessionStorage.removeItem('loginRedirect');
      } else {
        console.log(`[Callback Page] No intended redirect in sessionStorage (it was null/undefined).`);
      }
    } catch (e) {
      console.warn('[Callback Page] Could not access sessionStorage for redirect path:', e);
    }

    if (success) {
      console.log(`[Callback Page] Authentication successful. Setting justLoggedIn flag.`);
      try {
        sessionStorage.setItem('justLoggedIn', 'true'); // Set flag
      } catch (e) {
        console.warn('[Callback Page] Could not set justLoggedIn flag in sessionStorage:', e);
      }

      let determinedRedirectUrl: string;
      if (intendedSessionRedirect && intendedSessionRedirect.startsWith('/')) {
        determinedRedirectUrl = intendedSessionRedirect;
      } else {
        if (intendedSessionRedirect != null && intendedSessionRedirect !== "") { // Log if it was non-empty but invalid
            console.warn(`[Callback Page] intendedRedirect '${intendedSessionRedirect}' was invalid (not null, not empty, but not starting with '/'). Defaulting to /downloads.`);
        }
        determinedRedirectUrl = '/downloads'; // Default to /downloads
      }
      
      // Final safety net: if determinedRedirectUrl is somehow still empty or only whitespace, force to /downloads
      if (!determinedRedirectUrl || determinedRedirectUrl.trim() === "") {
          console.warn(`[Callback Page] determinedRedirectUrl became empty or whitespace. Forcing to /downloads. Original intended from session: '${intendedSessionRedirect}'`);
          determinedRedirectUrl = '/downloads';
      }

      console.log(`[Callback Page] Navigating client-side to final URL: '${determinedRedirectUrl}'`);
      await navigateTo(determinedRedirectUrl);
    } else {
      console.log('[Callback Page] Authentication failed (backend check). Navigating client-side to /sponsor.');
      await navigateTo('/sponsor');
    }
  } catch (error: any) {
    console.error('[Callback Page] Error during authentication process:', error);
    showError({
      statusCode: error.statusCode || 500,
      message: error.statusMessage || 'An unexpected error occurred during authentication.',
      data: error.data
    });
  } finally {
    console.log('[Callback Page] performAuthentication finished.');
    processing.value = false; // Allow potential re-runs if needed?
  }
};

onMounted(() => {
  console.log('[Callback Page] Mounted.');
  if (processing.value) {
    console.log('[Callback Page] Already processing, skipping.');
    return;
  }
  processing.value = true;
  console.log('[Callback Page] Set processing flag to true.');

  if (!checkForErrors()) {
    performAuthentication(); // Call the async function
  } else {
    console.log('[Callback Page] Errors found in query, stopping processing.');
    processing.value = false;
  }
})
</script>
