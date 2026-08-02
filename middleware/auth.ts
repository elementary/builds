import { defineNuxtRouteMiddleware, navigateTo, useRequestFetch, createError } from '#app'
import { useAuthStore } from '~/stores/auth'

interface AuthStatus {
  authenticated: boolean;
  user?: { login: string } | null;
}

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  // The 'builds' cookie is httpOnly, so it can't be read (let alone verified)
  // on the client. Authentication is therefore re-validated server-side via
  // /api/auth/status on every navigation; client store state is never trusted
  // as proof. useRequestFetch() forwards the incoming cookies during SSR.
  let status: AuthStatus = { authenticated: false };
  try {
    const apiFetch = import.meta.server ? useRequestFetch() : $fetch;
    status = await apiFetch<AuthStatus>('/api/auth/status');
  } catch (error) {
    // A 5xx means the auth service itself is broken (e.g. server misconfig),
    // not that the user is unauthenticated — surface an error page rather than
    // bouncing them to login.
    const err = error as { statusCode?: number; response?: { status?: number } };
    const statusCode = err.statusCode ?? err.response?.status;
    if (statusCode !== undefined && statusCode >= 500) {
      console.error('[Auth Middleware] /api/auth/status returned a server error:', error);
      throw createError({ statusCode, statusMessage: 'Authentication service unavailable.' });
    }
    console.warn('[Auth Middleware] Auth status check failed:', error);
  }

  // Mirror the authoritative result into the store (drives navbar UI only).
  authStore.setAuthenticated(status.authenticated);
  if (status.authenticated && status.user?.login) {
    authStore.setUser({ login: status.user.login, name: status.user.login });
  }

  if (!status.authenticated) {
    const redirectPath = to.fullPath.split('?')[0] ?? to.fullPath;
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
  }
});
