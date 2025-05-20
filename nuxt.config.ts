import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true }, // Enable Nuxt DevTools
  compatibilityDate: '2025-05-12',

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

  // @ts-expect-error: Plausible module adds this key directly
  plausible: {
    // Required: Specify the domain registered with Plausible
    domain: 'builds.elementary.io',
    // Optional: Specify the Plausible API host (if self-hosting or using custom domain)
    //apiHost: 'https://stats.elementary.io',
    // Optional: Auto-track outbound links
    //autoOutboundTracking: true,
  },
}) 