import { defineNuxtRouteMiddleware, navigateTo, useCookie } from '#app'
import { useAuthStore } from '~/stores/auth'
// import jwt from 'jsonwebtoken' // Remove: Verification happens server-side

export default defineNuxtRouteMiddleware(async (to, from) => {
  const logPrefix = '[Auth Middleware]';
  console.log(`${logPrefix} Running for path: ${to.path} (from: ${from.path})`);

  if (process.server) {
    console.log(`${logPrefix} Skipping on server.`);
    return;
  }

  const authStore = useAuthStore();
  const storeIsAuthenticated = authStore.isAuthenticated;
  console.log(`${logPrefix} Store state - isAuthenticated: ${storeIsAuthenticated}`);

  if (storeIsAuthenticated) {
    console.log(`${logPrefix} Allowing navigation based on store state.`);
    return; 
  }

  // Store state is false, check cookie
  console.log(`${logPrefix} Store state is false. Checking cookie...`);
  const tokenCookie = useCookie<string | undefined>('builds');
  const hasToken = !!tokenCookie.value;
  console.log(`${logPrefix} Cookie 'builds' found: ${hasToken}`);

  // Define protected routes
  const protectedRoutes = ['/downloads'];
  const isGoingToProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route));
  console.log(`${logPrefix} Is going to protected route (${to.path}): ${isGoingToProtectedRoute}`);

  // If NO store auth AND NO cookie, and going to a protected route, redirect
  if (!storeIsAuthenticated && !hasToken && isGoingToProtectedRoute) {
    console.log(`${logPrefix} Condition met: (!storeIsAuthenticated && !hasToken && isGoingToProtectedRoute). Redirecting to /auth/login.`);
    const intendedRedirect = to.fullPath;
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(intendedRedirect)}`);
  }

  // If we reach here, either:
  // 1. Store was false, but cookie was found (hasToken = true) -> Allow (server verifies)
  // 2. Route is not protected -> Allow
  console.log(`${logPrefix} Allowing navigation (Reason: hasToken=${hasToken}, isProtected=${isGoingToProtectedRoute}, storeAuth=${storeIsAuthenticated})`);
}); 