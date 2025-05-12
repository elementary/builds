import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // ssr: true, // Default is true in Nuxt 3
  devtools: { enabled: true }, // Enable Nuxt DevTools
  compatibilityDate: '2025-05-12',

  // Add Pinia & Plausible modules
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/plausible',
  ],

  css: [
    '~/assets/styles/main.scss'
  ],

  runtimeConfig: {
    // Private keys are only available server-side
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    signingKey: process.env.SIGNING_KEY,
    spacesKey: process.env.SPACES_KEY,
    spacesSecret: process.env.SPACES_SECRET,
    // Public keys that are exposed to the client
    public: {
      githubClientId: process.env.GITHUB_CLIENT_ID
    }
  },

  // Migrating plugins requires checking their content and adapting to Nuxt 3 format
  // plugins: [
  //   '~/plugins/auth', // Needs check & potential rewrite
  //   '~/plugins/plausible' // Needs check & potential rewrite (was ignored during build)
  // ],

  // Server middleware needs migration to server/api or server/middleware routes
  // serverMiddleware: {
  //   '/api/download': '~/server/download',
  //   '/api/images': '~/server/images',
  //   '/auth/callback': '~/server/auth-callback',
  //   '/auth/login': '~/server/auth-url'
  // },

  // Head configuration needs migration (e.g., using useHead)
  // head: { ... }

  // Loading indicator needs a different approach (module or custom component)
  // loading: { ... }

  // Components are auto-imported by default
  // components: true,

  plausible: {
    // Required: Specify the domain registered with Plausible
    domain: 'builds.elementary.io',
    // Required: Specify the Plausible API host (if self-hosting or using custom domain)
    //apiHost: 'https://stats.elementary.io',
    // Optional: Disable tracking on localhost (default is true, but be explicit)
    // trackLocalhost: false, 
    // Optional: Auto-track outbound links
    // autoOutboundTracking: true,
  },
}) 