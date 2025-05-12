import { defineNuxtPlugin, useCookie } from '#app'
import { useAuthStore } from '~/stores/auth'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  exp?: number;
  user?: {
    login?: string;
  };
}

export default defineNuxtPlugin(async (nuxtApp) => {
  // This plugin runs once on the client after the app initializes.
  if (process.server) {
    return; // Don't run on server
  }

  console.log('Auth plugin: Initializing client-side auth state...');

  const authStore = useAuthStore();
  const tokenCookie = useCookie<string | undefined>('builds');

  const token = tokenCookie.value;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const expires = decoded.exp ? decoded.exp * 1000 : 0; // Convert JWT seconds to JS milliseconds
      const now = Date.now();

      if (expires > now) {
        // Token exists and is not expired
        console.log('Auth plugin: Valid token found in cookie. Setting store state.');
        authStore.isAuthenticated = true;
        authStore.user = decoded.user ? { login: decoded.user.login || 'unknown', name: decoded.user.login || 'unknown' } : null; 
        // NOTE: This user info is from the JWT payload, not freshly fetched.
      } else {
        // Token is expired
        console.log('Auth plugin: Token found but expired.');
        tokenCookie.value = undefined; // Clear the expired cookie
        authStore.isAuthenticated = false;
        authStore.user = null;
      }
    } catch (error) {
      // Invalid token format
      console.error('Auth plugin: Error decoding token:', error);
      tokenCookie.value = undefined; // Clear the invalid cookie
      authStore.isAuthenticated = false;
      authStore.user = null;
    }
  } else {
    // No token found
    console.log('Auth plugin: No token found in cookie.');
    authStore.isAuthenticated = false;
    authStore.user = null;
  }
}); 