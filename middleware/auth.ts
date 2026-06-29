import { defineNuxtRouteMiddleware, navigateTo, useRequestFetch } from '#app'
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
