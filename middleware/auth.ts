import { defineNuxtRouteMiddleware, navigateTo, useCookie, useRuntimeConfig } from '#app'
import { useAuthStore } from '~/stores/auth'
import { jwtDecode } from 'jwt-decode'

enum AuthCheckResultStatus {
  AUTHENTICATED,
  NOT_AUTHENTICATED,
  INVALID_TOKEN_CLEAR_COOKIE
}

interface AuthCheckResult {
  status: AuthCheckResultStatus;
  storeNeedsUpdate: boolean; 
}

async function checkAuthenticationStatus(
  initialStoreAuthStatus: boolean,
  token?: string | null,
  serverSigningKey?: string
): Promise<AuthCheckResult> {
  const logPrefix = '[AuthCheckInternal]';

  if (initialStoreAuthStatus) {
    console.log(`${logPrefix} Store already indicates authenticated.`);
    return { status: AuthCheckResultStatus.AUTHENTICATED, storeNeedsUpdate: false };
  }

  if (!token) {
    console.log(`${logPrefix} No token provided.`);
    return { status: AuthCheckResultStatus.NOT_AUTHENTICATED, storeNeedsUpdate: false };
  }

  let isValidBasedOnCookie = false;

  if (process.server) {
    if (!serverSigningKey) {
      console.warn(`${logPrefix} Server: 'signingKey' not provided. Cannot confirm token validity.`);
      return { status: AuthCheckResultStatus.NOT_AUTHENTICATED, storeNeedsUpdate: false };
    }
    const jwtModule = await import('jsonwebtoken');
    const jwt = jwtModule.default || jwtModule; // Handle CJS/ESM default export
    try {
      const decoded = jwt.verify(token, serverSigningKey) as { access?: boolean };
      if (decoded?.access === true) {
        console.log(`${logPrefix} Server: JWT verified successfully.`);
        isValidBasedOnCookie = true;
      } else {
        console.warn(`${logPrefix} Server: JWT invalid (claim).`);
        return { status: AuthCheckResultStatus.INVALID_TOKEN_CLEAR_COOKIE, storeNeedsUpdate: false };
      }
    } catch (error: any) {
      console.warn(`${logPrefix} Server: JWT verification error: ${error.message}.`);
      return { status: AuthCheckResultStatus.INVALID_TOKEN_CLEAR_COOKIE, storeNeedsUpdate: false };
    }
  } else { // Client-side
    console.log(`${logPrefix} Client: Attempting to decode JWT with jwt-decode.`);
    try {
      const decoded = jwtDecode<{ access?: boolean; exp?: number }>(token);
      if (decoded && decoded.access === true) {
        if (decoded.exp && (decoded.exp * 1000) < Date.now()) {
          console.log(`${logPrefix} Client: JWT decoded, but token is expired.`);
          return { status: AuthCheckResultStatus.INVALID_TOKEN_CLEAR_COOKIE, storeNeedsUpdate: false };
        } else {
          console.log(`${logPrefix} Client: JWT decoded successfully.`);
          isValidBasedOnCookie = true;
        }
      } else {
        console.log(`${logPrefix} Client: JWT decoded, but access claim not true or malformed.`);
        return { status: AuthCheckResultStatus.NOT_AUTHENTICATED, storeNeedsUpdate: false };
      }
    } catch (e: any) {
      console.warn(`${logPrefix} Client: Error decoding JWT: ${e.message}`);
      return { status: AuthCheckResultStatus.INVALID_TOKEN_CLEAR_COOKIE, storeNeedsUpdate: false };
    }
  }

  if (isValidBasedOnCookie) {
    return { status: AuthCheckResultStatus.AUTHENTICATED, storeNeedsUpdate: !initialStoreAuthStatus };
  }
  
  return { status: AuthCheckResultStatus.NOT_AUTHENTICATED, storeNeedsUpdate: false };
}


