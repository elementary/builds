import { defineStore } from 'pinia'
import { ofetch } from 'ofetch'

interface User {
  login: string;
  name: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    user: null as User | null,
  }),

  actions: {
    async fetchLoginUrl() {
      console.log('[Auth Store] fetchLoginUrl action called.');
      try {
        const data = await ofetch<{ url: string }>('/api/auth/login');
        console.log('[Auth Store] fetchLoginUrl success.');
        return data.url;
      } catch (error) {
        console.error('[Auth Store] Error fetching login URL:', error);
        // Rethrow so the caller can surface the failure to the user instead of
        // silently sitting on "Logging in to GitHub...".
        throw error;
      }
    },

    async authenticate(code: string): Promise<boolean> {
      console.log('[Auth Store] authenticate action called with code.');
      if (!code) {
        console.error('[Auth Store] Authentication code is missing.');
        return false;
      }

      try {
        console.log('[Auth Store] Sending POST to /api/auth/callback...');
        const response = await ofetch<{ success: boolean; user?: User }>('/api/auth/callback', {
          method: 'POST',
          body: { code }
        });
        console.log('[Auth Store] Received response from /api/auth/callback:', response);

        if (response.success && response.user) {
          console.log(`[Auth Store] Auth success backend. Setting state for user: ${response.user.login}`);
          this.isAuthenticated = true;
          this.user = response.user;
          return true;
        } else {
          console.error('[Auth Store] Authentication failed on backend response.', response);
          this.isAuthenticated = false;
          this.user = null;
          return false;
        }
      } catch (error) {
        console.error('[Auth Store] Error during authenticate request:', error);
        this.isAuthenticated = false;
        this.user = null;
        return false;
      }
    },

    /**
     * Sets the authentication status.
     * @param {boolean} status - The new authentication status.
     */
    setAuthenticated(status: boolean) {
      if (this.isAuthenticated === status) return; // Avoid unnecessary changes and logs

      this.isAuthenticated = status;
      if (status) {
        console.log('[AuthStore] Authentication status set to true.');
      } else {
        console.log('[AuthStore] Authentication status set to false.');
        // If becoming unauthenticated, also clear the user
        this.user = null;
      }
    },

    /**
     * Sets the user information in the store.
     * @param {User | null} userData - The user object or null.
     */
    setUser(userData: User | null) {
      // Basic check to see if user data actually changed to avoid excessive logging/updates
      if (JSON.stringify(this.user) === JSON.stringify(userData)) return;

      this.user = userData;
      if (userData) {
        console.log(`[AuthStore] User set to: ${userData.login}`);
      } else {
        console.log('[AuthStore] User set to null.');
      }
    },

    /**
     * Initializes the authentication state.
     * This version is simplified; robust checking is in middleware.
     * Consider calling this from a Nuxt plugin on app load if needed.
     */
    initializeAuth() {
      const logPrefix = '[AuthStore InitializeAuth]';
      console.log(`${logPrefix} initializeAuth called. Current state: ${this.isAuthenticated}. Relies on middleware for robust check.`);
    },

    async logout() {
      console.log('[AuthStore] Logout action called.');
      // The 'builds' cookie is httpOnly, so it must be cleared by the server.
      try {
        await ofetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('[AuthStore] Error clearing auth cookie on logout:', error);
      }
      this.setAuthenticated(false); // This will also clear the user via setAuthenticated logic
    }
  }
});