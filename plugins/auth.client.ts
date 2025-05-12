import { defineNuxtPlugin, useCookie } from '#app'
import { useAuthStore } from '~/stores/auth'
import { jwtDecode } from 'jwt-decode'

interface JwtUserPayload {
  login?: string;
}
interface JwtPayload {
  exp?: number;
  access?: boolean;
  user?: JwtUserPayload;
}

export default defineNuxtPlugin(async (nuxtApp) => {
  if (process.server) {
    return; 
  }

  const logPrefix = '[AuthClientPlugin]';
  console.log(`${logPrefix} Initializing client-side auth state...`);

  const authStore = useAuthStore();

  // If the store is already authenticated (e.g., by SSR hydration), trust that first.
  // The middleware will still perform its checks if needed for subsequent navigations.
  if (authStore.isAuthenticated) {
    console.log(`${logPrefix} Store is already authenticated (likely from SSR). Plugin will not re-evaluate cookie now.`);
    console.log(`${logPrefix} Client-side auth state (pre-hydrated). Store isAuthenticated: ${authStore.isAuthenticated}`);
    return;
  }

  // If store is not authenticated, then try to validate cookie.
  console.log(`${logPrefix} Store not authenticated. Checking cookie...`);
  const tokenCookie = useCookie<string | undefined>('builds');
  const token = tokenCookie.value;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      console.log(`${logPrefix} Decoded token payload:`, JSON.stringify(decoded));

      const expires = decoded.exp ? decoded.exp * 1000 : 0;
      const now = Date.now();
      const hasAccessClaim = decoded.access === true;
      
      console.log(`${logPrefix} Token 'access' claim: ${decoded.access}, 'exp' claim: ${decoded.exp} (raw), expires_ms: ${expires}, now_ms: ${now}`);

      if (hasAccessClaim && expires > now) {
        console.log(`${logPrefix} Valid token found by plugin. Setting store state.`);
        authStore.setAuthenticated(true);
        
        if (decoded.user && decoded.user.login) {
          authStore.setUser({ 
            login: decoded.user.login, 
            name: decoded.user.login 
          });
        } else {
          authStore.setUser(null);
        }
      } else {
        if (!hasAccessClaim) {
          console.log(`${logPrefix} Token invalid via plugin (access claim: ${decoded.access}).`);
        }
        if (expires <= now) {
          console.log(`${logPrefix} Token expired via plugin (expires: ${new Date(expires).toISOString()}, now: ${new Date(now).toISOString()}).`);
        }
        tokenCookie.value = undefined; 
        // authStore.setAuthenticated(false); // Store is already false or will be set by this
      }
    } catch (error) {
      console.error(`${logPrefix} Error decoding token via plugin:`, error);
      tokenCookie.value = undefined; 
      // authStore.setAuthenticated(false); // Store is already false
    }
  } else {
    console.log(`${logPrefix} No token found by plugin.`);
    // authStore.setAuthenticated(false); // Store is already false
  }

  // If after all checks by the plugin, the store is still false, ensure it's explicitly set.
  // This handles cases where the cookie was invalid/expired and cleared by the plugin.
  if (!authStore.isAuthenticated && tokenCookie.value === undefined) {
      authStore.setAuthenticated(false);
  }

  console.log(`${logPrefix} Client-side auth state initialized by plugin. Store isAuthenticated: ${authStore.isAuthenticated}`);
});