export default defineNuxtRouteMiddleware(async (to, from) => {
  const logPrefix = '[Auth Middleware]';
  console.log(`${logPrefix} Running for path: ${to.path} (from: ${from.path}) on ${process.server ? 'server' : 'client'}`);
  
  const authStore = useAuthStore();

  // Check for "justLoggedIn" flag (client-side only)
  if (process.client) {
    console.log(`${logPrefix} CLIENT-SIDE: Initial store state before any checks - isAuthenticated: ${authStore.isAuthenticated}`);
    try {
      if (sessionStorage.getItem('justLoggedIn') === 'true') {
        sessionStorage.removeItem('justLoggedIn');
        console.log(`${logPrefix} 'justLoggedIn' flag found and removed.`);
        // Ensure store is marked as authenticated if not already
        if (!authStore.isAuthenticated) {
          authStore.setAuthenticated(true); // Update store state
          console.log(`${logPrefix} Updated authStore to authenticated based on 'justLoggedIn' flag.`);
        }
        console.log(`${logPrefix} Allowing navigation due to 'justLoggedIn' flag.`);
        return; // Allow navigation
      }
    } catch (e) {
      console.warn(`${logPrefix} Error accessing sessionStorage for 'justLoggedIn' flag:`, e);
    }
  }

  const cookieRef = useCookie('builds');
  const tokenFromCookie = cookieRef.value;
  
  const initialStoreAuth = authStore.isAuthenticated;
  console.log(`${logPrefix} Initial store state - isAuthenticated: ${initialStoreAuth}`);

  let signingKeyForServer: string | undefined;
  if (process.server) {
    const config = useRuntimeConfig();
    signingKeyForServer = config.signingKey as string | undefined;
  }

  const authResult = await checkAuthenticationStatus(
    initialStoreAuth,
    tokenFromCookie,
    signingKeyForServer
  );

  let finalIsAuthenticated = false;

  switch (authResult.status) {
    case AuthCheckResultStatus.AUTHENTICATED:
      finalIsAuthenticated = true;
      if (authResult.storeNeedsUpdate) {
        if (typeof authStore.setAuthenticated === 'function') {
          authStore.setAuthenticated(true);
          console.log(`${logPrefix} Updated authStore.isAuthenticated to true via cookie check.`);
        } else {
          console.warn(`${logPrefix} Cookie valid, store out of sync, but no setAuthenticated method on authStore.`);
        }
      }
      break;
    case AuthCheckResultStatus.NOT_AUTHENTICATED:
      finalIsAuthenticated = false;
      // If store thought it was authenticated but cookie says no (and not invalid), correct store.
      if (initialStoreAuth) {
        authStore.setAuthenticated(false);
        console.log(`${logPrefix} Corrected store to not authenticated as cookie was missing/invalid.`);
      }
      break;
    case AuthCheckResultStatus.INVALID_TOKEN_CLEAR_COOKIE:
      finalIsAuthenticated = false;
      console.log(`${logPrefix} Invalid token detected. Clearing 'builds' cookie.`);
      cookieRef.value = null; 
      if (initialStoreAuth || authStore.isAuthenticated) { 
         if (typeof authStore.setAuthenticated === 'function') {
          authStore.setAuthenticated(false);
          console.log(`${logPrefix} Cleared cookie and set store to not authenticated.`);
        }
      }
      break;
  }
  
  console.log(`${logPrefix} Effective authentication status after full check: ${finalIsAuthenticated}`);

  const protectedRoutes = ['/downloads']; 
  const isGoingToProtectedRoute = protectedRoutes.some(route => to.path.startsWith(route));
  console.log(`${logPrefix} Is going to protected route (${to.path}): ${isGoingToProtectedRoute}`);

  if (isGoingToProtectedRoute && !finalIsAuthenticated) {
    console.log(`${logPrefix} Redirecting to /auth/login for protected route.`);
    const intendedRedirect = to.fullPath;
    const redirectPath = intendedRedirect.split('?')[0]; 
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
  }

  console.log(`${logPrefix} Allowing navigation.`);
});