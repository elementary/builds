import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const logPrefix = '[Auth Middleware]';
  console.log(`${logPrefix} Running for path: ${to.path} (from: ${from.path})`);

  // Removed the explicit server-side skip to allow auth checks during SSR.
  // if (process.server) {
  //   console.log(`${logPrefix} Skipping on server.`);
  //   return;
  // }

  const authStore = useAuthStore();
  const storeIsAuthenticated = authStore.isAuthenticated;
  console.log(`${logPrefix} Store state - isAuthenticated: ${storeIsAuthenticated}`);

  // Define protected routes
  const protectedRoutes = ['/downloads']; 
  const isGoingToProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route));
  console.log(`${logPrefix} Is going to protected route (${to.path}): ${isGoingToProtectedRoute}`);

  // If the route is protected and the user is not authenticated according to the store, redirect to login
  if (isGoingToProtectedRoute && !storeIsAuthenticated) {
    console.log(`${logPrefix} Condition met: (isGoingToProtectedRoute && !storeIsAuthenticated). Redirecting to /auth/login.`);
    const intendedRedirect = to.fullPath;
    // Clear query parameters from the redirect URL to avoid potential issues
    const redirectPath = intendedRedirect.split('?')[0]; 
    // navigateTo should handle both client-side and server-side internal redirects.
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
  }

  // Otherwise, allow navigation
  console.log(`${logPrefix} Allowing navigation.`);
});