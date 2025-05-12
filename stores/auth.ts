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
        return null;
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

    logout() {
      console.log('[Auth Store] logout action called.');
      this.isAuthenticated = false;
      this.user = null;
    }
  }
}); 